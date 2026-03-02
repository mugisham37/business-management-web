import { gql } from '@apollo/client';

export const AUDIT_LOG_FRAGMENT = gql`
  fragment AuditLogFragment on AuditLog {
    id
    userId
    action
    entityType
    entityId
    changes
    ipAddress
    userAgent
    timestamp
  }
`;
