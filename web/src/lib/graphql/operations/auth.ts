import { gql } from '@apollo/client';

/**
 * Authentication GraphQL Operations
 * 
 * All authentication-related queries, mutations, and subscriptions
 * with comprehensive error handling and type safety.
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

export const MUTATION_RESPONSE_FRAGMENT = gql`
  fragment MutationResponseFragment on MutationResponse {
    success
    message
    errors {
      message
      timestamp
    }
  }
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

export const REQUIRES_MFA = gql`
  query RequiresMfa($email: String!) {
    requiresMfa(email: $email) {
      requiresMfa
      userId
      availableMethods
    }
  }
`;

export const VALIDATE_SESSION = gql`
  query ValidateSession {
    validateSession
  }
`;

export const GET_SECURITY_STATUS = gql`
  query GetSecurityStatus {
    getSecurityStatus
  }
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

export const OAUTH_LOGIN = gql`
  mutation OAuthLogin($input: OAuthLoginInput!) {
    oauthLogin(input: $input) {
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
      ...MutationResponseFragment
    }
  }
  ${MUTATION_RESPONSE_FRAGMENT}
`;

export const LOGOUT_ALL_SESSIONS = gql`
  mutation LogoutAllSessions {
    logoutAllSessions {
      ...MutationResponseFragment
    }
  }
  ${MUTATION_RESPONSE_FRAGMENT}
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

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      ...MutationResponseFragment
    }
  }
  ${MUTATION_RESPONSE_FRAGMENT}
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      ...MutationResponseFragment
    }
  }
  ${MUTATION_RESPONSE_FRAGMENT}
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      ...MutationResponseFragment
    }
  }
  ${MUTATION_RESPONSE_FRAGMENT}
`;

// Subscriptions
export const USER_AUTH_EVENTS = gql`
  subscription UserAuthEvents {
    userAuthEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
  }
`;

export const USER_SESSION_EVENTS = gql`
  subscription UserSessionEvents {
    userSessionEvents {
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

export const SECURITY_ALERTS = gql`
  subscription SecurityAlerts {
    securityAlerts {
      type
      userId
      tenantId
      timestamp
      metadata
      ipAddress
      userAgent
      description
      severity
    }
  }
`;