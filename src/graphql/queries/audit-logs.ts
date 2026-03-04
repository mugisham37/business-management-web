import { gql } from '@apollo/client';
import { AUDIT_LOG_FRAGMENT } from '../fragments';

// Audit Log Queries

/**
 * Get user audit logs with pagination support
 * @param userId - User ID to get logs for
 * @param filters - Optional filters including limit and offset for pagination
 */
export const GET_USER_AUDIT_LOGS = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetUserAuditLogs($userId: String!, $filters: AuditFiltersInput) {
    getUserAuditLogs(userId: $userId, filters: $filters) {
      logs {
        ...AuditLogFragment
      }
      total
    }
  }
`;

/**
 * Get organization audit logs with pagination support
 * @param organizationId - Organization ID to get logs for
 * @param filters - Optional filters including limit and offset for pagination
 */
export const GET_ORGANIZATION_AUDIT_LOGS = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetOrganizationAuditLogs($organizationId: String!, $filters: AuditFiltersInput) {
    getOrganizationAuditLogs(organizationId: $organizationId, filters: $filters) {
      logs {
        ...AuditLogFragment
      }
      total
    }
  }
`;

/**
 * Get resource audit logs
 * Note: Backend doesn't support pagination for this query yet
 * @param resourceId - Resource ID to get logs for
 * @param resourceType - Type of resource
 */
export const GET_RESOURCE_AUDIT_LOGS = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetResourceAuditLogs($resourceId: String!, $resourceType: String!) {
    getResourceAuditLogs(resourceId: $resourceId, resourceType: $resourceType) {
      logs {
        ...AuditLogFragment
      }
      total
    }
  }
`;
