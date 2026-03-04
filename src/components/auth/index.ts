/**
 * Authentication Components
 * 
 * Components for authentication and authorization:
 * - PermissionGate: Conditionally render based on permissions
 * - Permission hooks: Check permissions in components
 */

export {
  PermissionGate,
  usePermission,
  useAnyPermission,
  useAllPermissions,
  useHierarchyLevel,
  type PermissionGateProps,
} from './PermissionGate';
