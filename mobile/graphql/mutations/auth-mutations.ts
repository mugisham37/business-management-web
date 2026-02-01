/**
 * Mobile Authentication GraphQL Mutations
 * Complete authentication mutations for mobile app parity
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
 * Setup MFA mutation - generates QR code and backup codes
 */
export const SETUP_MFA_MUTATION = gql`
  mutation SetupMfa($input: SetupMfaInput!) {
    setupMfa(input: $input) {
      success
      message
      secret
      qrCodeUrl
      backupCodes
      manualEntryKey
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
 * Verify MFA token mutation
 */
export const VERIFY_MFA_MUTATION = gql`
  mutation VerifyMfa($input: VerifyMfaInput!) {
    verifyMfa(input: $input) {
      success
      message
      isValid
      remainingAttempts
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
 * Link social provider mutation
 */
export const LINK_SOCIAL_PROVIDER_MUTATION = gql`
  mutation LinkSocialProvider($input: LinkSocialProviderInput!) {
    linkSocialProvider(input: $input) {
      success
      message
      provider {
        provider
        providerId
        email
        displayName
        connectedAt
      }
    }
  }
`;

/**
 * Unlink social provider mutation
 */
export const UNLINK_SOCIAL_PROVIDER_MUTATION = gql`
  mutation UnlinkSocialProvider($input: UnlinkSocialProviderInput!) {
    unlinkSocialProvider(input: $input) {
      success
      message
    }
  }
`;

/**
 * OAuth login mutation (mobile-specific)
 */
export const OAUTH_LOGIN_MUTATION = gql`
  mutation OAuthLogin($input: OAuthLoginInput!) {
    oauthLogin(input: $input) {
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
      }
    }
  }
`;

/**
 * GitHub OAuth mutation (mobile-specific)
 */
export const GITHUB_OAUTH_MUTATION = gql`
  mutation GitHubOAuth($input: GitHubOAuthInput!) {
    githubOAuth(input: $input) {
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
      }
    }
  }
`;

/**
 * Biometric login mutation (mobile-specific)
 */
export const BIOMETRIC_LOGIN_MUTATION = gql`
  mutation BiometricLogin($input: BiometricLoginInput!) {
    biometricLogin(input: $input) {
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
      }
    }
  }
`;

/**
 * Register device mutation (mobile-specific)
 */
export const REGISTER_DEVICE_MUTATION = gql`
  mutation RegisterDevice($input: RegisterDeviceInput!) {
    registerDevice(input: $input) {
      success
      message
      deviceId
      fingerprint
      trusted
    }
  }
`;

/**
 * Update session mutation (mobile-specific)
 */
export const UPDATE_SESSION_MUTATION = gql`
  mutation UpdateSession($input: UpdateSessionInput!) {
    updateSession(input: $input) {
      success
      message
      session {
        id
        expiresAt
        lastActivity
      }
    }
  }
`;

/**
 * Sync session mutation (mobile-specific)
 */
export const SYNC_SESSION_MUTATION = gql`
  mutation SyncSession($input: SessionSyncInput!) {
    syncSession(input: $input) {
      success
      message
      syncedSessions
    }
  }
`;

/**
 * Register push token mutation (mobile-specific)
 */
export const REGISTER_PUSH_TOKEN_MUTATION = gql`
  mutation RegisterPushToken($input: PushTokenInput!) {
    registerPushToken(input: $input) {
      success
      message
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

/**
 * Start onboarding mutation
 */
export const START_ONBOARDING_MUTATION = gql`
  mutation StartOnboarding($input: StartOnboardingInput!) {
    startOnboarding(input: $input) {
      success
      message
      sessionId
      currentStep
      totalSteps
    }
  }
`;

/**
 * Submit onboarding step mutation
 */
export const SUBMIT_ONBOARDING_STEP_MUTATION = gql`
  mutation SubmitOnboardingStep($input: SubmitOnboardingStepInput!) {
    submitOnboardingStep(input: $input) {
      success
      message
      nextStep
      isCompleted
      recommendedTier
    }
  }
`;

/**
 * Complete onboarding mutation
 */
export const COMPLETE_ONBOARDING_MUTATION = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      success
      message
      selectedTier
      activatedFeatures
      redirectUrl
    }
  }
`;

/**
 * Update tier mutation
 */
export const UPDATE_TIER_MUTATION = gql`
  mutation UpdateTier($input: UpdateTierInput!) {
    updateTier(input: $input) {
      success
      message
      newTier
      activatedFeatures
      deactivatedFeatures
    }
  }
`;

/**
 * Process payment mutation
 */
export const PROCESS_PAYMENT_MUTATION = gql`
  mutation ProcessPayment($input: ProcessPaymentInput!) {
    processPayment(input: $input) {
      success
      message
      paymentId
      subscriptionId
      status
      nextBillingDate
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
 * Generate MFA setup mutation (alias for SETUP_MFA_MUTATION for compatibility)
 */
export const GENERATE_MFA_SETUP_MUTATION = gql`
  mutation GenerateMfaSetup {
    generateMfaSetup {
      success
      message
      secret
      qrCodeUrl
      backupCodes
      manualEntryKey
    }
  }
`;

/**
 * Verify MFA token mutation (alias for VERIFY_MFA_MUTATION for compatibility)
 */
export const VERIFY_MFA_TOKEN_MUTATION = gql`
  mutation VerifyMfaToken($input: VerifyMfaInput!) {
    verifyMfaToken(input: $input) {
      success
      message
      isValid
      remainingAttempts
    }
  }
`;

/**
 * Bulk grant permissions mutation
 */
export const BULK_GRANT_PERMISSIONS_MUTATION = gql`
  mutation BulkGrantPermissions($input: BulkGrantPermissionsInput!) {
    bulkGrantPermissions(input: $input) {
      success
      message
      grantedCount
      permissions {
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
 * Bulk revoke permissions mutation
 */
export const BULK_REVOKE_PERMISSIONS_MUTATION = gql`
  mutation BulkRevokePermissions($input: BulkRevokePermissionsInput!) {
    bulkRevokePermissions(input: $input) {
      success
      message
      revokedCount
    }
  }
`;