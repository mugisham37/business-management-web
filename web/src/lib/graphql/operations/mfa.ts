import { gql } from '@apollo/client';

/**
 * Multi-Factor Authentication GraphQL Operations
 * 
 * All MFA-related queries, mutations, and subscriptions
 * for comprehensive MFA management.
 */

// Fragments
export const MFA_SETUP_RESPONSE_FRAGMENT = gql`
  fragment MfaSetupResponseFragment on MfaSetupResponse {
    secret
    qrCodeUrl
    backupCodes
    manualEntryKey
  }
`;

export const MFA_STATUS_RESPONSE_FRAGMENT = gql`
  fragment MfaStatusResponseFragment on MfaStatusResponse {
    enabled
    backupCodesCount
    hasSecret
  }
`;

// Queries
export const GET_MFA_STATUS = gql`
  query GetMfaStatus {
    mfaStatus {
      ...MfaStatusResponseFragment
    }
  }
  ${MFA_STATUS_RESPONSE_FRAGMENT}
`;

export const IS_MFA_ENABLED = gql`
  query IsMfaEnabled {
    isMfaEnabled
  }
`;

// Mutations
export const GENERATE_MFA_SETUP = gql`
  mutation GenerateMfaSetup {
    generateMfaSetup {
      ...MfaSetupResponseFragment
    }
  }
  ${MFA_SETUP_RESPONSE_FRAGMENT}
`;

export const ENABLE_MFA = gql`
  mutation EnableMfa($input: EnableMfaInput!) {
    enableMfa(input: $input) {
      success
      message
      errors {
        message
        timestamp
      }
    }
  }
`;

export const DISABLE_MFA = gql`
  mutation DisableMfa($input: DisableMfaInput!) {
    disableMfa(input: $input) {
      success
      message
      errors {
        message
        timestamp
      }
    }
  }
`;

export const VERIFY_MFA_TOKEN = gql`
  mutation VerifyMfaToken($input: VerifyMfaTokenInput!) {
    verifyMfaToken(input: $input) {
      success
      message
      errors {
        message
        timestamp
      }
    }
  }
`;

export const GENERATE_BACKUP_CODES = gql`
  mutation GenerateBackupCodes($input: GenerateBackupCodesInput!) {
    generateBackupCodes(input: $input)
  }
`;

// Subscriptions
export const USER_MFA_EVENTS = gql`
  subscription UserMfaEvents {
    userMfaEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
  }
`;