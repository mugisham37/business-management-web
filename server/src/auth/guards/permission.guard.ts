import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionsService } from '../../permissions/permissions.service';
import { UserRole } from '../../tenant/tenant-context.interface';

/**
 * Permission Guard
 * Implements requirements 7.1, 7.2, 16.3, 16.4
 * 
 * This guard:
 * 1. Extracts required permissions from @RequirePermission decorator
 * 2. Bypasses permission checks for Owners (they have all permissions)
 * 3. Validates that the user has all required permissions
 * 4. Throws ForbiddenException if insufficient permissions
 * 
 * Can be used with both REST and GraphQL endpoints
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Get the request object from either HTTP or GraphQL context
   */
  private getRequest(context: ExecutionContext) {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }

    return context.switchToHttp().getRequest();
  }

  /**
   * Main guard logic
   * Checks if user has required permissions
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract required permissions from decorator metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = this.getRequest(context);
    const user = request.user;

    // Ensure user is authenticated (should be set by JwtAuthGuard)
    if (!user || !user.userId || !user.organizationId || !user.role) {
      throw new ForbiddenException('User context not found');
    }

    // Owners bypass all permission checks - they have implicit access to everything
    if (user.role === UserRole.OWNER) {
      return true;
    }

    // Check if user has all required permissions
    const hasPermissions = await this.permissionsService.hasAllPermissions(
      user.userId,
      requiredPermissions,
    );

    if (!hasPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
