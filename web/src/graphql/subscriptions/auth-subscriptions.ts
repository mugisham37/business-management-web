/**
 * Authentication GraphQL Subscriptions
 * Real-time authentication and security event subscriptions
 */

import { gql } from '@apollo/client';

/**
 * User authentication events subscription
 */
export const USER_AUTH_EVENTS_SUBSCRIPTION = gql`
  subscription UserAuthEvents {
    userAuthEvents {
      id
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      deviceInfo {
        platform
        deviceId
        appVersion
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
      id
      type
      userId
      tenantId
      timestamp
      metadata
      permission
      resource
      resourceId
      grantedBy
    }
  }
`;

/**
 * Tenant authentication events subscription (admin only)
 */
export const TENANT_AUTH_EVENTS_SUBSCRIPTION = gql`
  subscription TenantAuthEvents {
    tenantAuthEvents {
      id
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      severity
    }
  }
`;

/**
 * Security alerts subscription
 */
export const SECURITY_ALERTS_SUBSCRIPTION = gql`
  subscription SecurityAlerts {
    securityAlerts {
      id
      type
      severity
      title
      message
      timestamp
      acknowledged
      actionRequired
      metadata
      userId
      tenantId
    }
  }
`;

/**
 * User MFA events subscription
 */
export const USER_MFA_EVENTS_SUBSCRIPTION = gql`
  subscription UserMfaEvents {
    userMfaEvents {
      id
      type
      userId
      tenantId
      timestamp
      metadata
      success
      method
    }
  }
`;

/**
 * User session events subscription
 */
export const USER_SESSION_EVENTS_SUBSCRIPTION = gql`
  subscription UserSessionEvents {
    userSessionEvents {
      id
      type
      userId
      tenantId
      sessionId
      timestamp
      metadata
      ipAddress
      userAgent
      deviceInfo {
        platform
        deviceId
        appVersion
      }
    }
  }
`;

/**
 * Tenant role events subscription (admin only)
 */
export const TENANT_ROLE_EVENTS_SUBSCRIPTION = gql`
  subscription TenantRoleEvents {
    tenantRoleEvents {
      id
      type
      userId
      tenantId
      timestamp
      metadata
      role
      assignedBy
    }
  }
`;

/**
 * User events subscription for specific user (admin only)
 */
export const USER_EVENTS_SUBSCRIPTION = gql`
  subscription UserEvents($userId: String!) {
    userEvents(userId: $userId) {
      id
      type
      userId
      tenantId
      timestamp
      metadata
      severity
      description
    }
  }
`;

/**
 * Auth event types enum
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
  DEVICE_TRUSTED = 'DEVICE_TRUSTED',
  DEVICE_UNTRUSTED = 'DEVICE_UNTRUSTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

/**
 * Security alert types enum
 */
export enum SecurityAlertType {
  NEW_DEVICE_LOGIN = 'NEW_DEVICE_LOGIN',
  SUSPICIOUS_LOGIN = 'SUSPICIOUS_LOGIN',
  MULTIPLE_FAILED_ATTEMPTS = 'MULTIPLE_FAILED_ATTEMPTS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_BREACH = 'PASSWORD_BREACH',
  PERMISSION_ESCALATION = 'PERMISSION_ESCALATION',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY',
}

/**
 * Auth event interface
 */
export interface AuthEvent {
  id: string;
  type: AuthEventType;
  userId: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    platform: string;
    deviceId: string;
    appVersion: string;
  };
}

/**
 * Security alert interface
 */
export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired?: boolean;
  metadata?: Record<string, any>;
  userId?: string;
  tenantId: string;
}