import { gql } from '@apollo/client';

/**
 * Social Authentication GraphQL Operations
 * 
 * All social authentication-related queries and mutations
 * for OAuth provider management.
 */

// Fragments
export const SOCIAL_PROVIDER_FRAGMENT = gql`
  fragment SocialProviderFragment on SocialProvider {
    provider
    providerId
    email
    connectedAt
    lastUsedAt
  }
`;

export const SOCIAL_AUTH_RESPONSE_FRAGMENT = gql`
  fragment SocialAuthResponseFragment on SocialAuthResponse {
    success
    message
    connectedProviders {
      ...SocialProviderFragment
    }
  }
  ${SOCIAL_PROVIDER_FRAGMENT}
`;

export const SOCIAL_AUTH_URL_RESPONSE_FRAGMENT = gql`
  fragment SocialAuthUrlResponseFragment on SocialAuthUrlResponse {
    authUrl
    state
    provider
    tenantId
  }
`;

// Queries
export const GET_SOCIAL_AUTH_URL = gql`
  query GetSocialAuthUrl($provider: String!, $tenantId: String) {
    getSocialAuthUrl(provider: $provider, tenantId: $tenantId) {
      ...SocialAuthUrlResponseFragment
    }
  }
  ${SOCIAL_AUTH_URL_RESPONSE_FRAGMENT}
`;

export const GET_CONNECTED_SOCIAL_PROVIDERS = gql`
  query GetConnectedSocialProviders {
    getConnectedSocialProviders {
      ...SocialProviderFragment
    }
  }
  ${SOCIAL_PROVIDER_FRAGMENT}
`;

export const IS_SOCIAL_PROVIDER_AVAILABLE = gql`
  query IsSocialProviderAvailable($provider: String!) {
    isSocialProviderAvailable(provider: $provider)
  }
`;

export const GET_SUPPORTED_SOCIAL_PROVIDERS = gql`
  query GetSupportedSocialProviders {
    getSupportedSocialProviders
  }
`;

// Mutations
export const LINK_SOCIAL_PROVIDER = gql`
  mutation LinkSocialProvider($input: LinkSocialProviderInput!) {
    linkSocialProvider(input: $input) {
      ...SocialAuthResponseFragment
    }
  }
  ${SOCIAL_AUTH_RESPONSE_FRAGMENT}
`;

export const UNLINK_SOCIAL_PROVIDER = gql`
  mutation UnlinkSocialProvider($input: UnlinkSocialProviderInput!) {
    unlinkSocialProvider(input: $input) {
      ...SocialAuthResponseFragment
    }
  }
  ${SOCIAL_AUTH_RESPONSE_FRAGMENT}
`;

// Subscriptions
export const USER_SOCIAL_PROVIDER_EVENTS = gql`
  subscription UserSocialProviderEvents {
    userSocialProviderEvents {
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