import { SetMetadata } from '@nestjs/common';

/**
 * Permissions decorator
 * 
 * Sets required permissions for accessing a route or resolver.
 * Used in conjunction with PermissionsGuard to enforce permission-based access control.
 * 
 * @param permissions - Array of permission strings required to access the resource
 * 
 * Usage:
 * @Permissions('users:read', 'users:write')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async getUsers() { ... }
 * 
 * Permission Format:
 * - Basic: 'users:read', 'posts:write'
 * - Wildcard: 'users:*', '*:read'
 * - Resource-specific: 'users:read:123', 'posts:write:456'
 * 
 * The guard will check if the user has ANY of the specified permissions (OR logic).
 */
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

/**
 * Single permission decorator (alias for convenience)
 */
export const Permission = (permission: string) => SetMetadata('permissions', [permission]);