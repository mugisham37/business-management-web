import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { 
  QUEUE_PERMISSION_KEY, 
  QUEUE_TENANT_KEY, 
  QUEUE_RATE_LIMIT_KEY,
  QUEUE_VALIDATION_KEY 
} from '../decorators/queue.decorators';
import { QueueType, JobPriority } from '../types/queue.types';
import { CustomLoggerService } from '../../logger/logger.service';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class QueuePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueuePermissionGuard');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(QUEUE_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true; // No permission required
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user) {
      this.logger.warn('Queue access denied: No user found', {
        requiredPermission,
        handler: context.getHandler().name,
      });
      throw new UnauthorizedException('Authentication required for queue operations');
    }

    const hasPermission = this.checkUserPermission(user, requiredPermission);

    if (!hasPermission) {
      this.logger.warn('Queue access denied: Insufficient permissions', {
        userId: user.id,
        requiredPermission,
        userPermissions: user.permissions || [],
        handler: context.getHandler().name,
      });
      throw new ForbiddenException(`Insufficient permissions for queue operation: ${requiredPermission}`);
    }

    this.logger.debug('Queue access granted', {
      userId: user.id,
      requiredPermission,
      handler: context.getHandler().name,
    });

    return true;
  }

  private checkUserPermission(user: any, requiredPermission: string): boolean {
    if (!user.permissions) {
      return false;
    }

    // Check for exact permission match
    if (user.permissions.includes(requiredPermission)) {
      return true;
    }

    // Check for admin permissions
    if (user.permissions.includes('queue:admin') || user.permissions.includes('admin')) {
      return true;
    }

    // Check for wildcard permissions
    const permissionParts = requiredPermission.split(':');
    for (let i = permissionParts.length - 1; i > 0; i--) {
      const wildcardPermission = permissionParts.slice(0, i).join(':') + ':*';
      if (user.permissions.includes(wildcardPermission)) {
        return true;
      }
    }

    return false;
  }
}

@Injectable()
export class QueueTenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueTenantGuard');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requireTenantIsolation = this.reflector.getAllAndOverride<boolean>(QUEUE_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If tenant isolation is not required or explicitly disabled, allow access
    if (requireTenantIsolation === false) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required for tenant-isolated queue operations');
    }

    const userTenantId = user.tenantId || request.tenant;
    
    if (!userTenantId) {
      this.logger.warn('Queue access denied: No tenant context', {
        userId: user.id,
        handler: context.getHandler().name,
      });
      throw new ForbiddenException('Tenant context required for queue operations');
    }

    // Check if the operation involves tenant-specific data
    const requestTenantId = this.extractTenantFromArgs(args);
    
    if (requestTenantId && requestTenantId !== userTenantId) {
      // Allow super admin to access cross-tenant data
      if (user.permissions?.includes('super:admin')) {
        this.logger.debug('Cross-tenant queue access granted to super admin', {
          userId: user.id,
          userTenantId,
          requestTenantId,
          handler: context.getHandler().name,
        });
        return true;
      }

      this.logger.warn('Queue access denied: Tenant mismatch', {
        userId: user.id,
        userTenantId,
        requestTenantId,
        handler: context.getHandler().name,
      });
      throw new ForbiddenException('Access denied: Tenant isolation violation');
    }

    // Inject tenant context into request for downstream use
    request.tenantContext = {
      tenantId: userTenantId,
      enforced: true,
    };

    return true;
  }

  private extractTenantFromArgs(args: any): string | null {
    // Check various argument structures for tenant ID
    if (args.tenantId) return args.tenantId;
    if (args.input?.tenantId) return args.input.tenantId;
    if (args.filter?.tenantId) return args.filter.tenantId;
    if (args.data?.tenantId) return args.data.tenantId;
    if (args.emailData?.tenantId) return args.emailData.tenantId;
    if (args.reportData?.tenantId) return args.reportData.tenantId;
    if (args.syncData?.tenantId) return args.syncData.tenantId;
    if (args.notificationData?.tenantId) return args.notificationData.tenantId;
    if (args.analyticsData?.tenantId) return args.analyticsData.tenantId;
    
    return null;
  }
}

@Injectable()
export class QueueRateLimitGuard implements CanActivate {
  private readonly rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
    private cacheService?: CacheService,
  ) {
    this.logger.setContext('QueueRateLimitGuard');
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanupExpiredEntries(), 60000);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.getAllAndOverride<any>(QUEUE_RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rateLimitOptions) {
      return true; // No rate limiting configured
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    const key = this.generateRateLimitKey(rateLimitOptions.keyGenerator, request, user);
    const now = Date.now();
    const windowStart = now - rateLimitOptions.windowMs;

    let rateLimitData;
    
    if (this.cacheService) {
      // Use Redis for distributed rate limiting
      rateLimitData = await this.getDistributedRateLimit(key, rateLimitOptions, now);
    } else {
      // Use in-memory rate limiting
      rateLimitData = this.getLocalRateLimit(key, rateLimitOptions, now, windowStart);
    }

    if (rateLimitData.count > rateLimitOptions.maxRequests) {
      const resetTime = new Date(rateLimitData.resetTime);
      
      this.logger.warn('Queue rate limit exceeded', {
        key,
        count: rateLimitData.count,
        maxRequests: rateLimitOptions.maxRequests,
        resetTime,
        userId: user?.id,
        handler: context.getHandler().name,
      });

      throw new ForbiddenException(
        `Rate limit exceeded. Maximum ${rateLimitOptions.maxRequests} requests per ${rateLimitOptions.windowMs}ms. Reset at ${resetTime.toISOString()}`
      );
    }

    // Add rate limit headers to response
    const response = ctx.getContext().res;
    if (response) {
      response.set({
        'X-RateLimit-Limit': rateLimitOptions.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, rateLimitOptions.maxRequests - rateLimitData.count).toString(),
        'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString(),
      });
    }

    return true;
  }

  private generateRateLimitKey(keyGenerator: string, request: any, user: any): string {
    switch (keyGenerator) {
      case 'user':
        return `queue:ratelimit:user:${user?.id || 'anonymous'}`;
      case 'tenant':
        return `queue:ratelimit:tenant:${user?.tenantId || request.tenant || 'default'}`;
      case 'ip':
        return `queue:ratelimit:ip:${request.ip}`;
      default:
        return `queue:ratelimit:global`;
    }
  }

  private async getDistributedRateLimit(key: string, options: any, now: number): Promise<{ count: number; resetTime: number }> {
    const windowStart = now - options.windowMs;
    const resetTime = now + options.windowMs;

    try {
      // Use Redis sorted sets for sliding window rate limiting
      const pipeline = (this.cacheService as any).redis.pipeline();
      
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Count requests in current window
      pipeline.zcard(key);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(options.windowMs / 1000));
      
      const results = await pipeline.exec();
      const count = results[2][1] as number;

      return { count, resetTime };
    } catch (error) {
      this.logger.error('Failed to check distributed rate limit', error instanceof Error ? error.message : String(error));
      // Fallback to local rate limiting
      return this.getLocalRateLimit(key, options, now, windowStart);
    }
  }

  private getLocalRateLimit(key: string, options: any, now: number, windowStart: number): { count: number; resetTime: number } {
    let entry = this.rateLimitStore.get(key);
    
    if (!entry || entry.resetTime <= now) {
      // Create new window
      entry = {
        count: 1,
        resetTime: now + options.windowMs,
      };
    } else {
      // Increment count in current window
      entry.count++;
    }

    this.rateLimitStore.set(key, entry);
    
    return entry;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (entry.resetTime <= now) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

@Injectable()
export class QueueValidationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueValidationGuard');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const validationOptions = this.reflector.getAllAndOverride<any>(QUEUE_VALIDATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!validationOptions) {
      return true; // No validation required
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();
    const user = request.user;

    try {
      // Validate tenant context
      if (validationOptions.validateTenant) {
        this.validateTenantContext(user, args);
      }

      // Validate user context
      if (validationOptions.validateUser) {
        this.validateUserContext(user, args);
      }

      // Validate permissions
      if (validationOptions.validatePermissions) {
        this.validatePermissions(user, args);
      }

      // Run custom validators
      if (validationOptions.customValidators) {
        this.runCustomValidators(validationOptions.customValidators, args, user);
      }

      return true;
    } catch (error) {
      this.logger.warn('Queue validation failed', {
        error: error instanceof Error ? error.message : String(error),
        userId: user?.id,
        handler: context.getHandler().name,
        validationOptions,
      });
      throw error;
    }
  }

  private validateTenantContext(user: any, args: any): void {
    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context required for queue operations');
    }

    const argTenantId = this.extractTenantFromArgs(args);
    if (argTenantId && argTenantId !== user.tenantId) {
      if (!user.permissions?.includes('super:admin')) {
        throw new ForbiddenException('Tenant mismatch in queue operation');
      }
    }
  }

  private validateUserContext(user: any, args: any): void {
    if (!user?.id) {
      throw new UnauthorizedException('User authentication required for queue operations');
    }

    // Validate user is active
    if (user.status && user.status !== 'active') {
      throw new ForbiddenException('User account is not active');
    }
  }

  private validatePermissions(user: any, args: any): void {
    if (!user?.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException('User permissions not found');
    }

    // Extract queue type from arguments to validate specific permissions
    const queueType = this.extractQueueTypeFromArgs(args);
    if (queueType) {
      const requiredPermission = `queue:${queueType.toLowerCase()}:access`;
      if (!user.permissions.includes(requiredPermission) && 
          !user.permissions.includes('queue:admin') && 
          !user.permissions.includes('admin')) {
        throw new ForbiddenException(`Permission required: ${requiredPermission}`);
      }
    }
  }

  private runCustomValidators(validators: string[], args: any, user: any): void {
    for (const validator of validators) {
      switch (validator) {
        case 'jobDataValidator':
          this.validateJobData(args);
          break;
        case 'bulkOperationValidator':
          this.validateBulkOperation(args);
          break;
        case 'priorityValidator':
          this.validateJobPriority(args, user);
          break;
        default:
          this.logger.warn(`Unknown validator: ${validator}`);
      }
    }
  }

  private validateJobData(args: any): void {
    // Validate job data structure and content
    const jobData = args.data || args.input?.data || args.emailData || args.reportData || args.syncData || args.notificationData || args.analyticsData;
    
    if (!jobData) {
      throw new ForbiddenException('Job data is required');
    }

    // Check for sensitive data in job payload
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey'];
    const jsonString = JSON.stringify(jobData).toLowerCase();
    
    for (const field of sensitiveFields) {
      if (jsonString.includes(field)) {
        this.logger.warn('Potential sensitive data detected in job payload', { field });
        // Don't throw error, just log for security monitoring
      }
    }

    // Validate payload size (max 1MB)
    const payloadSize = Buffer.byteLength(JSON.stringify(jobData), 'utf8');
    if (payloadSize > 1024 * 1024) {
      throw new ForbiddenException('Job payload too large (max 1MB)');
    }
  }

  private validateBulkOperation(args: any): void {
    const jobs = args.jobs || args.jobIds;
    
    if (!jobs || !Array.isArray(jobs)) {
      throw new ForbiddenException('Bulk operation requires array of jobs');
    }

    // Limit bulk operations to prevent abuse
    if (jobs.length > 100) {
      throw new ForbiddenException('Bulk operation limited to 100 items');
    }

    if (jobs.length === 0) {
      throw new ForbiddenException('Bulk operation requires at least one item');
    }
  }

  private validateJobPriority(args: any, user: any): void {
    const priority = args.options?.priority || args.input?.options?.priority;
    
    if (priority && (priority === JobPriority.CRITICAL || priority === JobPriority.URGENT)) {
      // Only admins can create high priority jobs
      if (!user.permissions?.includes('queue:admin') && !user.permissions?.includes('admin')) {
        throw new ForbiddenException('Insufficient permissions for high priority jobs');
      }
    }
  }

  private extractTenantFromArgs(args: any): string | null {
    return args.tenantId || args.input?.tenantId || args.filter?.tenantId || 
           args.emailData?.tenantId || args.reportData?.tenantId || 
           args.syncData?.tenantId || args.notificationData?.tenantId || 
           args.analyticsData?.tenantId || null;
  }

  private extractQueueTypeFromArgs(args: any): string | null {
    return args.queueType || args.input?.queueType || args.filter?.queueTypes?.[0] || null;
  }
}

@Injectable()
export class QueueHealthGuard implements CanActivate {
  constructor(
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueHealthGuard');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // This guard can be used to check queue health before allowing operations
    // For now, it's a placeholder that always allows access
    // In production, you might want to check:
    // - Redis connectivity
    // - Queue memory usage
    // - Processing capacity
    // - Error rates
    
    return true;
  }
}

@Injectable()
export class QueueMaintenanceGuard implements CanActivate {
  private maintenanceMode = false;
  private allowedOperations = ['getQueues', 'getQueueStats', 'getJobs'];

  constructor(
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueMaintenanceGuard');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.maintenanceMode) {
      return true;
    }

    const handler = context.getHandler();
    const operationName = handler.name;

    if (this.allowedOperations.includes(operationName)) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    // Allow admins to perform operations during maintenance
    if (user?.permissions?.includes('queue:admin') || user?.permissions?.includes('admin')) {
      this.logger.debug('Admin operation allowed during maintenance', {
        userId: user.id,
        operation: operationName,
      });
      return true;
    }

    this.logger.warn('Operation blocked due to maintenance mode', {
      operation: operationName,
      userId: user?.id,
    });

    throw new ForbiddenException('Queue system is currently in maintenance mode');
  }

  setMaintenanceMode(enabled: boolean): void {
    this.maintenanceMode = enabled;
    this.logger.log(`Queue maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  isMaintenanceMode(): boolean {
    return this.maintenanceMode;
  }
}