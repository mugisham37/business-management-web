import { gql } from '@apollo/client';
import { LOGIN_RESPONSE_FRAGMENT } from './auth';

/**
 * Social Authentication GraphQL Operations
 * 
 * Queries and mutations for OAuth providers (Google, Facebook, GitHub).
 */

// Fragments
export const SOCIAL_PROVIDER_FRAGMENT = gql`
  fragment SocialProviderFragment on SocialProvider {
    provider
    providerId
    email
    name
    avatar
    linkedAt
    lastUsedAt
    isVerified
  }
`;

export const OAUTH_URL_FRAGMENT = gql`
  fragment OAuthUrlFragment on OAuthUrlResponse {
    url
    state
    provider
    expiresAt
  }
`;

// Queries
export const GET_LINKED_PROVIDERS = gql`
  query GetLinkedProviders {
    linkedProviders {
      ...SocialProviderFragment
    }
  }
  ${SOCIAL_PROVIDER_FRAGMENT}
`;

export const GET_OAUTH_URL = gql`
  query GetOAuthUrl($input: GetOAuthUrlInput!) {
    getOAuthUrl(input: $input) {
      ...OAuthUrlFragment
    }
  }
  ${OAUTH_URL_FRAGMENT}
`;

export const GET_AVAILABLE_PROVIDERS = gql`
  query GetAvailableProviders {
    availableProviders {
      provider
      name
      icon
      enabled
      requiresVerification
    }
  }
`;

// Mutations
export const OAUTH_LOGIN = gql`
  mutation OAuthLogin($input: OAuthLoginInput!) {
    oauthLogin(input: $input) {
      ...LoginResponseFragment
    }
  }
  ${LOGIN_RESPONSE_FRAGMENT}
`;

export const LINK_SOCIAL_PROVIDER = gql`
  mutation LinkSocialProvider($input: LinkSocialProviderInput!) {
    linkSocialProvider(input: $input) {
      success
      message
      provider {
        ...SocialProviderFragment
      }
    }
  }
  ${SOCIAL_PROVIDER_FRAGMENT}
`;

export const UNLINK_SOCIAL_PROVIDER = gql`
  mutation UnlinkSocialProvider($provider: String!) {
    unlinkSocialProvider(provider: $provider) {
      success
      message
    }
  }
`;

export const REFRESH_SOCIAL_TOKEN = gql`
  mutation RefreshSocialToken($provider: String!) {
    refreshSocialToken(provider: $provider) {
      success
      message
      expiresAt
    }
  }
`;

export const VERIFY_SOCIAL_EMAIL = gql`
  mutation VerifySocialEmail($input: VerifySocialEmailInput!) {
    verifySocialEmail(input: $input) {
      success
      message
    }
  }
`;

// Subscriptions
export const SOCIAL_AUTH_EVENTS = gql`
  subscription SocialAuthEvents {
    socialAuthEvents {
      type
      provider
      timestamp
      metadata
      userId
    }
  }
`;

export const PROVIDER_STATUS_CHANGED = gql`
  subscription ProviderStatusChanged {
    providerStatusChanged {
      provider
      status
      timestamp
      reason
    }
  }
`;