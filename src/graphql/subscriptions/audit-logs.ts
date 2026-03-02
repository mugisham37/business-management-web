import { gql } from '@apollo/client';

/**
 * Subscription: OnAuditLogCreated
 * 
 * Subscribe to new audit log entries as they are created.
 * Useful for real-time audit log monitoring and compliance dashboards.
 * 
 * Features:
 * - Real-time audit log notifications
 * - Optional filtering by user, resource, or action
 * - Includes full audit log details
 * 
 * Requirements: 5.2
 * 
 * @example
 * ```typescript
 * const { data, loading, error } = useSubscription({
 *   query: ON_AUDIT_LOG_CREATED,
 *   variables: { 
 *     userId: '123',
 *     resourceType: 'USER'
 *   },
 *   onData: (data) => {
 *     console.log('New audit log:', data.onAuditLogCreated);
 *   },
 * });
 * ```
 */
export const ON_AUDIT_LOG_CREATED = gql`
  subscription OnAuditLogCreated(
    $userId: String
    $resourceType: String
    $action: String
    $organizationId: String
  ) {
    onAuditLogCreated(
      userId: $userId
      resourceType: $resourceType
      action: $action
      organizationId: $organizationId
    ) {
      id
      userId
      action
      resourceType
      resourceId
      oldValue
      newValue
      result
      ipAddress
      userAgent
      metadata
      hierarchyLevel
      organizationId
      createdAt
    }
  }
`;
