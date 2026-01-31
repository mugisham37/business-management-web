/**
 * Complete Auth GraphQL Queries
 * Comprehensive queries matching all backend auth endpoints
 */

import { gql } from '@apollo/client';

// Authentication Queries
export const REQUIRES_MFA_QUERY = gql`
  query RequiresMfa($email: String!) {
    requiresMfa(email: $email) {
      required
      message
    }
  }
`;

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
    }
  }
`;

// MFA Queries
export const MFA_STATUS_QUERY = gql`
  query MfaStatus {
    mfaStatus {
      isEnabled
      backupCodesCount
      lastUsedAt
    }
  }
`;

export const IS_MFA_ENABLED_QUERY = gql`
  query IsMfaEnabled {
    isMfaEnabled
  }
`;

// Permission Queries
export const GET_PERMISSIONS_QUERY = gql`
  query GetPermissions($userId: String!) {
    getPermissions(userId: $userId)
  }
`;

export const MY_PERMISSIONS_QUERY = gql`
  query MyPermissions {
    myPermissions
  }
`;

export const GET_ROLES_QUERY = gql`
  query GetRoles {
    getRoles {
      name
      permissions
    }
  }
`;

export const GET_ROLE_PERMISSIONS_QUERY = gql`
  query GetRolePermissions($role: String!) {
    getRolePermissions(role: $role)
  }
`;

export const HAS_PERMISSION_QUERY = gql`
  query HasPermission($userId: String!, $permission: String!, $resource: String, $resourceId: String) {
    hasPermission(userId: $userId, permission: $permission, resource: $resource, resourceId: $resourceId)
  }
`;

export const GET_ALL_PERMISSIONS_QUERY = gql`
  query GetAllPermissions {
    getAllPermissions
  }
`;

export const GET_DETAILED_PERMISSIONS_QUERY = gql`
  query GetDetailedPermissions($userId: String!) {
    getDetailedPermissions(userId: $userId) {
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

// User Permissions Query (alias for GET_PERMISSIONS_QUERY with different response shape)
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

// Tier Queries
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

export const GET_USER_FEATURES_QUERY = gql`
  query GetUserFeatures {
    getUserFeatures
  }
`;

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

// Feature Access Queries
export const BASIC_FEATURE_QUERY = gql`
  query BasicFeature {
    basicFeature
  }
`;

export const SMALL_TIER_FEATURE_QUERY = gql`
  query SmallTierFeature {
    smallTierFeature
  }
`;

export const MEDIUM_TIER_FEATURE_QUERY = gql`
  query MediumTierFeature {
    mediumTierFeature
  }
`;

export const ENTERPRISE_FEATURE_QUERY = gql`
  query EnterpriseFeature {
    enterpriseFeature
  }
`;

export const ADVANCED_REPORTS_QUERY = gql`
  query AdvancedReports {
    advancedReports
  }
`;

export const MULTI_LOCATION_DATA_QUERY = gql`
  query MultiLocationData {
    multiLocationData
  }
`;

// Session Queries
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

// Onboarding Queries
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

// Subscription Queries
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

// Security Queries
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

// IP Restrictions Queries
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

// Time-Based Access Queries
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

// Trusted Devices Queries
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