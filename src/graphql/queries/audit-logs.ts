import { gql } from '@apollo/client';
import { AUDIT_LOG_FRAGMENT } from '../fragments';

// Audit Log Queries

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
