import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator
 * 
 * Sets required roles for accessing a route or resolver.
 * Used in conjunction with RolesGuard to enforce role-based access control.
 * 
 * @param roles - Array of role strings required to access the resource
 * 
 * Usage:
 * @Roles('admin', 'manager')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async getUsers() { ... }
 * 
 * Available Roles (in hierarchy order):
 * - super_admin: Platform-wide administrative access
 * - tenant_admin: Tenant-wide administrative access
 * - manager: Management-level access within tenant
 * - employee: Standard employee access
 * - customer: Customer-level access
 * - readonly: Read-only access
 * 
 * The guard will check if the user has ANY of the specified roles (OR logic).
 * Higher-level roles automatically have access to lower-level role requirements.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Single role decorator (alias for convenience)
 */
export const Role = (role: string) => SetMetadata('roles', [role]);

/**
 * Admin-only decorator (convenience for common use case)
 */
export const AdminOnly = () => SetMetadata('roles', ['super_admin', 'tenant_admin']);

/**
 * Manager and above decorator (convenience for common use case)
 */
export const ManagerAndAbove = () => SetMetadata('roles', ['super_admin', 'tenant_admin', 'manager']);

/**
 * Employee and above decorator (convenience for common use case)
 */
export const EmployeeAndAbove = () => SetMetadata('roles', ['super_admin', 'tenant_admin', 'manager', 'employee']);