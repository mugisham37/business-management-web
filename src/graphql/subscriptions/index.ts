/**
 * GraphQL Subscriptions
 * 
 * This module exports all GraphQL subscription definitions for real-time updates.
 * 
 * Available Subscriptions:
 * - OnAuditLogCreated: Real-time audit log notifications
 * - OnPermissionChanged: Permission change notifications
 * - OnSessionRevoked: Session revocation notifications
 * 
 * Requirements: 5.2
 * 
 * @example
 * ```typescript
 * import { ON_AUDIT_LOG_CREATED, ON_PERMISSION_CHANGED, ON_SESSION_REVOKED } from '@/graphql/subscriptions';
 * import { useSubscription } from '@/lib/hooks/useSubscription';
 * 
 * // Subscribe to audit logs
 * const { data: auditLog } = useSubscription({
 *   query: ON_AUDIT_LOG_CREATED,
 *   variables: { userId: '123' },
 * });
 * 
 * // Subscribe to permission changes
 * const { data: permissions } = useSubscription({
 *   query: ON_PERMISSION_CHANGED,
 *   variables: { userId: '123' },
 * });
 * 
 * // Subscribe to session revocations
 * const { data: session } = useSubscription({
 *   query: ON_SESSION_REVOKED,
 *   variables: { userId: '123' },
 * });
 * ```
 */

// Audit log subscriptions
export { ON_AUDIT_LOG_CREATED } from './audit-logs';

// Permission subscriptions
export { ON_PERMISSION_CHANGED } from './permissions';

// Authentication subscriptions
export { ON_SESSION_REVOKED } from './auth';
