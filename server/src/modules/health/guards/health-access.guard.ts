import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class HealthAccessGuard implements CanActivate {
  private readonly logger = new Logger(HealthAccessGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    // Allow access to health endpoints for system monitoring
    const isPublicHealthEndpoint = this.isPublicHealthEndpoint(context);
    if (isPublicHealthEndpoint) {
      return true;
    }

    // Check if user is authenticated
    if (!user) {
      this.logger.warn('Unauthenticated access attempt to health endpoint');
      return false;
    }

    // Check if user has health monitoring permissions
    const hasHealthPermission = this.checkHealthPermissions(user, context);
    if (!hasHealthPermission) {
      this.logger.warn(`User ${user.id} attempted to access health endpoint without permission`);
      return false;
    }

    // Log successful access
    this.logger.debug(`User ${user.id} granted access to health endpoint`);
    return true;
  }

  private isPublicHealthEndpoint(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const className = context.getClass();
    
    // Check for public health endpoints (basic system health)
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      handler,
      className,
    ]);

    // Allow basic system health check without authentication
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const fieldName = info.fieldName;
    
    const publicEndpoints = ['systemHealth', 'systemUptime', 'isSystemHealthy'];
    return isPublic || publicEndpoints.includes(fieldName);
  }

  private checkHealthPermissions(user: any, context: ExecutionContext): boolean {
    // Check if user has admin role
    if (user.roles?.includes('admin') || user.roles?.includes('system_admin')) {
      return true;
    }

    // Check specific health permissions
    const requiredPermissions = this.getRequiredPermissions(context);
    if (!requiredPermissions.length) {
      return true; // No specific permissions required
    }

    // Check if user has any of the required permissions
    const userPermissions = user.permissions || [];
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }

  private getRequiredPermissions(context: ExecutionContext): string[] {
    const handler = context.getHandler();
    const className = context.getClass();
    
    // Get permissions from decorators
    const permissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      handler,
      className,
    ]);

    return permissions || [];
  }
}