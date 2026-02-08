import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for roles decorator
 * This key is used by RolesGuard to extract required roles
 */
export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * 
 * Sets metadata for RolesGuard to enforce role-based access control.
 * This decorator should be used in combination with JwtAuthGuard and RolesGuard.
 * The guard checks if the user has at least one of the specified roles.
 * 
 * Requirements:
 * - 19.2: WHEN a role is assigned to a user, THE Auth_System SHALL support 
 *   location and department scoping
 * 
 * Usage in controllers:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADMIN', 'MANAGER')
 * @Get('/admin/dashboard')
 * async getAdminDashboard() {
 *   return this.dashboardService.getAdminData();
 * }
 * ```
 * 
 * @param roles - One or more role codes (e.g., 'ADMIN', 'MANAGER', 'EMPLOYEE')
 * @returns Method decorator that sets roles metadata
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
