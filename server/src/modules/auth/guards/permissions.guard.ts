import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionsService } from '../services/permissions.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Permissions Guard
 * 
 * Validates that the authenticated user has the required permissions
 * to access a specific resource or perform an action.
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('users:read', 'users:write')
 * async getUsers() { ... }
 * 
 * Features:
 * - Supports multiple permission requirements (OR logic)
 * - Wildcard permission matching (e.g., 'users:*' matches 'users:read')
 * - Resource-specific permissions
 * - Caches permission checks for performance
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from context
    const user = this.getUserFromContext(context);
    if (!user) {
      return false;
    }

    try {
      // Get user permissions
      const userPermissions = await this.permissionsService.getUserPermissions(
        user.id,
        user.tenantId,
      );

      // Check if user has any of the required permissions (OR logic)
      for (const requiredPermission of requiredPermissions) {
        if (this.permissionsService.hasPermission(userPermissions, requiredPermission)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      // Log error and deny access
      console.error('PermissionsGuard error:', error);
      return false;
    }
  }

  /**
   * Extract user from execution context (supports both HTTP and GraphQL)
   */
  private getUserFromContext(context: ExecutionContext): AuthenticatedUser | null {
    try {
      // Try GraphQL context first
      const gqlContext = GqlExecutionContext.create(context);
      const gqlUser = gqlContext.getContext()?.req?.user;
      if (gqlUser) {
        return gqlUser;
      }

      // Fallback to HTTP context
      const request = context.switchToHttp().getRequest();
      return request?.user || null;
    } catch (error) {
      return null;
    }
  }
}