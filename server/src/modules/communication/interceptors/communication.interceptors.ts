import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, timeout, retry, map } from 'rxjs/operators';

@Injectable()
export class CommunicationLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();
    const user = request.user;
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    const startTime = Date.now();
    const requestId = request.id || `req_${Date.now()}`;

    // Extract communication metadata
    const metadata = {
      requestId,
      tenantId: user?.tenantId,
      userId: user?.id,
      operation: `${className}.${handlerName}`,
      channel: this.extractChannel(args),
      priority: this.extractPriority(args),
      recipientCount: this.extractRecipientCount(args),
      hasTemplate: this.hasTemplate(args),
      isScheduled: this.isScheduled(args),
    };

    this.logger.log(`Communication request started`, metadata);

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        this.logger.log(`Communication request completed`, {
          ...metadata,
          duration,
          success: this.isSuccessResult(result),
          messageId: this.extractMessageId(result),
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`Communication request failed`, error.stack, {
          ...metadata,
          duration,
          error: error.message,
        });
        return throwError(() => error);
      }),
    );
  }

  private extractChannel(args: any): string | undefined {
    if (args.channel) return args.channel;
    if (args.channels && Array.isArray(args.channels)) return args.channels[0];
    if (args.notification?.channels) return args.notification.channels[0];
    if (args.message?.channel) return args.message.channel;
    return undefined;
  }

  private extractPriority(args: any): string | undefined {
    if (args.priority) return args.priority;
    if (args.notification?.priority) return args.notification.priority;
    if (args.message?.priority) return args.message.priority;
    if (args.alert?.severity) return args.alert.severity;
    return undefined;
  }

  private extractRecipientCount(args: any): number {
    if (args.userIds && Array.isArray(args.userIds)) return args.userIds.length;
    if (args.phoneNumbers && Array.isArray(args.phoneNumbers)) return args.phoneNumbers.length;
    if (args.message?.to && Array.isArray(args.message.to)) return args.message.to.length;
    if (args.notification?.recipients?.userIds) return args.notification.recipients.userIds.length;
    return 1; // Default to 1 for single recipient operations
  }

  private hasTemplate(args: any): boolean {
    return !!(args.templateName || args.notification?.templateName || args.template?.name);
  }

  private isScheduled(args: any): boolean {
    return !!(args.scheduledAt || args.notification?.scheduledAt || args.message?.scheduledAt);
  }

  private isSuccessResult(result: any): boolean {
    if (result?.success !== undefined) return result.success;
    if (result?.overallSuccess !== undefined) return result.overallSuccess;
    if (result?.totalSent !== undefined) return result.totalSent > 0;
    return true; // Assume success if no clear indicator
  }

  private extractMessageId(result: any): string | undefined {
    return result?.messageId || result?.results?.[0]?.messageId;
  }
}

@Injectable()
export class CommunicationMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationMetricsInterceptor.name);
  private metrics = new Map<string, { count: number; totalDuration: number; errors: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();
    const user = request.user;
    const handlerName = context.getHandler().name;

    const startTime = Date.now();
    const metricKey = `${user?.tenantId || 'unknown'}:${handlerName}`;

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        this.updateMetrics(metricKey, duration, true);
        
        // Log performance metrics periodically
        if (Math.random() < 0.01) { // 1% sampling
          this.logMetrics();
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.updateMetrics(metricKey, duration, false);
        return throwError(() => error);
      }),
    );
  }

  private updateMetrics(key: string, duration: number, success: boolean): void {
    const current = this.metrics.get(key) || { count: 0, totalDuration: 0, errors: 0 };
    
    current.count++;
    current.totalDuration += duration;
    if (!success) {
      current.errors++;
    }
    
    this.metrics.set(key, current);
  }

  private logMetrics(): void {
    const summary = Array.from(this.metrics.entries()).map(([key, metrics]) => ({
      key,
      count: metrics.count,
      averageDuration: Math.round(metrics.totalDuration / metrics.count),
      errorRate: Math.round((metrics.errors / metrics.count) * 100),
    }));

    this.logger.log('Communication metrics summary', { summary });
  }
}

@Injectable()
export class CommunicationRetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationRetryInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    
    // Extract retry configuration from options
    const retryAttempts = args.options?.retryAttempts || 3;
    const timeoutMs = args.options?.timeout || 30000;

    return next.handle().pipe(
      timeout(timeoutMs),
      retry({
        count: retryAttempts,
        delay: (error, retryCount) => {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Exponential backoff, max 10s
          
          this.logger.warn(`Communication operation failed, retrying in ${delay}ms`, {
            attempt: retryCount,
            maxAttempts: retryAttempts,
            error: error.message,
          });
          
          return new Promise(resolve => setTimeout(resolve, delay));
        },
      }),
      catchError((error) => {
        this.logger.error(`Communication operation failed after ${retryAttempts} attempts`, error.stack);
        return throwError(() => error);
      }),
    );
  }
}

@Injectable()
export class CommunicationValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationValidationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();

    // Validate message content length
    this.validateContentLength(args);
    
    // Validate recipient limits
    this.validateRecipientLimits(args);
    
    // Validate scheduling constraints
    this.validateScheduling(args);
    
    // Validate template variables
    this.validateTemplateVariables(args);

    return next.handle();
  }

  private validateContentLength(args: any): void {
    const maxLengths = {
      sms: 1600,
      email_subject: 200,
      email_body: 100000,
      slack: 4000,
      teams: 8000,
    };

    // Check SMS message length
    if (args.message?.message && args.message.message.length > maxLengths.sms) {
      throw new Error(`SMS message too long: ${args.message.message.length} characters (max: ${maxLengths.sms})`);
    }

    // Check email subject length
    if (args.message?.subject && args.message.subject.length > maxLengths.email_subject) {
      throw new Error(`Email subject too long: ${args.message.subject.length} characters (max: ${maxLengths.email_subject})`);
    }

    // Check Slack message length
    if (args.message?.text && args.message.text.length > maxLengths.slack) {
      throw new Error(`Slack message too long: ${args.message.text.length} characters (max: ${maxLengths.slack})`);
    }
  }

  private validateRecipientLimits(args: any): void {
    const maxRecipients = {
      email: 1000,
      sms: 500,
      slack: 1,
      teams: 1,
    };

    // Check bulk operation limits
    if (args.userIds && Array.isArray(args.userIds)) {
      const count = args.userIds.length;
      if (count > 1000) { // Global limit
        throw new Error(`Too many recipients: ${count} (max: 1000)`);
      }
    }

    if (args.phoneNumbers && Array.isArray(args.phoneNumbers)) {
      const count = args.phoneNumbers.length;
      if (count > maxRecipients.sms) {
        throw new Error(`Too many SMS recipients: ${count} (max: ${maxRecipients.sms})`);
      }
    }

    if (args.message?.to && Array.isArray(args.message.to)) {
      const count = args.message.to.length;
      if (count > maxRecipients.email) {
        throw new Error(`Too many email recipients: ${count} (max: ${maxRecipients.email})`);
      }
    }
  }

  private validateScheduling(args: any): void {
    const scheduledAt = args.scheduledAt || args.notification?.scheduledAt || args.message?.scheduledAt;
    
    if (scheduledAt) {
      const scheduleTime = new Date(scheduledAt);
      const now = new Date();
      const maxFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

      if (scheduleTime <= now) {
        throw new Error('Scheduled time must be in the future');
      }

      if (scheduleTime > maxFuture) {
        throw new Error('Cannot schedule more than 1 year in advance');
      }
    }
  }

  private validateTemplateVariables(args: any): void {
    const templateName = args.templateName || args.notification?.templateName;
    const templateVariables = args.templateVariables || args.notification?.templateVariables;

    if (templateName && templateVariables) {
      // This would typically validate against template schema from database
      // For now, just check for common required variables
      const requiredVariables = ['firstName', 'lastName']; // Example
      
      for (const required of requiredVariables) {
        if (templateVariables[required] === undefined) {
          this.logger.warn(`Missing template variable: ${required}`, {
            templateName,
            providedVariables: Object.keys(templateVariables),
          });
        }
      }
    }
  }
}

@Injectable()
export class CommunicationCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationCacheInterceptor.name);
  private cache = new Map<string, { data: any; expiry: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const handlerName = context.getHandler().name;

    // Only cache read operations
    if (!handlerName.startsWith('get') && !handlerName.includes('Templates') && !handlerName.includes('Providers')) {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(context, request);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return new Observable(observer => {
        observer.next(cached.data);
        observer.complete();
      });
    }

    return next.handle().pipe(
      tap((result) => {
        // Cache for 5 minutes
        const expiry = Date.now() + 5 * 60 * 1000;
        this.cache.set(cacheKey, { data: result, expiry });
        this.logger.debug(`Cached result for ${cacheKey}`);
      }),
    );
  }

  private generateCacheKey(context: ExecutionContext, request: any): string {
    const handlerName = context.getHandler().name;
    const tenantId = request.user?.tenantId || 'unknown';
    const args = GqlExecutionContext.create(context).getArgs();
    
    // Create a simple hash of the arguments
    const argsHash = JSON.stringify(args);
    return `${tenantId}:${handlerName}:${argsHash}`;
  }
}

@Injectable()
export class CommunicationTransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationTransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();

    // Add request metadata to args
    if (request.user) {
      args._metadata = {
        tenantId: request.user.tenantId,
        userId: request.user.id,
        requestId: request.id || `req_${Date.now()}`,
        timestamp: new Date(),
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
      };
    }

    return next.handle().pipe(
      map((result) => {
        // Transform result to include additional metadata
        if (result && typeof result === 'object') {
          return {
            ...result,
            _metadata: {
              processedAt: new Date(),
              processingTime: Date.now() - (args._metadata?.timestamp?.getTime() || Date.now()),
              version: '1.0.0',
            },
          };
        }
        return result;
      }),
    );
  }
}

@Injectable()
export class CommunicationSecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommunicationSecurityInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();

    // Sanitize sensitive data in logs
    this.sanitizeArgs(args);
    
    // Check for suspicious patterns
    this.checkSuspiciousActivity(request, args);
    
    // Rate limiting per IP
    this.checkIPRateLimit(request);

    return next.handle().pipe(
      map((result) => {
        // Sanitize sensitive data in response
        return this.sanitizeResponse(result);
      }),
    );
  }

  private sanitizeArgs(args: any): void {
    // Remove or mask sensitive information
    if (args.config) {
      if (args.config.apiKey) args.config.apiKey = '***masked***';
      if (args.config.authToken) args.config.authToken = '***masked***';
      if (args.config.secretAccessKey) args.config.secretAccessKey = '***masked***';
    }

    if (args.provider?.configuration) {
      const config = args.provider.configuration;
      if (config.apiKey) config.apiKey = '***masked***';
      if (config.authToken) config.authToken = '***masked***';
      if (config.secretAccessKey) config.secretAccessKey = '***masked***';
    }
  }

  private checkSuspiciousActivity(request: any, args: any): void {
    const suspiciousPatterns = [
      /script\s*>/i,
      /<iframe/i,
      /javascript:/i,
      /on\w+\s*=/i,
    ];

    const content = JSON.stringify(args);
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        this.logger.warn('Suspicious content detected', {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          tenantId: request.user?.tenantId,
          pattern: pattern.toString(),
        });
        break;
      }
    }
  }

  private ipRateLimits = new Map<string, { count: number; resetTime: number }>();

  private checkIPRateLimit(request: any): void {
    const ip = request.ip;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // 100 requests per minute per IP

    let ipData = this.ipRateLimits.get(ip);
    
    if (!ipData || ipData.resetTime <= now) {
      ipData = { count: 1, resetTime: now + windowMs };
      this.ipRateLimits.set(ip, ipData);
      return;
    }

    if (ipData.count >= maxRequests) {
      this.logger.warn('IP rate limit exceeded', { ip, count: ipData.count });
      throw new Error('Rate limit exceeded');
    }

    ipData.count++;
  }

  private sanitizeResponse(result: any): any {
    if (!result || typeof result !== 'object') {
      return result;
    }

    // Remove sensitive fields from response
    const sanitized = { ...result };
    
    if (sanitized.configuration) {
      const config = { ...sanitized.configuration };
      if (config.apiKey) config.apiKey = '***masked***';
      if (config.authToken) config.authToken = '***masked***';
      if (config.secretAccessKey) config.secretAccessKey = '***masked***';
      sanitized.configuration = config;
    }

    return sanitized;
  }
}