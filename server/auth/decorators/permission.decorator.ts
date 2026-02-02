import { SetMetadata } from '@nestjs/common';

/**
 * Permission decorator
 * Marks endpoints/resolvers that require specific permissions
 * Used with PermissionsGuard to enforce permission checks
 * 
 * Usage:
 * @Permission('user:read', 'user:write')
 * async getUser() { ... }
 */
export const Permission = (...permissions: string[]) => SetMetadata('permissions', permissions);

// Export with alternate name for compatibility
export const Permissions = Permission;

// Alias for GraphQL usage pattern
export const RequirePermissions = Permission;
