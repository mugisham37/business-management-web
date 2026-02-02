import { SetMetadata } from '@nestjs/common';

/**
 * Require Permission decorator
 * 
 * A more explicit version of the Permissions decorator that clearly indicates
 * a single permission is required. Useful for documentation and clarity.
 * 
 * @param permission - The permission string required to access the resource
 * @param resource - Optional resource type for granular permissions
 * @param resourceId - Optional specific resource ID
 * 
 * Usage:
 * @RequirePermission('users:read')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async getUsers() { ... }
 * 
 * @RequirePermission('posts:write', 'blog')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async createBlogPost() { ... }
 * 
 * @RequirePermission('documents:read', 'contract', '123')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async getContract(@Param('id') id: string) { ... }
 */
export const RequirePermission = (
  permission: string,
  resource?: string,
  resourceId?: string
) => {
  let fullPermission = permission;
  
  if (resource && resourceId) {
    fullPermission = `${permission}:${resource}:${resourceId}`;
  } else if (resource) {
    fullPermission = `${permission}:${resource}`;
  }
  
  return SetMetadata('permissions', [fullPermission]);
};

/**
 * Require Any Permission decorator
 * 
 * Requires that the user has at least one of the specified permissions.
 * More explicit than the general Permissions decorator.
 * 
 * @param permissions - Array of permission strings (OR logic)
 * 
 * Usage:
 * @RequireAnyPermission(['users:read', 'users:write', 'admin:*'])
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async getUserData() { ... }
 */
export const RequireAnyPermission = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);

/**
 * Require All Permissions decorator
 * 
 * Requires that the user has ALL of the specified permissions.
 * This is implemented by creating a combined permission check.
 * 
 * Note: This is a conceptual decorator. The actual implementation
 * would need to be handled by a specialized guard that checks
 * all permissions individually.
 * 
 * @param permissions - Array of permission strings (AND logic)
 * 
 * Usage:
 * @RequireAllPermissions(['users:read', 'users:write'])
 * @UseGuards(JwtAuthGuard, AllPermissionsGuard)
 * async updateUserData() { ... }
 */
export const RequireAllPermissions = (...permissions: string[]) => 
  SetMetadata('allPermissions', permissions);

/**
 * Resource Permission decorator
 * 
 * Convenience decorator for resource-specific permissions.
 * Automatically formats the permission with resource context.
 * 
 * @param action - The action to perform (read, write, delete, etc.)
 * @param resource - The resource type
 * @param resourceId - Optional specific resource ID
 * 
 * Usage:
 * @ResourcePermission('read', 'users')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async getUsers() { ... }
 * 
 * @ResourcePermission('write', 'posts', 'blog')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async createBlogPost() { ... }
 */
export const ResourcePermission = (
  action: string,
  resource: string,
  resourceId?: string
) => {
  const permission = resourceId 
    ? `${resource}:${action}:${resourceId}`
    : `${resource}:${action}`;
    
  return SetMetadata('permissions', [permission]);
};