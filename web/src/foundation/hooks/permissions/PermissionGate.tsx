/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 * Useful for hiding/showing UI elements based on access control.
 */

'use client';

import React from 'react';
import { User } from '../../types/generated/graphql';
import { usePermission, useAnyPermission, useAllPermissions } from './usePermission';

/**
 * Props for PermissionGate component
 */
export interface PermissionGateProps {
  /**
   * Current user (typically from AuthProvider)
   */
  user: User | null;

  /**
   * Single permission to check
   * Use this OR permissions, not both
   */
  permission?: string;

  /**
   * Multiple permissions to check
   * Use this OR permission, not both
   */
  permissions?: string[];

  /**
   * Permission matching mode when using permissions array
   * - 'any': User needs at least one permission (default)
   * - 'all': User needs all permissions
   */
  mode?: 'any' | 'all';

  /**
   * Content to render when user has permission
   */
  children: React.ReactNode;

  /**
   * Optional fallback content to render when user lacks permission
   * If not provided, nothing is rendered
   */
  fallback?: React.ReactNode;

  /**
   * Optional loading state content
   * Shown while user data is being loaded
   */
  loading?: React.ReactNode;

  /**
   * Whether user data is currently loading
   */
  isLoading?: boolean;
}

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 * Supports single permission, multiple permissions with 'any' or 'all' modes,
 * and optional fallback content.
 * 
 * @example Single permission
 * ```tsx
 * <PermissionGate user={user} permission="users.create">
 *   <CreateUserButton />
 * </PermissionGate>
 * ```
 * 
 * @example Multiple permissions (any)
 * ```tsx
 * <PermissionGate 
 *   user={user} 
 *   permissions={['users.create', 'users.update']}
 *   mode="any"
 * >
 *   <UserManagementPanel />
 * </PermissionGate>
 * ```
 * 
 * @example Multiple permissions (all)
 * ```tsx
 * <PermissionGate 
 *   user={user} 
 *   permissions={['users.create', 'users.delete']}
 *   mode="all"
 * >
 *   <AdvancedUserManagement />
 * </PermissionGate>
 * ```
 * 
 * @example With fallback
 * ```tsx
 * <PermissionGate 
 *   user={user} 
 *   permission="users.read"
 *   fallback={<div>You don't have permission to view users</div>}
 * >
 *   <UserList />
 * </PermissionGate>
 * ```
 * 
 * @example With loading state
 * ```tsx
 * <PermissionGate 
 *   user={user} 
 *   permission="users.read"
 *   isLoading={loading}
 *   loading={<Spinner />}
 * >
 *   <UserList />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  user,
  permission,
  permissions,
  mode = 'any',
  children,
  fallback = null,
  loading = null,
  isLoading = false,
}: PermissionGateProps): React.ReactElement | null {
  // Show loading state if provided
  if (isLoading) {
    return <>{loading}</>;
  }

  // Validate props
  if (permission && permissions) {
    console.warn(
      'PermissionGate: Both permission and permissions props provided. Using permission prop.'
    );
  }

  if (!permission && !permissions) {
    console.warn(
      'PermissionGate: Neither permission nor permissions prop provided. Rendering fallback.'
    );
    return <>{fallback}</>;
  }

  // Check permission
  let hasPermission = false;

  if (permission) {
    // Single permission check
    // eslint-disable-next-line react-hooks/rules-of-hooks
    hasPermission = usePermission(user, permission);
  } else if (permissions) {
    // Multiple permissions check
    if (mode === 'all') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      hasPermission = useAllPermissions(user, permissions);
    } else {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      hasPermission = useAnyPermission(user, permissions);
    }
  }

  // Render children if has permission, otherwise render fallback
  return <>{hasPermission ? children : fallback}</>;
}

/**
 * Higher-order component version of PermissionGate
 * Wraps a component and only renders it if user has permission
 * 
 * @example
 * ```tsx
 * const ProtectedUserList = withPermission(UserList, 'users.read');
 * 
 * // Usage
 * <ProtectedUserList user={user} />
 * ```
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: string,
  fallback?: React.ReactNode
): React.FC<P & { user: User | null }> {
  return function PermissionWrappedComponent({ user, ...props }) {
    return (
      <PermissionGate user={user} permission={permission} fallback={fallback}>
        <Component {...(props as P)} />
      </PermissionGate>
    );
  };
}

/**
 * Higher-order component for multiple permissions
 * 
 * @example
 * ```tsx
 * const ProtectedUserManagement = withPermissions(
 *   UserManagement, 
 *   ['users.create', 'users.update'],
 *   'any'
 * );
 * 
 * // Usage
 * <ProtectedUserManagement user={user} />
 * ```
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  permissions: string[],
  mode: 'any' | 'all' = 'any',
  fallback?: React.ReactNode
): React.FC<P & { user: User | null }> {
  return function PermissionsWrappedComponent({ user, ...props }) {
    return (
      <PermissionGate
        user={user}
        permissions={permissions}
        mode={mode}
        fallback={fallback}
      >
        <Component {...(props as P)} />
      </PermissionGate>
    );
  };
}
