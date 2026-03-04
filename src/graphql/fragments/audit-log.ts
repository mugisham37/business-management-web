import { gql } from '@apollo/client';

export const AUDIT_LOG_FRAGMENT = gql`
  fragment AuditLogFragment on AuditLogType {
    id
    organizationId
    userId
    action
    resourceType
    resourceId
    result
    oldValue
    newValue
    metadata
    hierarchyLevel
    ipAddress
    userAgent
    createdAt
  }
`;
