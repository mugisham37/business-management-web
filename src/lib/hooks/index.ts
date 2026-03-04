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
 * 
 * Requirements: 4.2, 4.3, 5.1, 9.1
 * 
 * @example
 * ```typescript
 * import { useAuth, usePermission, useWebSocket, useSubscription } from '@/lib/hooks';
 * 
 * // Authentication
 * function LoginPage() {
 *   const { login, isAuthenticated } = useAuth();
 *   // ...
 * }
 * 
 * // Permission checking
 * function UserManagement() {
 *   const { allowed } = usePermission('users', 'create');
 *   // ...
 * }
 * 
 * // WebSocket connection
 * function RealtimeFeature() {
 *   const { isConnected, connect } = useWebSocket();
 *   // ...
 * }
 * 
 * // GraphQL subscriptions
 * function AuditLogMonitor() {
 *   const { data, loading, error } = useSubscription({
 *     query: ON_AUDIT_LOG_CREATED,
 *     variables: { userId: '123' },
 *   });
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
