import { gql } from '@apollo/client';

// Authentication Mutations

export const REGISTER_OWNER = gql`
  mutation RegisterOwner($input: RegisterOwnerInput!) {
    registerOwner(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        email
        firstName
        lastName
        hierarchyLevel
        organizationId
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        email
        firstName
        lastName
        hierarchyLevel
        organizationId
      }
    }
  }
`;

// Alias for backward compatibility
export const LOGIN_MUTATION = LOGIN;

export const LOGIN_WITH_PIN = gql`
  mutation LoginWithPin($input: LoginWithPinInput!) {
    loginWithPin(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        email
        firstName
        lastName
        hierarchyLevel
        organizationId
      }
    }
  }
`;

// Alias for backward compatibility
export const LOGIN_WITH_PIN_MUTATION = LOGIN_WITH_PIN;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        email
        firstName
        lastName
        hierarchyLevel
        organizationId
      }
    }
  }
`;

// Alias for backward compatibility
export const REFRESH_TOKEN_MUTATION = REFRESH_TOKEN;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// Alias for backward compatibility
export const LOGOUT_MUTATION = LOGOUT;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

// Alias for backward compatibility
export const CHANGE_PASSWORD_MUTATION = CHANGE_PASSWORD;
