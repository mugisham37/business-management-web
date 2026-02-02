import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createUploadLink } from 'apollo-upload-client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { TokenManager } from '../auth/token-manager';
import { AuthEventEmitter } from '../auth/auth-events';

/**
 * GraphQL Client Configuration
 * 
 * Comprehensive Apollo Client setup with:
 * - Authentication link with automatic token injection
 * - Error handling with token refresh
 * - Retry logic for network failures
 * - WebSocket support for subscriptions
 * - File upload support
 * - Intelligent caching with type policies
 */

// HTTP Link for queries and mutations
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
  credentials: 'include',
});

// Upload link for file uploads
const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
  credentials: 'include',
});

// WebSocket link for subscriptions
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT || 'ws://localhost:3001/graphql',
    connectionParams: () => {
      const token = TokenManager.getAccessToken();
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    on: {
      connected: () => console.log('WebSocket connected'),
      closed: () => console.log('WebSocket closed'),
      error: (error) => console.error('WebSocket error:', error),
    },
  })
) : null;

// Authentication link - adds JWT token to requests
const authLink = setContext((_, { headers }) => {
  const token = TokenManager.getAccessToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-device-fingerprint': JSON.stringify(getDeviceFingerprint()),
    },
  };
});

// Error link - handles authentication errors and token refresh
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const error of graphQLErrors) {
      console.error(`GraphQL error: ${error.message}`);
      
      // Handle authentication errors
      if (error.extensions?.code === 'UNAUTHENTICATED') {
        // Try to refresh token
        return TokenManager.refreshToken().then((success) => {
          if (success) {
            // Retry the operation with new token
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: `Bearer ${TokenManager.getAccessToken()}`,
              },
            });
            return forward(operation);
          } else {
            // Refresh failed, redirect to login
            AuthEventEmitter.emit('auth:logout', { reason: 'token_expired' });
            return;
          }
        });
      }
      
      // Handle permission errors
      if (error.extensions?.code === 'FORBIDDEN') {
        AuthEventEmitter.emit('auth:permission_denied', { 
          operation: operation.operationName,
          error: error.message 
        });
      }
      
      // Handle MFA required errors
      if (error.extensions?.code === 'MFA_REQUIRED') {
        AuthEventEmitter.emit('auth:mfa_required', {
          mfaToken: error.extensions.mfaToken,
          userId: error.extensions.userId,
        });
      }
    }
  }
  
  if (networkError) {
    console.error(`Network error: ${networkError.message}`);
    
    // Handle network errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      AuthEventEmitter.emit('auth:logout', { reason: 'unauthorized' });
    }
  }
});

// Retry link - retries failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error && !error.message.includes('UNAUTHENTICATED'),
  },
});

// Split link - routes subscriptions to WebSocket, others to HTTP
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      uploadLink
    )
  : uploadLink;

// Cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    AuthUser: {
      keyFields: ['id'],
      fields: {
        permissions: {
          merge: false, // Replace array completely
        },
        featureFlags: {
          merge: false, // Replace array completely
        },
      },
    },
    Permission: {
      keyFields: ['id'],
    },
    SocialProvider: {
      keyFields: ['provider', 'providerId'],
    },
    AuthEvent: {
      keyFields: ['type', 'userId', 'timestamp'],
    },
    Query: {
      fields: {
        myPermissions: {
          merge: false,
        },
        getPermissions: {
          merge: false,
        },
        getConnectedSocialProviders: {
          merge: false,
        },
      },
    },
  },
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    retryLink,
    authLink,
    splitLink,
  ]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// Device fingerprinting for security
function getDeviceFingerprint() {
  if (typeof window === 'undefined') return {};
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    timestamp: Date.now(),
  };
}

// Export cache for direct access
export { cache };