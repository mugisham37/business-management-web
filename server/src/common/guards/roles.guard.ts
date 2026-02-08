import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../modules/roles/roles.service';

/**
 * Metadata key for roles decorator
 */
export const ROLES_KEY = 'roles';

/**
 * Roles Guard
 * 
 * Validates that the authenticated user has at least one of the required roles to access a route.
 * This guard should be used in combination with JwtAuthGuard to ensure the user is authenticated.
 * 
 * Requirements:
 * - 19.2: WHEN a role is assigned to a user, THE Auth_System SHALL support 
 *   location and department scoping
 * 
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN', 'MANAGER')
 * @Get('/admin/dashboard')
 * async getAdminDashboard() {
 *   return this.dashboardService.getAdminData();
 * }
 * ```
 * 
 * The guard:
 * 1. Extracts required roles from route metadata (set by @Roles decorator)
 * 2. Extracts user from request (injected by JwtAuthGuard)
 * 3. Calls RolesService.getUserRoles to get user's roles
 * 4. Checks if user has at least one of the required roles
 * 5. Denies access if user has none of the required roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * Determines if the request can activate the route based on roles
   * 
   * @param context - Execution context
   * @returns true if user has at least one required role, false otherwise
   * @throws ForbiddenException if user lacks required roles
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get request and extract user
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Ensure user is authenticated (should be handled by JwtAuthGuard)
    if (!user) {
      this.logger.error('RolesGuard: No user found in request. Ensure JwtAuthGuard is applied first.');
      throw new ForbiddenException('Authentication required');
    }

    // Build context for role filtering (location/department scope)
    const context_filter: {
      locationId?: string;
      departmentId?: string;
    } = {};

    // Extract location and department from request if available
    if (request.locationId) {
      context_filter.locationId = request.locationId;
    }
    if (request.departmentId) {
      context_filter.departmentId = request.departmentId;
    }

    this.logger.debug(
      `Checking roles for user ${user.id}: ${requiredRoles.join(', ')}`,
    );

    // Get user's roles (with context filtering)
    const userRoles = await this.rolesService.getUserRoles(
      user.id,
      Object.keys(context_filter).length > 0 ? context_filter : undefined,
    );

    // Extract role codes from user's roles
    const userRoleCodes = userRoles.map(role => role.code);

    this.logger.debug(
      `User ${user.id} has roles: ${userRoleCodes.join(', ')}`,
    );

    // Check if user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some(requiredRole =>
      userRoleCodes.includes(requiredRole),
    );

    if (!hasRequiredRole) {
      this.logger.warn(
        `Role check failed: User ${user.id} lacks required roles. Required: [${requiredRoles.join(', ')}], Has: [${userRoleCodes.join(', ')}]`,
      );
      throw new ForbiddenException(
        `Insufficient roles: One of [${requiredRoles.join(', ')}] required`,
      );
    }

    this.logger.debug(
      `Role check passed for user ${user.id}`,
    );

    return true;
  }
}
