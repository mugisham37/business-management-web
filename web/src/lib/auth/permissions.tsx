/**
 * Permission Checking Utilities
 * 
 * Provides functions to check user permissions and a React component
 * for conditional rendering based on permissions.
 */

'use client';

import React from 'react';
import type { User } from '@/types/user';

/**
 * Check if a user has a specific permission
 * 
 * @param user - The user object (or null if not authenticated)
 * @param permission - The permission name to check (e.g., 'users:create:user')
 * @returns true if the user has the permission, false otherwise
 * 
 * @example
 * const canCreateUser = checkPermission(user, 'users:create:user');
 */
export function checkPermission(user: User | null, permission: string): boolean {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return user.role.permissions.some(p => p.name === permission);
}

/**
 * Check if a user has any of the specified permissions
 * 
 * @param user - The user object (or null if not authenticated)
 * @param permissions - Array of permission names to check
 * @returns true if the user has at least one of the permissions, false otherwise
 * 
 * @example
 * const canManageUsers = checkAnyPermission(user, [
 *   'users:create:user',
 *   'users:update:user',
 *   'users:delete:user'
 * ]);
 */
export function checkAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return permissions.some(permission =>
    user.role.permissions.some(p => p.name === permission)
  );
}

/**
 * Check if a user has all of the specified permissions
 * 
 * @param user - The user object (or null if not authenticated)
 * @param permissions - Array of permission names to check
 * @returns true if the user has all of the permissions, false otherwise
 * 
 * @example
 * const canFullyManageRoles = checkAllPermissions(user, [
 *   'roles:create:role',
 *   'roles:update:role',
 *   'roles:delete:role'
 * ]);
 */
export function checkAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return permissions.every(permission =>
    user.role.permissions.some(p => p.name === permission)
  );
}

/**
 * PermissionGate Component Props
 */
interface PermissionGateProps {
  /**
   * Single permission to check
   */
  permission?: string;
  
  /**
   * Multiple permissions to check
   */
  permissions?: string[];
  
  /**
   * If true, user must have all permissions in the array
   * If false, user must have at least one permission
   * @default false
   */
  requireAll?: boolean;
  
  /**
   * Content to render if user doesn't have permission
   * @default null
   */
  fallback?: React.ReactNode;
  
  /**
   * Content to render if user has permission
   */
  children: React.ReactNode;
  
  /**
   * User object to check permissions against
   */
  user: User | null;
}

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 * 
 * @example
 * // Single permission check
 * <PermissionGate user={user} permission="users:create:user">
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGate user={user} permissions={['users:create:user', 'users:update:user']}>
 *   <UserManagementPanel />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate 
 *   user={user} 
 *   permissions={['roles:create:role', 'roles:update:role']} 
 *   requireAll
 * >
 *   <AdvancedRoleEditor />
 * </PermissionGate>
 * 
 * @example
 * // With fallback content
 * <PermissionGate 
 *   user={user} 
 *   permission="users:delete:user"
 *   fallback={<p>You don't have permission to delete users.</p>}
 * >
 *   <DeleteUserButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
  user,
}: PermissionGateProps) {
  let hasAccess = false;

  if (permission) {
    hasAccess = checkPermission(user, permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? checkAllPermissions(user, permissions)
      : checkAnyPermission(user, permissions);
  }

  if (hasAccess) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
