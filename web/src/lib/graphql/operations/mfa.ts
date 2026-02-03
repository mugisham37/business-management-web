import { gql } from '@apollo/client';

/**
 * Multi-Factor Authentication GraphQL Operations
 * 
 * Queries and mutations for MFA setup, verification, and management.
 */

// Fragments
export const MFA_STATUS_FRAGMENT = gql`
  fragment MfaStatusFragment on MfaStatusResponse {
    isEnabled
    hasBackupCodes
    backupCodesCount
    lastUsedAt
    setupAt
    methods
  }
`;

export const MFA_SETUP_FRAGMENT = gql`
  fragment MfaSetupFragment on MfaSetupResponse {
    secret
    qrCodeUrl
    backupCodes
    setupToken
  }
`;

// Queries
export const GET_MFA_STATUS = gql`
  query GetMfaStatus {
    mfaStatus {
      ...MfaStatusFragment
    }
  }
  ${MFA_STATUS_FRAGMENT}
`;

export const IS_MFA_ENABLED = gql`
  query IsMfaEnabled {
    isMfaEnabled
  }
`;

export const GET_MFA_BACKUP_CODES = gql`
  query GetMfaBackupCodes {
    mfaBackupCodes {
      codes
      generatedAt
      usedCount
      totalCount
    }
  }
`;

// Mutations
export const GENERATE_MFA_SETUP = gql`
  mutation GenerateMfaSetup {
    generateMfaSetup {
      ...MfaSetupFragment
    }
  }
  ${MFA_SETUP_FRAGMENT}
`;

export const ENABLE_MFA = gql`
  mutation EnableMfa($input: EnableMfaInput!) {
    enableMfa(input: $input) {
      success
      message
      backupCodes
    }
  }
`;

export const DISABLE_MFA = gql`
  mutation DisableMfa($input: DisableMfaInput!) {
    disableMfa(input: $input) {
      success
      message
    }
  }
`;

export const VERIFY_MFA_TOKEN = gql`
  mutation VerifyMfaToken($input: VerifyMfaTokenInput!) {
    verifyMfaToken(input: $input) {
      success
      message
      isValid
    }
  }
`;

export const GENERATE_BACKUP_CODES = gql`
  mutation GenerateBackupCodes($input: GenerateBackupCodesInput!) {
    generateBackupCodes(input: $input) {
      codes
      message
    }
  }
`;

export const USE_BACKUP_CODE = gql`
  mutation UseBackupCode($input: UseBackupCodeInput!) {
    useBackupCode(input: $input) {
      success
      message
      remainingCodes
    }
  }
`;

export const RESET_MFA = gql`
  mutation ResetMfa($input: ResetMfaInput!) {
    resetMfa(input: $input) {
      success
      message
    }
  }
`;

// Subscriptions
export const USER_MFA_EVENTS = gql`
  subscription UserMfaEvents {
    userMfaEvents {
      type
      timestamp
      metadata
      userId
    }
  }
`;

export const MFA_STATUS_CHANGED = gql`
  subscription MfaStatusChanged {
    mfaStatusChanged {
      isEnabled
      timestamp
      reason
      metadata
    }
  }
`;