/**
 * Permission Provider
 * 
 * Provides permission checking functions to the application through React Context.
 * Uses the PermissionChecker with current user to check permissions.
 * 
 * Features:
 * - Check single permission
 * - Check any of multiple permissions
 * - Check all of multiple permissions
 * - Check route access permissions
 * - Supports wildcard permissions (e.g., "users.*")
 * - OWNER role bypass (OWNER has all permissions)
 * 
 * Requirements: 7.1, 7.5
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import { 
  PermissionChecker, 
  createPermissionChecker 
} from '@/foundation/utils/permissions';
import { routePermissions } from '@/foundation/config/routes';

/**
 * Permission Context Value
 * 
 * Provides permission checking functions to consuming components
 */
export interface PermissionContextValue {
  /**
   * Check if the user has a specific permission
   * @param permission - The permission string to check (e.g., "users.create")
   * @returns true if user has the permission, false otherwise
   */
  hasPermission: (permission: string) => boolean;

  /**
   * Check if the user has any of the specified permissions
   * @param permissions - Array of permission strings
   * @returns true if user has at least one permission, false otherwise
   */
  hasAnyPermission: (permissions: string[]) => boolean;

  /**
   * Check if the user has all of the specified permissions
   * @param permissions - Array of permission strings
   * @returns true if user has all permissions, false otherwise
   */
  hasAllPermissions: (permissions: string[]) => boolean;

  /**
   * Check if the user can access a specific route
   * @param route - The route path to check
   * @returns true if user can access the route, false otherwise
   */
  canAccessRoute: (route: string) => boolean;
}

/**
 * Permission Context
 */
const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

/**
 * Props for PermissionProvider
 */
export interface PermissionProviderProps {
  children: React.ReactNode;
}

/**
 * Permission Provider Component
 * 
 * Provides permission checking functions to the application.
 * Uses the current user from AuthProvider to check permissions.
 * 
 * Permission checking logic:
 * 1. OWNER role bypasses all permission checks (always returns true)
 * 2. Exact match: Check if user has the exact permission string
 * 3. Wildcard match: Check if user has a wildcard permission that matches
 *    - Example: "users.*" matches "users.create", "users.read", etc.
 * 
 * @example
 * ```tsx
 * <PermissionProvider>
 *   <App />
 * </PermissionProvider>
 * ```
 */
export function PermissionProvider({ children }: PermissionProviderProps) {
  const { user } = useAuth();

  // Create permission checker with current user
  // Memoized to prevent recreation on every render
  const permissionChecker = useMemo<PermissionChecker>(() => {
    return createPermissionChecker({
      user,
      routePermissions,
    });
  }, [user]);

  // Create context value with bound methods
  const value: PermissionContextValue = useMemo(() => ({
    hasPermission: permissionChecker.hasPermission.bind(permissionChecker),
    hasAnyPermission: permissionChecker.hasAnyPermission.bind(permissionChecker),
    hasAllPermissions: permissionChecker.hasAllPermissions.bind(permissionChecker),
    canAccessRoute: permissionChecker.canAccessRoute.bind(permissionChecker),
  }), [permissionChecker]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook to access permission context
 * 
 * @throws Error if used outside PermissionProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasPermission, canAccessRoute } = usePermissions();
 *   
 *   if (!hasPermission('users.create')) {
 *     return <div>You don't have permission to create users</div>;
 *   }
 *   
 *   return <CreateUserForm />;
 * }
 * ```
 */
export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  
  return context;
}

/**
 * Hook to check a single permission
 * Convenience hook for checking a single permission
 * 
 * @param permission - The permission string to check
 * @returns true if user has the permission, false otherwise
 * 
 * @example
 * ```tsx
 * function CreateUserButton() {
 *   const canCreate = usePermission('users.create');
 *   
 *   if (!canCreate) return null;
 *   
 *   return <Button>Create User</Button>;
 * }
 * ```
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Permission Gate Component
 * 
 * Conditionally renders children based on permission check.
 * Useful for hiding UI elements that require specific permissions.
 * 
 * @example
 * ```tsx
 * <PermissionGate permission="users.create">
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * // With fallback
 * <PermissionGate 
 *   permission="users.create"
 *   fallback={<div>You don't have permission</div>}
 * >
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * // Check any of multiple permissions
 * <PermissionGate permissions={['users.create', 'users.update']}>
 *   <UserManagementPanel />
 * </PermissionGate>
 * ```
 */
export interface PermissionGateProps {
  /**
   * Single permission to check
   */
  permission?: string;
  
  /**
   * Multiple permissions to check (user must have at least one)
   */
  permissions?: string[];
  
  /**
   * Fallback content to render if permission check fails
   */
  fallback?: React.ReactNode;
  
  /**
   * Content to render if permission check passes
   */
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = usePermissions();

  // Check single permission
  if (permission) {
    const hasAccess = hasPermission(permission);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Check multiple permissions (any)
  if (permissions && permissions.length > 0) {
    const hasAccess = hasAnyPermission(permissions);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // No permission specified, render children
  return <>{children}</>;
}
