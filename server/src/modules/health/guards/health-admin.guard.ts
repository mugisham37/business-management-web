import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class HealthAdminGuard implements CanActivate {
  private readonly logger = new Logger(HealthAdminGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    // Check if user is authenticated
    if (!user) {
      this.logger.warn('Unauthenticated access attempt to health admin endpoint');
      throw new ForbiddenException('Authentication required for health administration');
    }

    // Check if user has admin privileges
    const hasAdminAccess = this.checkAdminPermissions(user, context);
    if (!hasAdminAccess) {
      this.logger.warn(`User ${user.id} attempted to access health admin endpoint without permission`);
      throw new ForbiddenException('Administrative privileges required for this operation');
    }

    // Log successful admin access
    this.logger.log(`Admin user ${user.id} granted access to health admin endpoint`);
    return true;
  }

  private checkAdminPermissions(user: any, context: ExecutionContext): boolean {
    // Check if user has system admin role
    if (user.roles?.includes('system_admin') || user.roles?.includes('super_admin')) {
      return true;
    }

    // Check if user has health admin role
    if (user.roles?.includes('health_admin')) {
      return true;
    }

    // Check specific admin permissions
    const requiredAdminPermissions = this.getRequiredAdminPermissions(context);
    if (!requiredAdminPermissions.length) {
      // If no specific admin permissions required, check for general admin role
      return user.roles?.includes('admin');
    }

    // Check if user has any of the required admin permissions
    const userPermissions = user.permissions || [];
    return requiredAdminPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  private getRequiredAdminPermissions(context: ExecutionContext): string[] {
    const handler = context.getHandler();
    const className = context.getClass();
    
    // Get admin permissions from decorators
    const adminPermissions = this.reflector.getAllAndOverride<string[]>('adminPermissions', [
      handler,
      className,
    ]);

    // Default admin permissions for health operations
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const fieldName = info.fieldName;
    
    const adminOperations = {
      'registerHealthCheck': ['health:admin:create'],
      'removeHealthCheck': ['health:admin:delete'],
      'addExternalService': ['health:admin:external'],
      'clearFailedJobs': ['health:admin:queue'],
      'retryFailedJobs': ['health:admin:queue'],
      'pauseAllQueues': ['health:admin:queue'],
      'resumeAllQueues': ['health:admin:queue'],
      'forceGarbageCollection': ['health:admin:system'],
      'cleanupTempFiles': ['health:admin:system'],
      'clearMetrics': ['health:admin:metrics'],
      'updateMonitoringConfig': ['health:admin:config'],
      'configureNotifications': ['health:admin:notifications'],
    };

    return adminPermissions || adminOperations[fieldName] || ['health:admin'];
  }
}