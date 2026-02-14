/**
 * Permission Hooks
 * 
 * React hooks for checking user permissions in components.
 * These hooks integrate with the AuthProvider to access current user
 * and the PermissionChecker for permission logic.
 */

'use client';

import { useMemo } from 'react';
import { User } from '../../types/generated/graphql';
import {
  PermissionChecker,
  PermissionCheckerImpl,
} from '../../utils/permissions';
import { routePermissions } from '../../config/routes';

/**
 * Hook to check a single permission
 * 
 * @param user - Current user (from AuthProvider)
 * @param permission - Permission string to check
 * @returns true if user has the permission, false otherwise
 * 
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const canCreateUser = usePermission(user, 'users.create');
 * 
 * return (
 *   <button disabled={!canCreateUser}>
 *     Create User
 *   </button>
 * );
 * ```
 */
export function usePermission(user: User | null, permission: string): boolean {
  const checker = usePermissionChecker(user);
  return useMemo(
    () => checker.hasPermission(permission),
    [checker, permission]
  );
}

/**
 * Hook to check if user has any of the specified permissions
 * 
 * @param user - Current user (from AuthProvider)
 * @param permissions - Array of permission strings
 * @returns true if user has at least one permission, false otherwise
 * 
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const canManageUsers = useAnyPermission(user, ['users.create', 'users.update', 'users.delete']);
 * ```
 */
export function useAnyPermission(
  user: User | null,
  permissions: string[]
): boolean {
  const checker = usePermissionChecker(user);
  return useMemo(
    () => checker.hasAnyPermission(permissions),
    [checker, permissions]
  );
}

/**
 * Hook to check if user has all of the specified permissions
 * 
 * @param user - Current user (from AuthProvider)
 * @param permissions - Array of permission strings
 * @returns true if user has all permissions, false otherwise
 * 
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const canFullyManageUsers = useAllPermissions(user, ['users.create', 'users.update', 'users.delete']);
 * ```
 */
export function useAllPermissions(
  user: User | null,
  permissions: string[]
): boolean {
  const checker = usePermissionChecker(user);
  return useMemo(
    () => checker.hasAllPermissions(permissions),
    [checker, permissions]
  );
}

/**
 * Hook to check if user can access a specific route
 * 
 * @param user - Current user (from AuthProvider)
 * @param route - Route path to check
 * @returns true if user can access the route, false otherwise
 * 
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const canAccessUsers = useCanAccessRoute(user, '/users');
 * 
 * if (!canAccessUsers) {
 *   return <Redirect to="/unauthorized" />;
 * }
 * ```
 */
export function useCanAccessRoute(user: User | null, route: string): boolean {
  const checker = usePermissionChecker(user);
  return useMemo(() => checker.canAccessRoute(route), [checker, route]);
}

/**
 * Hook to get a PermissionChecker instance
 * Memoized to avoid recreating the checker on every render
 * 
 * @param user - Current user (from AuthProvider)
 * @returns PermissionChecker instance
 * 
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const checker = usePermissionChecker(user);
 * 
 * const canCreate = checker.hasPermission('users.create');
 * const canUpdate = checker.hasPermission('users.update');
 * ```
 */
export function usePermissionChecker(user: User | null): PermissionChecker {
  return useMemo(
    () => new PermissionCheckerImpl(user, routePermissions),
    [user]
  );
}
