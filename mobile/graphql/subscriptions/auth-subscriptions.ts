/**
 * Mobile Authentication GraphQL Subscriptions
 * Real-time authentication event subscriptions for mobile app
 */

import { gql } from '@apollo/client';

/**
 * Subscribe to security events for current user (mobile-specific)
 */
export const SECURITY_EVENTS_SUBSCRIPTION = gql`
  subscription SecurityEvents($userId: ID!) {
    securityEvents(userId: $userId) {
      type
      userId
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
      ipAddress
      timestamp
      metadata
      severity
    }
  }
`;

/**
 * Subscribe to authentication events for current user
 */
export const AUTH_EVENTS_SUBSCRIPTION = gql`
  subscription AuthEvents {
    authEvents {
      type
      userId
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
      ipAddress
      timestamp
      metadata
      severity
    }
  }
`;

/**
 * Subscribe to permission changes for current user
 */
export const PERMISSION_CHANGES_SUBSCRIPTION = gql`
  subscription PermissionChanges {
    permissionChanges {
      type
      userId
      permission
      resource
      resourceId
      grantedBy
      timestamp
      metadata
    }
  }
`;

/**
 * Subscribe to security alerts
 */
export const SECURITY_ALERTS_SUBSCRIPTION = gql`
  subscription SecurityAlerts {
    securityAlerts {
      id
      type
      severity
      userId
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
      ipAddress
      timestamp
      description
      metadata
      resolved
      resolvedAt
      resolvedBy
    }
  }
`;

/**
 * Subscribe to MFA events for current user
 */
export const MFA_EVENTS_SUBSCRIPTION = gql`
  subscription MfaEvents {
    mfaEvents {
      type
      userId
      timestamp
      deviceInfo {
        deviceId
        platform
        deviceName
      }
      ipAddress
      success
      metadata
    }
  }
`;

/**
 * Subscribe to session events for current user
 */
export const SESSION_EVENTS_SUBSCRIPTION = gql`
  subscription SessionEvents {
    sessionEvents {
      type
      sessionId
      userId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
      ipAddress
      timestamp
      expiresAt
      metadata
    }
  }
`;

/**
 * Subscribe to tier changes for current user
 */
export const TIER_CHANGES_SUBSCRIPTION = gql`
  subscription TierChanges {
    tierChanges {
      type
      userId
      oldTier
      newTier
      timestamp
      reason
      activatedFeatures
      deactivatedFeatures
      subscription {
        id
        status
        currentPeriodStart
        currentPeriodEnd
      }
    }
  }
`;

/**
 * Subscribe to payment events for current user
 */
export const PAYMENT_EVENTS_SUBSCRIPTION = gql`
  subscription PaymentEvents {
    paymentEvents {
      type
      userId
      paymentId
      subscriptionId
      amount
      currency
      status
      timestamp
      metadata
    }
  }
`;

/**
 * Subscribe to device trust changes
 */
export const DEVICE_TRUST_EVENTS_SUBSCRIPTION = gql`
  subscription DeviceTrustEvents {
    deviceTrustEvents {
      type
      userId
      deviceId
      deviceInfo {
        platform
        deviceName
        fingerprint
      }
      trusted
      timestamp
      ipAddress
      metadata
    }
  }
`;

/**
 * Subscribe to onboarding progress updates
 */
export const ONBOARDING_PROGRESS_SUBSCRIPTION = gql`
  subscription OnboardingProgress {
    onboardingProgress {
      type
      userId
      sessionId
      currentStep
      completedSteps
      recommendedTier
      timestamp
      metadata
    }
  }
`;

/**
 * Subscribe to session limit events
 */
export const SESSION_LIMIT_EVENTS_SUBSCRIPTION = gql`
  subscription SessionLimitEvents {
    sessionLimitEvents {
      type
      userId
      currentSessions
      maxSessions
      terminatedSessionId
      timestamp
      metadata
    }
  }
`;

/**
 * Subscribe to push notification events (mobile-specific)
 */
export const PUSH_NOTIFICATION_EVENTS_SUBSCRIPTION = gql`
  subscription PushNotificationEvents {
    pushNotificationEvents {
      type
      userId
      title
      body
      data
      timestamp
      priority
      category
    }
  }
`;

/**
 * Subscribe to biometric authentication events (mobile-specific)
 */
export const BIOMETRIC_AUTH_EVENTS_SUBSCRIPTION = gql`
  subscription BiometricAuthEvents {
    biometricAuthEvents {
      type
      userId
      deviceId
      biometricType
      success
      timestamp
      metadata
    }
  }
`;

/**
 * Subscribe to deep link events (mobile-specific)
 */
export const DEEP_LINK_EVENTS_SUBSCRIPTION = gql`
  subscription DeepLinkEvents {
    deepLinkEvents {
      type
      userId
      url
      handled
      timestamp
      metadata
    }
  }
`;