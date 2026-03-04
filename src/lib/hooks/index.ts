/**
 * Custom React Hooks
 * 
 * This module exports all custom React hooks for the foundation layer.
 * 
 * Available Hooks:
 * - useAuth: Authentication state and methods
 * - usePermission: Permission checking utilities
 * - useWebSocket: WebSocket connection management
 * - useSubscription: GraphQL subscription hook for real-time updates
 * - useUsers: User management operations
 * - usePermissions: Permission management operations
 * - useOrganization: Organization management operations
 * - useBranches: Branch management operations
 * - useDepartments: Department management operations
 * - useBusinessRules: Business rule management operations
 * - useAuditLogs: Audit log queries
 * - useSessions: Session management operations
 * - useHealthCheck: Health check monitoring
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.2, 4.3, 5.1, 9.1
 * 
 * @example
 * ```typescript
 * import { useAuth, useUsers, usePermissions } from '@/lib/hooks';
 * 
 * // Authentication
 * function LoginPage() {
 *   const { login, isAuthenticated } = useAuth();
 *   // ...
 * }
 * 
 * // User management
 * function UserManagement() {
 *   const { users, createManager, loading, error } = useUsers();
 *   // ...
 * }
 * 
 * // Permission management
 * function PermissionManagement() {
 *   const { permissions, grantPermissions, loading } = usePermissions(userId);
 *   // ...
 * }
 * ```
 */

// Authentication hook
export { useAuth, AuthProvider } from './useAuth';
export type { AuthState, AuthContextValue, AuthProviderProps } from './useAuth';

// Permission hook
export { usePermission } from './usePermission';
export type { PermissionCheckResult } from './usePermission';

// WebSocket hook
export { useWebSocket } from './useWebSocket';
export type { UseWebSocketReturn } from './useWebSocket';

// Subscription hook
export { useSubscription } from './useSubscription';
export type { UseSubscriptionOptions, UseSubscriptionReturn } from './useSubscription';

// Backend connection hook
export { useBackendConnection } from './useBackendConnection';
export type { ConnectionStatus, BackendConnectionState } from './useBackendConnection';

// User management hook
export { useUsers } from './useUsers';
export type {
  UseUsersReturn,
  CreateManagerInput,
  CreateWorkerInput,
  UpdateUserInput,
  CreateUserResponse,
} from './useUsers';

// Permission management hook
export { usePermissions } from './usePermissions';
export type {
  UsePermissionsReturn,
  GrantPermissionsInput,
  RevokePermissionsInput,
  PermissionInput,
  Permission,
  PermissionSnapshot,
} from './usePermissions';

// Organization management hook
export { useOrganization } from './useOrganization';
export type {
  UseOrganizationReturn,
  UpdateOrganizationInput,
  OrganizationSettings,
  Organization,
} from './useOrganization';

// Branch management hook
export { useBranches } from './useBranches';
export type {
  UseBranchesReturn,
  CreateBranchInput,
  UpdateBranchInput,
} from './useBranches';

// Department management hook
export { useDepartments } from './useDepartments';
export type {
  UseDepartmentsReturn,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from './useDepartments';

// Business rule management hook
export { useBusinessRules } from './useBusinessRules';
export type {
  UseBusinessRulesReturn,
  CreateBusinessRuleInput,
  UpdateBusinessRuleInput,
} from './useBusinessRules';

// Audit logs hook
export { useAuditLogs } from './useAuditLogs';
export type {
  UseAuditLogsReturn,
  AuditLog,
  PaginationParams,
  AuditLogsResponse,
} from './useAuditLogs';

// Session management hook
export { useSessions } from './useSessions';
export type {
  UseSessionsReturn,
  Session,
} from './useSessions';

// Health check hook
export { useHealthCheck } from './useHealthCheck';
export type {
  UseHealthCheckReturn,
  ComponentHealth,
  HealthCheckResponse,
} from './useHealthCheck';

// Loading state utilities
export { withLoadingState, useLoadingState } from './withLoadingState';
export type {
  LoadingIndicatorType,
  LoadingStateConfig,
  WithLoadingStateProps,
} from './withLoadingState';

// Mutation state utilities
export { useMutationState, useConcurrentMutations, useFormSubmit } from './useMutationState';
export type {
  MutationState,
} from './useMutationState';

// Operation queue utilities
export { useOperationQueue, useLoadingStates } from './useOperationQueue';
export type {
  OperationStatus,
  Operation,
} from './useOperationQueue';

// Optimistic update utilities
export { useOptimisticUpdate, useOptimisticList } from './useOptimisticUpdate';
export type {
  OptimisticUpdateState,
} from './useOptimisticUpdate';

// Progress tracking utilities
export { useProgress, useBatchProgress, useQueryProgress } from './useProgress';
export type {
  ProgressState,
} from './useProgress';
