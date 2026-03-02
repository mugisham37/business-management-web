import { useMemo } from 'react';
import { 
  permissionChecker, 
  type PermissionModule, 
  type PermissionAction 
} from '@/lib/auth/permission-checker';

/**
 * Permission check result interface
 * 
 * Requirements: 4.3, 9.1
 */
export interface PermissionCheckResult {
  /** Whether the user has the specified permission */
  allowed: boolean;
  
  /** Check if user has a specific permission */
  hasPermission: (module: PermissionModule, action: PermissionAction) => boolean;
  
  /** Check if user has any of the specified permissions */
  hasAnyPermission: (permissions: Array<[PermissionModule, PermissionAction]>) => boolean;
  
  /** Check if user has all of the specified permissions */
  hasAllPermissions: (permissions: Array<[PermissionModule, PermissionAction]>) => boolean;
  
  /** Get user's hierarchy level */
  getHierarchyLevel: () => number;
  
  /** Validate fingerprint */
  validateFingerprint: (expectedFingerprint: string) => boolean;
}

/**
 * usePermission Hook
 * 
 * React hook for checking user permissions. Integrates with the PermissionChecker
 * to provide permission checking capabilities in React components.
 * 
 * Features:
 * - Check specific permission (module + action)
 * - Check multiple permissions (any/all)
 * - Get user hierarchy level
 * - Validate permission fingerprint
 * - Cached permission checks for performance
 * 
 * The hook returns an object with:
 * - `allowed`: Boolean indicating if user has the specified permission
 * - Permission check methods for flexible permission validation
 * 
 * Requirements: 4.3, 9.1
 * 
 * @param module - Permission module to check (optional)
 * @param action - Permission action to check (optional)
 * @returns Permission check result with allowed status and check methods
 * 
 * @example
 * ```typescript
 * // Check specific permission
 * function UserManagement() {
 *   const { allowed } = usePermission('users', 'create');
 *   
 *   return (
 *     <div>
 *       {allowed && <button>Create User</button>}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Use permission check methods
 * function Dashboard() {
 *   const { hasAnyPermission, getHierarchyLevel } = usePermission();
 *   
 *   const canViewReports = hasAnyPermission([
 *     ['reports', 'read'],
 *     ['audit_logs', 'read'],
 *   ]);
 *   
 *   const hierarchyLevel = getHierarchyLevel();
 *   
 *   return (
 *     <div>
 *       {canViewReports && <ReportsSection />}
 *       <p>Your level: {hierarchyLevel}</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Conditional rendering based on permissions
 * function AdminPanel() {
 *   const { hasAllPermissions } = usePermission();
 *   
 *   const isFullAdmin = hasAllPermissions([
 *     ['users', 'manage'],
 *     ['permissions', 'manage'],
 *     ['organizations', 'manage'],
 *   ]);
 *   
 *   if (!isFullAdmin) {
 *     return <div>Access Denied</div>;
 *   }
 *   
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function usePermission(
  module?: PermissionModule,
  action?: PermissionAction
): PermissionCheckResult {
  // Check if user has the specified permission (if module and action provided)
  const allowed = useMemo(() => {
    if (module && action) {
      return permissionChecker.hasPermission(module, action);
    }
    return false;
  }, [module, action]);

  // Memoize permission check methods to avoid recreating on every render
  const checkMethods = useMemo(() => ({
    hasPermission: (checkModule: PermissionModule, checkAction: PermissionAction): boolean => {
      return permissionChecker.hasPermission(checkModule, checkAction);
    },
    
    hasAnyPermission: (permissions: Array<[PermissionModule, PermissionAction]>): boolean => {
      return permissionChecker.hasAnyPermission(permissions);
    },
    
    hasAllPermissions: (permissions: Array<[PermissionModule, PermissionAction]>): boolean => {
      return permissionChecker.hasAllPermissions(permissions);
    },
    
    getHierarchyLevel: (): number => {
      return permissionChecker.getHierarchyLevel();
    },
    
    validateFingerprint: (expectedFingerprint: string): boolean => {
      return permissionChecker.validateFingerprint(expectedFingerprint);
    },
  }), []);

  return {
    allowed,
    ...checkMethods,
  };
}
