import { gql } from '@apollo/client';
import { AUDIT_LOG_FRAGMENT } from '../fragments';

/**
 * Subscription: OnAuditLogCreated
 * 
 * Subscribe to new audit log entries as they are created.
 * Useful for real-time audit log monitoring and compliance dashboards.
 * 
 * Features:
 * - Real-time audit log notifications
 * - Optional filtering by user, entity type, or action
 * - Includes full audit log details
 * 
 * Requirements: 5.2
 * 
 * @example
 * ```typescript
 * const { data, loading, error } = useSubscription({
 *   query: ON_AUDIT_LOG_CREATED,
 *   variables: { 
 *     filter: {
 *       userId: '123',
 *       entityType: 'USER'
 *     }
 *   },
 *   onData: (data) => {
 *     console.log('New audit log:', data.auditLogCreated);
 *   },
 * });
 * ```
 */
export const ON_AUDIT_LOG_CREATED = gql`
  ${AUDIT_LOG_FRAGMENT}
  subscription OnAuditLogCreated($filter: AuditLogFilterInput) {
    auditLogCreated(filter: $filter) {
      ...AuditLogFragment
    }
  }
`;
