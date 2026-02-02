import { gql } from '@apollo/client';

/**
 * Security GraphQL Operations
 * 
 * All security-related queries and mutations for
 * risk assessment, device management, and security monitoring.
 */

// Queries
export const MY_RISK_SCORE = gql`
  query MyRiskScore {
    myRiskScore
  }
`;

export const MY_SECURITY_STATUS = gql`
  query MySecurityStatus {
    mySecurityStatus
  }
`;

export const MY_SECURITY_RECOMMENDATIONS = gql`
  query MySecurityRecommendations {
    mySecurityRecommendations
  }
`;

export const IS_DEVICE_TRUSTED = gql`
  query IsDeviceTrusted($deviceFingerprint: String) {
    isDeviceTrusted(deviceFingerprint: $deviceFingerprint)
  }
`;

export const TENANT_SECURITY_METRICS = gql`
  query TenantSecurityMetrics {
    tenantSecurityMetrics
  }
`;

// Mutations
export const LOG_SECURITY_EVENT = gql`
  mutation LogSecurityEvent(
    $eventType: String!
    $description: String!
    $metadata: String
  ) {
    logSecurityEvent(
      eventType: $eventType
      description: $description
      metadata: $metadata
    ) {
      success
      message
      errors {
        message
        timestamp
      }
    }
  }
`;

// Subscriptions
export const USER_RISK_EVENTS = gql`
  subscription UserRiskEvents {
    userRiskEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
  }
`;