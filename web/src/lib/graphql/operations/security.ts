import { gql } from '@apollo/client';

/**
 * Security GraphQL Operations
 * 
 * Queries and mutations for security monitoring, risk assessment, and threat detection.
 */

// Fragments
export const RISK_SCORE_FRAGMENT = gql`
  fragment RiskScoreFragment on RiskScoreResponse {
    score
    level
    factors
    recommendations
    timestamp
  }
`;

export const SECURITY_STATUS_FRAGMENT = gql`
  fragment SecurityStatusFragment on SecurityStatusResponse {
    securityLevel
    riskScore
    mfaEnabled
    deviceTrusted
    networkTrusted
    activeSessions
    lastSecurityEvent
    recommendations
  }
`;

export const SECURITY_EVENT_FRAGMENT = gql`
  fragment SecurityEventFragment on SecurityEvent {
    id
    type
    severity
    description
    timestamp
    metadata
    resolved
    resolvedAt
  }
`;

// Queries
export const MY_RISK_SCORE = gql`
  query MyRiskScore {
    myRiskScore {
      ...RiskScoreFragment
    }
  }
  ${RISK_SCORE_FRAGMENT}
`;

export const MY_SECURITY_STATUS = gql`
  query MySecurityStatus {
    mySecurityStatus {
      ...SecurityStatusFragment
    }
  }
  ${SECURITY_STATUS_FRAGMENT}
`;

export const MY_SECURITY_RECOMMENDATIONS = gql`
  query MySecurityRecommendations {
    mySecurityRecommendations {
      recommendations
      priority
      category
      actionRequired
    }
  }
`;

export const IS_DEVICE_TRUSTED = gql`
  query IsDeviceTrusted($deviceFingerprint: String) {
    isDeviceTrusted(deviceFingerprint: $deviceFingerprint) {
      trusted
      trustScore
      lastSeen
      registeredAt
    }
  }
`;

export const GET_SECURITY_EVENTS = gql`
  query GetSecurityEvents($input: SecurityEventsInput!) {
    securityEvents(input: $input) {
      events {
        ...SecurityEventFragment
      }
      totalCount
      hasMore
    }
  }
  ${SECURITY_EVENT_FRAGMENT}
`;

export const GET_ACTIVE_SESSIONS = gql`
  query GetActiveSessions {
    activeSessions {
      id
      deviceInfo
      location
      ipAddress
      lastActivity
      current
      createdAt
    }
  }
`;

export const GET_LOGIN_HISTORY = gql`
  query GetLoginHistory($input: LoginHistoryInput!) {
    loginHistory(input: $input) {
      logins {
        id
        timestamp
        ipAddress
        location
        deviceInfo
        success
        riskScore
        mfaUsed
      }
      totalCount
      hasMore
    }
  }
`;

// Mutations
export const LOG_SECURITY_EVENT = gql`
  mutation LogSecurityEvent($input: LogSecurityEventInput!) {
    logSecurityEvent(input: $input) {
      success
      eventId
      message
    }
  }
`;

export const TRUST_DEVICE = gql`
  mutation TrustDevice($input: TrustDeviceInput!) {
    trustDevice(input: $input) {
      success
      message
      trustScore
    }
  }
`;

export const REVOKE_DEVICE_TRUST = gql`
  mutation RevokeDeviceTrust($input: RevokeDeviceTrustInput!) {
    revokeDeviceTrust(input: $input) {
      success
      message
    }
  }
`;

export const REVOKE_SESSION = gql`
  mutation RevokeSession($sessionId: String!) {
    revokeSession(sessionId: $sessionId) {
      success
      message
    }
  }
`;

export const REVOKE_ALL_SESSIONS = gql`
  mutation RevokeAllSessions {
    revokeAllSessions {
      success
      message
      revokedCount
    }
  }
`;

export const UPDATE_SECURITY_SETTINGS = gql`
  mutation UpdateSecuritySettings($input: SecuritySettingsInput!) {
    updateSecuritySettings(input: $input) {
      success
      message
      settings {
        mfaRequired
        deviceTrustRequired
        sessionTimeout
        maxConcurrentSessions
        allowedIpRanges
      }
    }
  }
`;

export const REPORT_SUSPICIOUS_ACTIVITY = gql`
  mutation ReportSuspiciousActivity($input: ReportSuspiciousActivityInput!) {
    reportSuspiciousActivity(input: $input) {
      success
      message
      reportId
    }
  }
`;

export const ACKNOWLEDGE_SECURITY_EVENT = gql`
  mutation AcknowledgeSecurityEvent($eventId: String!) {
    acknowledgeSecurityEvent(eventId: $eventId) {
      success
      message
    }
  }
`;

export const RESOLVE_SECURITY_EVENT = gql`
  mutation ResolveSecurityEvent($input: ResolveSecurityEventInput!) {
    resolveSecurityEvent(input: $input) {
      success
      message
    }
  }
`;

// Subscriptions
export const USER_RISK_EVENTS = gql`
  subscription UserRiskEvents {
    userRiskEvents {
      type
      riskScore
      level
      factors
      timestamp
      metadata
    }
  }
`;

export const SECURITY_ALERTS = gql`
  subscription SecurityAlerts {
    securityAlerts {
      id
      type
      severity
      message
      timestamp
      actionRequired
      metadata
    }
  }
`;

export const DEVICE_TRUST_CHANGED = gql`
  subscription DeviceTrustChanged {
    deviceTrustChanged {
      deviceId
      trusted
      trustScore
      timestamp
      reason
    }
  }
`;

export const SESSION_EVENTS = gql`
  subscription SessionEvents {
    sessionEvents {
      type
      sessionId
      timestamp
      metadata
    }
  }
`;