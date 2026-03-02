import { gql } from '@apollo/client';
import { AUDIT_LOG_FRAGMENT } from '../fragments';

export const GET_AUDIT_LOGS_QUERY = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetAuditLogs($filter: AuditLogFilterInput, $limit: Int, $offset: Int) {
    auditLogs(filter: $filter, limit: $limit, offset: $offset) {
      edges {
        ...AuditLogFragment
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalCount
      }
    }
  }
`;

export const GET_AUDIT_LOG_BY_ID_QUERY = gql`
  ${AUDIT_LOG_FRAGMENT}
  query GetAuditLogById($id: UUID!) {
    auditLog(id: $id) {
      ...AuditLogFragment
    }
  }
`;
