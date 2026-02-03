import { gql } from '@apollo/client';

/**
 * Authentication GraphQL Operations
 * 
 * Queries and mutations for user authentication, registration, and session management.
 */

// Fragments
export const AUTH_USER_FRAGMENT = gql`
  fragment AuthUserFragment on AuthUser {
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
    businessTier
    featureFlags
    trialExpiresAt
  }
`;

export const LOGIN_RESPONSE_FRAGMENT = gql`
  fragment LoginResponseFragment on LoginResponse {
    user {
      ...AuthUserFragment
    }
    accessToken
    refreshToken
    expiresIn
    tokenType
    requiresMfa
    mfaToken
    riskScore
    securityRecommendations
  }
  ${AUTH_USER_FRAGMENT}
`;

// Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ...AuthUserFragment
    }
  }
  ${AUTH_USER_FRAGMENT}
`;

export const GET_AUTH_STATUS = gql`
  query GetAuthStatus {
    authStatus {
      isAuthenticated
      user {
        ...AuthUserFragment
      }
      sessionExpiresAt
      requiresRefresh
    }
  }
  ${AUTH_USER_FRAGMENT}
`;

// Mutations
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      ...LoginResponseFragment
    }
  }
  ${LOGIN_RESPONSE_FRAGMENT}
`;

export const LOGIN_WITH_MFA = gql`
  mutation LoginWithMfa($input: LoginWithMfaInput!) {
    loginWithMfa(input: $input) {
      ...LoginResponseFragment
    }
  }
  ${LOGIN_RESPONSE_FRAGMENT}
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      ...LoginResponseFragment
    }
  }
  ${LOGIN_RESPONSE_FRAGMENT}
`;

export const LOGOUT = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      expiresIn
      tokenType
      riskScore
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
    }
  }
`;

export const RESEND_VERIFICATION = gql`
  mutation ResendVerification($email: String!) {
    resendVerification(email: $email) {
      success
      message
    }
  }
`;

// Subscriptions
export const USER_AUTH_EVENTS = gql`
  subscription UserAuthEvents {
    userAuthEvents {
      type
      timestamp
      metadata
      user {
        ...AuthUserFragment
      }
    }
  }
  ${AUTH_USER_FRAGMENT}
`;

export const USER_SESSION_EVENTS = gql`
  subscription UserSessionEvents {
    userSessionEvents {
      type
      sessionId
      timestamp
      metadata
    }
  }
`;

export const AUTH_STATUS_CHANGED = gql`
  subscription AuthStatusChanged {
    authStatusChanged {
      isAuthenticated
      user {
        ...AuthUserFragment
      }
      reason
      timestamp
    }
  }
  ${AUTH_USER_FRAGMENT}
`;