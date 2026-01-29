/**
 * Complete Authentication GraphQL Queries
 * All authentication-related queries for the AuthGateway
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
 * Check specific permission
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
 * Get all available permissions
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
 * Get all roles
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
 * Get role permissions
 */
export const GET_ROLE_PERMISSIONS_QUERY = gql`
  query GetRolePermissions($role: String!) {
    getRolePermissions(role: $role)
  }
`;

/**
 * Check if user has permission
 */
export const HAS_PERMISSION_QUERY = gql`
  query HasPermission($userId: String!, $permission: String!, $resource: String, $resourceId: String) {
    hasPermission(userId: $userId, permission: $permission, resource: $resource, resourceId: $resourceId)
  }
`;

/**
 * Get all permissions for system
 */
export const GET_ALL_PERMISSIONS_QUERY = gql`
  query GetAllPermissions {
    getAllPermissions
  }
`;

/**
 * Get detailed permissions for user
 */
export const GET_DETAILED_PERMISSIONS_QUERY = gql`
  query GetDetailedPermissions($userId: String!) {
    getDetailedPermissions(userId: $userId) {
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
  }
`;

/**
 * Get social auth URL
 */
export const GET_SOCIAL_AUTH_URL_QUERY = gql`
  query GetSocialAuthUrl($provider: String!, $tenantId: String!) {
    getSocialAuthUrl(provider: $provider, tenantId: $tenantId)
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
    }
  }
`;

/**
 * Get security settings
 */
export const GET_SECURITY_SETTINGS_QUERY = gql`
  query GetSecuritySettings {
    getSecuritySettings {
      maxFailedAttempts
      lockoutDuration
      sessionTimeout
      requireMfaForAdmin
      allowedIpRanges
      blockedIpAddresses
      passwordPolicy {
        minLength
        requireUppercase
        requireLowercase
        requireNumbers
        requireSpecialChars
        preventReuse
        maxAge
      }
      deviceTrustPolicy {
        trustNewDevices
        requireApprovalForNewDevices
        deviceTrustDuration
      }
      auditSettings {
        logAllEvents
        retentionPeriod
        alertOnSuspiciousActivity
        emailNotifications
      }
    }
  }
`;

/**
 * Get upgrade recommendations
 */
export const GET_UPGRADE_RECOMMENDATIONS_QUERY = gql`
  query GetUpgradeRecommendations {
    getUpgradeRecommendations {
      tier
      reason
      features
      savings
      priority
    }
  }
`;

/**
 * Get subscription status
 */
export const GET_SUBSCRIPTION_STATUS_QUERY = gql`
  query GetSubscriptionStatus {
    getSubscriptionStatus {
      tier
      billingCycle
      status
      nextBillingDate
      cancelAtPeriodEnd
      trialEndsAt
    }
  }
`;
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
 * Get role permissions
 */
export const GET_ROLE_PERMISSIONS_QUERY = gql`
  query GetRolePermissions($role: String!) {
    getRolePermissions(role: $role)
  }
`;

/**
 * Get active sessions
 */
export const GET_ACTIVE_SESSIONS_QUERY = gql`
  query GetActiveSessions($sessionId: String) {
    getActiveSessions(sessionId: $sessionId) {
      id
      userId
      deviceInfo
      ipAddress
      userAgent
      createdAt
      lastActivity
      expiresAt
      isActive
      isCurrentSession
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
 * Get security events
 */
export const GET_SECURITY_EVENTS_QUERY = gql`
  query GetSecurityEvents($filter: SecurityEventFilterInput, $pagination: PaginationInput) {
    getSecurityEvents(filter: $filter, pagination: $pagination) {
      events {
        id
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
      totalCount
      hasNextPage
      hasPreviousPage
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

/**
 * Get IP restrictions
 */
export const GET_IP_RESTRICTIONS_QUERY = gql`
  query GetIpRestrictions {
    getIpRestrictions {
      allowedIps
      blockedIps
      isEnabled
      lastUpdated
    }
  }
`;

/**
 * Get time-based access settings
 */
export const GET_TIME_BASED_ACCESS_QUERY = gql`
  query GetTimeBasedAccess {
    getTimeBasedAccess {
      isEnabled
      allowedHours
      timezone
      exceptions {
        date
        allowedHours
        reason
      }
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
 * Advanced reports feature access check
 */
export const ADVANCED_REPORTS_QUERY = gql`
  query AdvancedReports {
    advancedReports
  }
`;

/**
 * Multi-location data feature access check
 */
export const MULTI_LOCATION_DATA_QUERY = gql`
  query MultiLocationData {
    multiLocationData
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
 * Check if MFA is enabled for current user
 */
export const IS_MFA_ENABLED_QUERY = gql`
  query IsMfaEnabled {
    isMfaEnabled
  }
`;

/**
 * Get detailed permission check with metadata
 */
export const CHECK_PERMISSION_WITH_DETAILS_QUERY = gql`
  query CheckPermissionWithDetails($input: CheckPermissionInput!) {
    checkPermissionWithDetails(input: $input) {
      hasPermission
      source
      grantedAt
      expiresAt
      grantedBy
      isInherited
      roleSource
      metadata
    }
  }
`;

/**
 * Get user permissions with detailed metadata
 */
export const GET_USER_PERMISSIONS_WITH_METADATA_QUERY = gql`
  query GetUserPermissionsWithMetadata($userId: String!) {
    getUserPermissionsWithMetadata(userId: $userId) {
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
        roleSource
        metadata
      }
      includesInherited
      lastUpdated
    }
  }
`;

/**
 * Get available permissions with detailed information
 */
export const GET_AVAILABLE_PERMISSIONS_DETAILED_QUERY = gql`
  query GetAvailablePermissionsDetailed {
    getAvailablePermissionsDetailed {
      permissions {
        name
        resource
        action
        description
        category
      }
      resources {
        name
        description
        actions
      }
      roles {
        name
        permissions
        description
        isDefault
      }
      categories
    }
  }
`;