import { gql } from '@apollo/client';

/**
 * All GraphQL Subscriptions
 * 
 * Centralized subscription operations for real-time updates
 * across authentication, permissions, security, and other events.
 */

// Authentication Subscriptions
export const TENANT_AUTH_EVENTS = gql`
  subscription TenantAuthEvents {
    tenantAuthEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
  }
`;

export const ALL_TENANT_AUTH_EVENTS = gql`
  subscription AllTenantAuthEvents {
    allTenantAuthEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
  }
`;

export const USER_EVENTS = gql`
  subscription UserEvents($userId: String!) {
    userEvents(userId: $userId) {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
  }
`;

// Combined subscription for all user-specific events
export const ALL_USER_EVENTS = gql`
  subscription AllUserEvents {
    userAuthEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
    userPermissionEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
    userMfaEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
    userSessionEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
    userSocialProviderEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
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

// Security-focused subscriptions
export const ALL_SECURITY_EVENTS = gql`
  subscription AllSecurityEvents {
    securityAlerts {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
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

// Admin-level subscriptions for monitoring
export const ADMIN_MONITORING_EVENTS = gql`
  subscription AdminMonitoringEvents {
    tenantAuthEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
    tenantRoleEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
    securityAlerts {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
  }
`;