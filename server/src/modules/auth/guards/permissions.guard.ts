import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionsService } from '../services/permissions.service';

/**
 * Permissions Guard
 * Validates that user has required permission(s)
 * Used with @Permissions() decorator to protect GraphQL resolvers
 * Supports wildcard permissions and resource-level permissions
 * GraphQL-only implementation
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // GraphQL-only: Extract user from GraphQL context
    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().req.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's actual permissions from service (includes role-based + custom)
    const userPermissions = await this.permissionsService.getUserPermissions(
      user.id,
      user.tenantId,
    );

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      this.permissionsService.hasPermission(userPermissions, permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `User does not have required permission(s): ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }

    // Check if user has required permissions
    return requiredPermissions.some((permission) => user.permissions?.includes(permission));
  }
}
