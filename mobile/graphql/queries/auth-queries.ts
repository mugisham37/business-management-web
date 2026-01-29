/**
 * Mobile Authentication GraphQL Queries
 * Complete authentication queries for mobile app parity
 */

import { gql } from '@apollo/client';

/**
 * Get current user query
 */
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      tenantId
      role
      permissions
      firstName
      lastName
      displayName
      avatar
      lastLoginAt
      createdAt
      updatedAt
      isActive
      emailVerified
      mfaEnabled
      failedLoginAttempts
      lockedUntil
    }
  }
`;

/**
 * Check if MFA is required for user
 */
export const REQUIRES_MFA_QUERY = gql`
  query RequiresMfa($email: String!) {
    requiresMfa(email: $email) {
      required
      message
    }
  }
`;

/**
 * Get MFA setup information
 */
export const GET_MFA_SETUP_QUERY = gql`
  query GetMfaSetup {
    getMfaSetup {
      secret
      qrCodeUrl
      backupCodes
      manualEntryKey
    }
  }
`;

/**
 * Get MFA status
 */
export const GET_MFA_STATUS_QUERY = gql`
  query GetMfaStatus {
    getMfaStatus {
      isEnabled
      backupCodesCount
      lastUsedAt
    }
  }
`;

/**
 * Check if MFA is enabled for current user
 */
export const IS_MFA_ENABLED_QUERY = gql`
  query IsMfaEnabled {
    isMfaEnabled
  }
`;

/**
 * Get user permissions
 */
export const GET_USER_PERMISSIONS_QUERY = gql`
  query GetUserPermissions($userId: String!) {
    getUserPermissions(userId: $userId) {
      permissions
      role
      detailedPermissions {
        id
        userId
        permission
        resource
        resourceId
        grantedBy
        grantedAt
        expiresAt
        isInherited
      }
      includesInherited
    }
  }
`;

/**
 * Get my permissions
 */
export const GET_MY_PERMISSIONS_QUERY = gql`
  query GetMyPermissions {
    getMyPermissions {
      permissions
      role
      detailedPermissions {
        id
        userId
        permission
        resource
        resourceId
        grantedBy
        grantedAt
        expiresAt
        isInherited
      }
      includesInherited
    }
  }
`;

/**
 * Check permission
 */
export const CHECK_PERMISSION_QUERY = gql`
  query CheckPermission($input: CheckPermissionInput!) {
    checkPermission(input: $input) {
      hasPermission
      source
      grantedAt
      expiresAt
    }
  }
`;

/**
 * Get available permissions
 */
export const GET_AVAILABLE_PERMISSIONS_QUERY = gql`
  query GetAvailablePermissions {
    getAvailablePermissions {
      permissions
      resources
      actions
      roles {
        name
        permissions
      }
    }
  }
`;

/**
 * Get roles
 */
export const GET_ROLES_QUERY = gql`
  query GetRoles {
    getRoles {
      name
      permissions
    }
  }
`;

/**
 * Get social auth URL for OAuth providers
 */
export const GET_SOCIAL_AUTH_URL_QUERY = gql`
  query GetSocialAuthUrl($provider: String!, $redirectUri: String) {
    getSocialAuthUrl(provider: $provider, redirectUri: $redirectUri) {
      url
      state
      provider
    }
  }
`;

/**
 * Get connected social providers
 */
export const GET_CONNECTED_SOCIAL_PROVIDERS_QUERY = gql`
  query GetConnectedSocialProviders {
    getConnectedSocialProviders {
      provider
      providerId
      email
      displayName
      connectedAt
      lastUsed
    }
  }
`;

/**
 * Get security settings
 */
export const GET_SECURITY_SETTINGS_QUERY = gql`
  query GetSecuritySettings {
    getSecuritySettings {
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
  }
`;

/**
 * Get audit logs
 */
export const GET_AUDIT_LOGS_QUERY = gql`
  query GetAuditLogs($filter: AuditLogFilterInput, $pagination: PaginationInput) {
    getAuditLogs(filter: $filter, pagination: $pagination) {
      logs {
        id
        userId
        action
        resource
        resourceId
        ipAddress
        userAgent
        timestamp
        metadata
        severity
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

/**
 * Get user tier information
 */
export const GET_USER_TIER_QUERY = gql`
  query GetUserTier($userId: String!) {
    getUserTier(userId: $userId) {
      type
      features
      limits {
        maxUsers
        maxProducts
        maxTransactions
        storageLimit
        apiCallsPerMonth
        supportLevel
      }
      subscription {
        id
        status
        currentPeriodStart
        currentPeriodEnd
        cancelAtPeriodEnd
      }
    }
  }
`;

/**
 * Get my tier information
 */
export const GET_MY_TIER_QUERY = gql`
  query GetMyTier {
    getMyTier {
      type
      features
      limits {
        maxUsers
        maxProducts
        maxTransactions
        storageLimit
        apiCallsPerMonth
        supportLevel
      }
      subscription {
        id
        status
        currentPeriodStart
        currentPeriodEnd
        cancelAtPeriodEnd
      }
    }
  }
`;

/**
 * Basic tier feature access check
 */
export const BASIC_FEATURE_QUERY = gql`
  query BasicFeature {
    basicFeature
  }
`;

/**
 * Small tier feature access check
 */
export const SMALL_TIER_FEATURE_QUERY = gql`
  query SmallTierFeature {
    smallTierFeature
  }
`;

/**
 * Medium tier feature access check
 */
export const MEDIUM_TIER_FEATURE_QUERY = gql`
  query MediumTierFeature {
    mediumTierFeature
  }
`;

/**
 * Enterprise tier feature access check
 */
export const ENTERPRISE_FEATURE_QUERY = gql`
  query EnterpriseFeature {
    enterpriseFeature
  }
`;

/**
 * Get user's available features based on tier
 */
export const GET_USER_FEATURES_QUERY = gql`
  query GetUserFeatures {
    getUserFeatures
  }
`;

/**
 * Get upgrade recommendations for user
 */
export const GET_UPGRADE_RECOMMENDATIONS_QUERY = gql`
  query GetUpgradeRecommendations {
    getUpgradeRecommendations
  }
`;

/**
 * Get device sessions
 */
export const GET_DEVICE_SESSIONS_QUERY = gql`
  query GetDeviceSessions($userId: String) {
    getDeviceSessions(userId: $userId) {
      sessionId
      deviceInfo {
        deviceId
        platform
        deviceName
        browserInfo {
          name
          version
          userAgent
        }
        appVersion
        trusted
        fingerprint
      }
      ipAddress
      createdAt
      lastActivity
      isActive
      isCurrent
    }
  }
`;

/**
 * Get trusted devices
 */
export const GET_TRUSTED_DEVICES_QUERY = gql`
  query GetTrustedDevices {
    getTrustedDevices {
      deviceId
      deviceName
      platform
      fingerprint
      trustedAt
      lastUsed
      isActive
    }
  }
`;

/**
 * Get onboarding status
 */
export const GET_ONBOARDING_STATUS_QUERY = gql`
  query GetOnboardingStatus {
    getOnboardingStatus {
      isCompleted
      currentStep
      completedSteps
      recommendedTier
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
 * Get subscription status
 */
export const GET_SUBSCRIPTION_STATUS_QUERY = gql`
  query GetSubscriptionStatus {
    getSubscriptionStatus {
      id
      status
      tier
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      trialEnd
      paymentMethod {
        id
        type
        last4
        expiryMonth
        expiryYear
      }
      upcomingInvoice {
        id
        amountDue
        dueDate
      }
    }
  }
`;

/**
 * Validate session
 */
export const VALIDATE_SESSION_QUERY = gql`
  query ValidateSession($sessionId: String!) {
    validateSession(sessionId: $sessionId) {
      isValid
      expiresAt
      user {
        id
        email
        role
        permissions
      }
    }
  }
`;