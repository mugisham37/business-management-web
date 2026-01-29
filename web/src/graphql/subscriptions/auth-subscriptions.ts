/**
 * Complete Authentication GraphQL Subscriptions
 * Real-time authentication event subscriptions
 */

import { gql } from '@apollo/client';

/**
 * Auth Event Types
 */
export enum AuthEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTERED = 'USER_REGISTERED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  NEW_DEVICE_LOGIN = 'NEW_DEVICE_LOGIN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  TIER_CHANGED = 'TIER_CHANGED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
}

/**
 * Auth Event Interface
 */
export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  deviceInfo?: {
    deviceId: string;
    platform: string;
    deviceName: string;
    fingerprint: string;
  };
}

/**
 * User authentication events subscription
 */
export const USER_AUTH_EVENTS_SUBSCRIPTION = gql`
  subscription UserAuthEvents {
    userAuthEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
    }
  }
`;

/**
 * User permission events subscription
 */
export const USER_PERMISSION_EVENTS_SUBSCRIPTION = gql`
  subscription UserPermissionEvents {
    userPermissionEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      sessionId
    }
  }
`;

/**
 * User MFA events subscription
 */
export const USER_MFA_EVENTS_SUBSCRIPTION = gql`
  subscription UserMfaEvents {
    userMfaEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      sessionId
    }
  }
`;

/**
 * User session events subscription
 */
export const USER_SESSION_EVENTS_SUBSCRIPTION = gql`
  subscription UserSessionEvents {
    userSessionEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
    }
  }
`;

/**
 * Tenant authentication events subscription (admin only)
 */
export const TENANT_AUTH_EVENTS_SUBSCRIPTION = gql`
  subscription TenantAuthEvents {
    tenantAuthEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
    }
  }
`;

/**
 * Security alerts subscription
 */
export const SECURITY_ALERTS_SUBSCRIPTION = gql`
  subscription SecurityAlerts {
    securityAlerts {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
      severity
      alertId
      description
    }
  }
`;

/**
 * Tenant role events subscription (admin only)
 */
export const TENANT_ROLE_EVENTS_SUBSCRIPTION = gql`
  subscription TenantRoleEvents {
    tenantRoleEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      role
      permissions
      grantedBy
    }
  }
`;

/**
 * Specific user events subscription (admin only)
 */
export const USER_EVENTS_SUBSCRIPTION = gql`
  subscription UserEvents($userId: String!) {
    userEvents(userId: $userId) {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
    }
  }
`;

/**
 * Real-time permission updates subscription
 */
export const PERMISSION_UPDATES_SUBSCRIPTION = gql`
  subscription PermissionUpdates {
    permissionUpdates {
      userId
      permissions
      role
      timestamp
      grantedBy
      action
    }
  }
`;

/**
 * Real-time tier changes subscription
 */
export const TIER_CHANGES_SUBSCRIPTION = gql`
  subscription TierChanges {
    tierChanges {
      userId
      oldTier
      newTier
      timestamp
      reason
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
 * Session status updates subscription
 */
export const SESSION_STATUS_SUBSCRIPTION = gql`
  subscription SessionStatus {
    sessionStatus {
      sessionId
      userId
      status
      timestamp
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
      ipAddress
      reason
    }
  }
`;

/**
 * Device trust status updates subscription
 */
export const DEVICE_TRUST_SUBSCRIPTION = gql`
  subscription DeviceTrustUpdates {
    deviceTrustUpdates {
      deviceId
      userId
      trusted
      timestamp
      reason
      deviceInfo {
        platform
        deviceName
        fingerprint
      }
    }
  }
`;

/**
 * MFA status updates subscription
 */
export const MFA_STATUS_SUBSCRIPTION = gql`
  subscription MfaStatusUpdates {
    mfaStatusUpdates {
      userId
      enabled
      timestamp
      method
      backupCodesCount
    }
  }
`;

/**
 * Security settings updates subscription
 */
export const SECURITY_SETTINGS_SUBSCRIPTION = gql`
  subscription SecuritySettingsUpdates {
    securitySettingsUpdates {
      userId
      settings {
        mfaEnabled
        sessionTimeout
        maxSessions
        passwordExpiryDays
        requirePasswordChange
        allowedIpAddresses
        blockedIpAddresses
        timeBasedAccess {
          allowedHours
          timezone
        }
      }
      timestamp
      updatedBy
    }
  }
`;

/**
 * Onboarding progress subscription
 */
export const ONBOARDING_PROGRESS_SUBSCRIPTION = gql`
  subscription OnboardingProgress {
    onboardingProgress {
      userId
      currentStep
      completedSteps
      recommendedTier
      timestamp
      businessProfile {
        companySize
        industry
        monthlyRevenue
        teamSize
        primaryUseCase
        integrationNeeds
      }
    }
  }
`;

/**
 * Subscription status updates
 */
export const SUBSCRIPTION_STATUS_SUBSCRIPTION = gql`
  subscription SubscriptionStatusUpdates {
    subscriptionStatusUpdates {
      userId
      subscription {
        id
        status
        tier
        currentPeriodStart
        currentPeriodEnd
        cancelAtPeriodEnd
        trialEnd
      }
      timestamp
      reason
    }
  }
`;

/**
 * Failed login attempts subscription (admin only)
 */
export const FAILED_LOGIN_ATTEMPTS_SUBSCRIPTION = gql`
  subscription FailedLoginAttempts {
    failedLoginAttempts {
      email
      ipAddress
      userAgent
      timestamp
      attemptCount
      lockedUntil
      deviceInfo {
        deviceId
        platform
        deviceName
        fingerprint
      }
    }
  }
`;

/**
 * Account lockout events subscription (admin only)
 */
export const ACCOUNT_LOCKOUT_SUBSCRIPTION = gql`
  subscription AccountLockoutEvents {
    accountLockoutEvents {
      userId
      email
      lockedUntil
      reason
      timestamp
      ipAddress
      attemptCount
    }
  }
`;