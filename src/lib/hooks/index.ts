/**
 * Custom React Hooks
 * 
 * This module exports all custom React hooks for the foundation layer.
 * 
 * Available Hooks:
 * - useSubscription: GraphQL subscription hook for real-time updates
 * 
 * Requirements: 9.1
 * 
 * @example
 * ```typescript
 * import { useSubscription } from '@/lib/hooks';
 * import { ON_AUDIT_LOG_CREATED } from '@/graphql/subscriptions';
 * 
 * function AuditLogMonitor() {
 *   const { data, loading, error } = useSubscription({
 *     query: ON_AUDIT_LOG_CREATED,
 *     variables: { userId: '123' },
 *   });
 *   
 *   if (loading) return <div>Connecting...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return <div>Latest audit log: {data?.onAuditLogCreated.action}</div>;
 * }
 * ```
 */

export { useSubscription } from './useSubscription';
export type { UseSubscriptionOptions, UseSubscriptionReturn } from './useSubscription';
