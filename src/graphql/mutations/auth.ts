import { gql } from '@apollo/client';
import { USER_FRAGMENT } from '../fragments';

export const LOGIN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation Login($email: String!, $password: String!, $organizationId: UUID!) {
    login(email: $email, password: $password, organizationId: $organizationId) {
      accessToken
      refreshToken
      user {
        ...UserFragment
      }
    }
  }
`;

export const LOGIN_WITH_PIN_MUTATION = gql`
  ${USER_FRAGMENT}
  mutation LoginWithPin($email: String!, $pin: String!, $organizationId: UUID!) {
    loginWithPin(email: $email, pin: $pin, organizationId: $organizationId) {
      accessToken
      refreshToken
      user {
        ...UserFragment
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      success
    }
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!, $organizationId: UUID!) {
    requestPasswordReset(email: $email, organizationId: $organizationId) {
      success
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
    }
  }
`;
