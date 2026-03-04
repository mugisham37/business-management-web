'use client';

import React, { ReactNode } from 'react';
import { permissionChecker, PermissionModule, PermissionAction } from '@/lib/auth/permission-checker';

/**
 * Permission Gate Component
 * 
 * Conditionally renders children based on user permissions.
 * Supports single permission, any of multiple permissions, or all of multiple permissions.
 * 
 * Requirements: 13.3 - Respect permission checks before showing UI elements
 */

export interface PermissionGateProps {
  /**
   * Single permission to check (module and action)
   */
  permission?: {
    module: PermissionModule;
    action: PermissionAction;
  };
  
  /**
   * Multiple permissions to check with "any" logic
   * User needs at least one of these permissions
   */
  anyOf?: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>;
  
  /**
   * Multiple permissions to check with "all" logic
   * User needs all of these permissions
   */
  allOf?: Array<{
    module: PermissionModule;
    action: PermissionAction;
  }>;
  
  /**
   * Minimum hierarchy level required
   */
  minHierarchyLevel?: number;
  
  /**
   * Content to render if user has permission
   */
  children: ReactNode;
  
  /**
   * Optional fallback content to render if user doesn't have permission
   */
  fallback?: ReactNode;
  
  /**
   * If true, renders children in disabled state instead of hiding
   */
  renderDisabled?: boolean;
}

/**
 * PermissionGate Component
 * 
 * @example
 * ```tsx
 * // Single permission check
 * <PermissionGate permission={{ module: 'users', action: 'create' }}>
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * // Any of multiple permissions
 * <PermissionGate anyOf={[
 *   { module: 'users', action: 'create' },
 *   { module: 'users', action: 'manage' }
 * ]}>
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * // All of multiple permissions
 * <PermissionGate allOf={[
 *   { module: 'users', action: 'read' },
 *   { module: 'permissions', action: 'read' }
 * ]}>
 *   <UserPermissionsView />
 * </PermissionGate>
 * 
 * // With fallback
 * <PermissionGate 
 *   permission={{ module: 'users', action: 'create' }}
 *   fallback={<p>You don't have permission to create users</p>}
 * >
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * // Render disabled instead of hiding
 * <PermissionGate 
 *   permission={{ module: 'users', action: 'delete' }}
 *   renderDisabled
 * >
 *   <DeleteUserButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  minHierarchyLevel,
  children,
  fallback = null,
  renderDisabled = false,
}: PermissionGateProps): ReactNode {
  // Check hierarchy level if specified
  if (minHierarchyLevel !== undefined) {
    const userLevel = permissionChecker.getHierarchyLevel();
    if (userLevel < minHierarchyLevel) {
      return renderDisabled ? renderDisabledChildren(children) : fallback;
    }
  }
  
  // Check single permission
  if (permission) {
    const hasPermission = permissionChecker.hasPermission(
      permission.module,
      permission.action
    );
    
    if (!hasPermission) {
      return renderDisabled ? renderDisabledChildren(children) : fallback;
    }
  }
  
  // Check any of multiple permissions
  if (anyOf && anyOf.length > 0) {
    const hasAnyPermission = permissionChecker.hasAnyPermission(
      anyOf.map((p) => [p.module, p.action])
    );
    
    if (!hasAnyPermission) {
      return renderDisabled ? renderDisabledChildren(children) : fallback;
    }
  }
  
  // Check all of multiple permissions
  if (allOf && allOf.length > 0) {
    const hasAllPermissions = permissionChecker.hasAllPermissions(
      allOf.map((p) => [p.module, p.action])
    );
    
    if (!hasAllPermissions) {
      return renderDisabled ? renderDisabledChildren(children) : fallback;
    }
  }
  
  // User has required permissions, render children
  return children;
}

/**
 * Renders children in disabled state
 * Wraps children in a div with disabled styling and pointer-events-none
 */
function renderDisabledChildren(children: ReactNode): ReactNode {
  return (
    <div className="opacity-50 pointer-events-none cursor-not-allowed">
      {children}
    </div>
  );
}

/**
 * Hook for checking permissions in components
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const canCreateUser = usePermission('users', 'create');
 *   const canManageUsers = usePermission('users', 'manage');
 *   
 *   return (
 *     <div>
 *       {canCreateUser && <CreateUserButton />}
 *       {canManageUsers && <ManageUsersPanel />}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermission(
  module: PermissionModule,
  action: PermissionAction
): boolean {
  return permissionChecker.hasPermission(module, action);
}

/**
 * Hook for checking any of multiple permissions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const canModifyUsers = useAnyPermission([
 *     ['users', 'create'],
 *     ['users', 'update'],
 *     ['users', 'delete'],
 *   ]);
 *   
 *   return canModifyUsers ? <UserManagementPanel /> : <ReadOnlyView />;
 * }
 * ```
 */
export function useAnyPermission(
  permissions: Array<[PermissionModule, PermissionAction]>
): boolean {
  return permissionChecker.hasAnyPermission(permissions);
}

/**
 * Hook for checking all of multiple permissions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const canManageUserPermissions = useAllPermissions([
 *     ['users', 'read'],
 *     ['permissions', 'manage'],
 *   ]);
 *   
 *   return canManageUserPermissions ? <PermissionEditor /> : null;
 * }
 * ```
 */
export function useAllPermissions(
  permissions: Array<[PermissionModule, PermissionAction]>
): boolean {
  return permissionChecker.hasAllPermissions(permissions);
}

/**
 * Hook for getting user's hierarchy level
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hierarchyLevel = useHierarchyLevel();
 *   
 *   return (
 *     <div>
 *       <p>Your level: {hierarchyLevel}</p>
 *       {hierarchyLevel >= 5 && <AdminPanel />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useHierarchyLevel(): number {
  return permissionChecker.getHierarchyLevel();
}
