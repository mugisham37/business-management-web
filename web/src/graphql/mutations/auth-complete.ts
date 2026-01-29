/**
 * Complete Authentication GraphQL Mutations
 * All authentication-related mutations for the AuthGateway
 */

import { gql } from '@apollo/client';

/**
 * Login mutation with device tracking
 */
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      accessToken
      refreshToken
      expiresIn
      tokenType
      sessionId
      onboardingCompleted
      user {
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
  }
`;

/**
 * Login with MFA mutation
 */
export const LOGIN_WITH_MFA_MUTATION = gql`
  mutation LoginWithMfa($input: LoginWithMfaInput!) {
    loginWithMfa(input: $input) {
      success
      message
      accessToken
      refreshToken
      expiresIn
      tokenType
      sessionId
      user {
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
  }
`;

/**
 * Refresh token mutation
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      success
      message
      accessToken
      refreshToken
      expiresIn
      tokenType
    }
  }
`;

/**
 * Logout mutation
 */
export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

/**
 * Logout from all sessions mutation
 */
export const LOGOUT_ALL_SESSIONS_MUTATION = gql`
  mutation LogoutAllSessions {
    logoutAllSessions {
      success
      message
      terminatedSessions
    }
  }
`;

/**
 * Register user mutation
 */
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      user {
        id
        email
        tenantId
        role
        firstName
        lastName
        displayName
        createdAt
        isActive
        emailVerified
        mfaEnabled
      }
    }
  }
`;

/**
 * Change password mutation
 */
export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

/**
 * Forgot password mutation
 */
export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      success
      message
    }
  }
`;

/**
 * Reset password mutation
 */
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

/**
 * Enable MFA mutation
 */
export const ENABLE_MFA_MUTATION = gql`
  mutation EnableMfa($input: EnableMfaInput!) {
    enableMfa(input: $input) {
      success
      message
      backupCodes
    }
  }
`;

/**
 * Disable MFA mutation
 */
export const DISABLE_MFA_MUTATION = gql`
  mutation DisableMfa($input: DisableMfaInput!) {
    disableMfa(input: $input) {
      success
      message
    }
  }
`;

/**
 * Generate MFA backup codes mutation
 */
export const GENERATE_BACKUP_CODES_MUTATION = gql`
  mutation GenerateBackupCodes($input: GenerateBackupCodesInput!) {
    generateBackupCodes(input: $input) {
      success
      message
      backupCodes
    }
  }
`;

/**
 * Terminate session mutation
 */
export const TERMINATE_SESSION_MUTATION = gql`
  mutation TerminateSession($sessionId: String!) {
    terminateSession(sessionId: $sessionId) {
      success
      message
    }
  }
`;

/**
 * Update security settings mutation
 */
export const UPDATE_SECURITY_SETTINGS_MUTATION = gql`
  mutation UpdateSecuritySettings($input: UpdateSecuritySettingsInput!) {
    updateSecuritySettings(input: $input) {
      success
      message
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
    }
  }
`;

/**
 * Grant permission mutation
 */
export const GRANT_PERMISSION_MUTATION = gql`
  mutation GrantPermission($input: GrantPermissionInput!) {
    grantPermission(input: $input) {
      success
      message
      permission {
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
  }
`;

/**
 * Revoke permission mutation
 */
export const REVOKE_PERMISSION_MUTATION = gql`
  mutation RevokePermission($input: RevokePermissionInput!) {
    revokePermission(input: $input) {
      success
      message
    }
  }
`;

/**
 * Assign role mutation
 */
export const ASSIGN_ROLE_MUTATION = gql`
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input) {
      success
      message
      user {
        id
        role
        permissions
      }
    }
  }
`;

/**
 * Bulk grant permissions mutation
 */
export const BULK_GRANT_PERMISSIONS_MUTATION = gql`
  mutation BulkGrantPermissions($input: BulkPermissionInput!) {
    bulkGrantPermissions(input: $input) {
      success
      failed
      results {
        userId
        success
        message
      }
    }
  }
`;

/**
 * Bulk revoke permissions mutation
 */
export const BULK_REVOKE_PERMISSIONS_MUTATION = gql`
  mutation BulkRevokePermissions($input: BulkPermissionInput!) {
    bulkRevokePermissions(input: $input) {
      success
      failed
      results {
        userId
        success
        message
      }
    }
  }
`;

/**
 * Create role mutation
 */
export const CREATE_ROLE_MUTATION = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      success
      message
      role {
        name
        permissions
      }
    }
  }
`;

/**
 * Update role permissions mutation
 */
export const UPDATE_ROLE_PERMISSIONS_MUTATION = gql`
  mutation UpdateRolePermissions($input: UpdateRolePermissionsInput!) {
    updateRolePermissions(input: $input) {
      success
      message
      role {
        name
        permissions
      }
    }
  }
`;

/**
 * Trust device mutation
 */
export const TRUST_DEVICE_MUTATION = gql`
  mutation TrustDevice($deviceId: String!) {
    trustDevice(deviceId: $deviceId) {
      success
      message
    }
  }
`;

/**
 * Untrust device mutation
 */
export const UNTRUST_DEVICE_MUTATION = gql`
  mutation UntrustDevice($deviceId: String!) {
    untrustDevice(deviceId: $deviceId) {
      success
      message
    }
  }
`;