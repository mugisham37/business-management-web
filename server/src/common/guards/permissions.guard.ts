import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService, PermissionContext } from '../../modules/permissions/permissions.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Permissions Guard
 * 
 * Validates that the authenticated user has the required permissions to access a route.
 * This guard should be used in combination with JwtAuthGuard to ensure the user is authenticated.
 * 
 * Requirements:
 * - 7.3: WHEN evaluating permissions, THE Permission_Engine SHALL check direct 
 *   permission grants first, then role-based permissions
 * - 7.4: WHEN a user has a direct permission denial, THE Permission_Engine SHALL 
 *   deny access regardless of role permissions
 * - 7.5: WHEN a user has a direct permission grant, THE Permission_Engine SHALL 
 *   allow access regardless of role permissions
 * 
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @Permissions('users:create:user')
 * @Post('/users')
 * async createUser(@Body() dto: CreateUserDto) {
 *   return this.usersService.create(dto);
 * }
 * ```
 * 
 * The guard:
 * 1. Extracts required permissions from route metadata (set by @Permissions decorator)
 * 2. Extracts user and organization context from request (injected by JwtAuthGuard)
 * 3. Calls PermissionsService.hasPermission for each required permission
 * 4. Denies access if any permission check fails
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Determines if the request can activate the route based on permissions
   * 
   * @param context - Execution context
   * @returns true if user has all required permissions, false otherwise
   * @throws ForbiddenException if user lacks required permissions
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from route metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get request and extract user
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Ensure user is authenticated (should be handled by JwtAuthGuard)
    if (!user) {
      this.logger.error('PermissionsGuard: No user found in request. Ensure JwtAuthGuard is applied first.');
      throw new ForbiddenException('Authentication required');
    }

    // Build permission context
    const permissionContext: PermissionContext = {
      organizationId: user.organizationId,
      locationId: request.locationId, // May be set by route or middleware
      departmentId: request.departmentId, // May be set by route or middleware
    };

    this.logger.debug(
      `Checking permissions for user ${user.id}: ${requiredPermissions.join(', ')}`,
    );

    // Check each required permission
    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionsService.hasPermission(
        user.id,
        permission,
        permissionContext,
      );

      if (!hasPermission) {
        this.logger.warn(
          `Permission denied: User ${user.id} lacks permission '${permission}'`,
        );
        throw new ForbiddenException(
          `Insufficient permissions: '${permission}' required`,
        );
      }
    }

    this.logger.debug(
      `Permission check passed for user ${user.id}: ${requiredPermissions.join(', ')}`,
    );

    return true;
  }
}
