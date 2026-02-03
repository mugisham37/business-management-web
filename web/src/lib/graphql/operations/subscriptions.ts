import { gql } from '@apollo/client';

/**
 * Subscription GraphQL Operations
 * 
 * Real-time subscriptions for authentication, security, and system events.
 */

// Re-export all subscription operations from individual modules
export {
  USER_AUTH_EVENTS,
  USER_SESSION_EVENTS,
  AUTH_STATUS_CHANGED,
} from './auth';

export {
  USER_MFA_EVENTS,
  MFA_STATUS_CHANGED,
} from './mfa';

export {
  USER_RISK_EVENTS,
  SECURITY_ALERTS,
  DEVICE_TRUST_CHANGED,
  SESSION_EVENTS,
} from './security';

export {
  USER_PERMISSION_EVENTS,
  TENANT_ROLE_EVENTS,
  PERMISSION_CHANGES,
} from './permissions';

export {
  SOCIAL_AUTH_EVENTS,
  PROVIDER_STATUS_CHANGED,
} from './social-auth';

export {
  TIER_CHANGED,
  FEATURE_USAGE_UPDATED,
  SUBSCRIPTION_STATUS_CHANGED,
  TRIAL_EXPIRING,
} from './tier';

// Global system subscriptions
export const SYSTEM_NOTIFICATIONS = gql`
  subscription SystemNotifications {
    systemNotifications {
      id
      type
      title
      message
      severity
      timestamp
      actionRequired
      metadata
    }
  }
`;

export const USER_NOTIFICATIONS = gql`
  subscription UserNotifications {
    userNotifications {
      id
      type
      title
      message
      read
      timestamp
      actionUrl
      metadata
    }
  }
`;

export const TENANT_EVENTS = gql`
  subscription TenantEvents {
    tenantEvents {
      type
      tenantId
      timestamp
      metadata
    }
  }
`;