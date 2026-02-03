import { ApolloClient, InMemoryCache, from, split, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
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

// Singleton instance for client-side only
let apolloClientInstance: ApolloClient<NormalizedCacheObject> | null = null;

// Create cache configuration with type policies
function createCache() {
  return new InMemoryCache({
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
        // Use false to prevent caching issues with events
        keyFields: false,
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
}

// Create the Apollo Client (client-side only)
function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  // Upload link for file uploads
  const uploadLink = createUploadLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
    credentials: 'include',
  });

  // WebSocket link for subscriptions (client-side only)
  const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(
    createClient({
      url: process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT || 'ws://localhost:3001/graphql',
      connectionParams: () => {
        const token = TokenManager.getAccessToken();
        // Only provide connection params if we have a valid token
        if (!token) {
          return {};
        }
        return {
          authorization: `Bearer ${token}`,
        };
      },
      // Lazy connection - only connect when a subscription is made
      lazy: true,
      // Retry connection on failure (but not for auth errors)
      retryAttempts: 5,
      retryWait: async (retries) => {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 30000)));
      },
      // Don't retry if we're not authenticated or if it's an auth-related close
      shouldRetry: (errOrCloseEvent) => {
        // Don't retry if user is not authenticated
        if (!TokenManager.isAuthenticated()) {
          return false;
        }
        // Don't retry on authentication-related close events (4500, 4401, 4403)
        if (errOrCloseEvent && typeof errOrCloseEvent === 'object' && 'code' in errOrCloseEvent) {
          const code = (errOrCloseEvent as { code: number }).code;
          if (code === 4500 || code === 4401 || code === 4403) {
            return false;
          }
        }
        return true;
      },
      on: {
        connected: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('WebSocket connected');
          }
        },
        closed: (event) => {
          // Only log if it's not an expected auth-related closure
          if (process.env.NODE_ENV === 'development') {
            const closeEvent = event as { code?: number };
            if (closeEvent?.code !== 4500) {
              console.log('WebSocket closed');
            }
          }
        },
        error: (error) => {
          // Only log meaningful errors, not empty connection failures or auth errors when not logged in
          if (!TokenManager.isAuthenticated()) {
            // Silently ignore errors when not authenticated - this is expected
            return;
          }
          if (error && Object.keys(error).length > 0) {
            console.error('WebSocket error:', error);
          } else if (process.env.NODE_ENV === 'development') {
            console.warn('WebSocket connection failed. Is the backend server running?');
          }
        },
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
  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      for (const error of graphQLErrors) {
        // Only log non-auth errors or auth errors when user should be authenticated
        const isAuthError = error.extensions?.code === 'UNAUTHENTICATED';
        if (!isAuthError || TokenManager.isAuthenticated()) {
          console.error(`GraphQL error: ${error.message}`);
        }
        
        // Handle authentication errors
        if (isAuthError) {
          // Only try to refresh if we thought we were authenticated
          if (TokenManager.isAuthenticated()) {
            TokenManager.refreshToken().then((success) => {
              if (success) {
                // Retry the operation with new token
                const oldHeaders = operation.getContext().headers as Record<string, string>;
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: `Bearer ${TokenManager.getAccessToken()}`,
                  },
                });
                // Note: We can't return the forward operation here due to type constraints
                // The retry will happen on the next request
              } else {
                // Refresh failed, redirect to login
                AuthEventEmitter.emit('auth:logout', { reason: 'token_expired' });
              }
            }).catch(() => {
              AuthEventEmitter.emit('auth:logout', { reason: 'token_expired' });
            });
          }
          return; // Return void for this case
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
            mfaToken: error.extensions.mfaToken as string,
            userId: error.extensions.userId as string,
          });
        }
      }
    }
    
    if (networkError) {
      // Check if this is an expected authentication-related error when user is not logged in
      const isAuthRelatedError = 
        networkError.message?.includes('Missing authentication token') ||
        networkError.message?.includes('4500') ||
        networkError.message?.includes('4401') ||
        ('statusCode' in networkError && networkError.statusCode === 401);
      
      // Only log if it's not an expected auth error for unauthenticated users
      if (isAuthRelatedError && !TokenManager.isAuthenticated()) {
        // Silently ignore - this is expected when not logged in
      } else {
        console.error(`Network error: ${networkError.message}`);
      }
      
      // Handle network errors - only emit logout event if we thought we were authenticated
      if ('statusCode' in networkError && networkError.statusCode === 401 && TokenManager.isAuthenticated()) {
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
      retryIf: (error) => !!error && !error.message.includes('UNAUTHENTICATED'),
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

  return new ApolloClient({
    link: from([
      errorLink,
      retryLink,
      authLink,
      splitLink,
    ]),
    cache: createCache(),
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
    devtools: {
      enabled: process.env.NODE_ENV === 'development',
    },
    ssrMode: typeof window === 'undefined',
  });
}

// Get or create Apollo Client
export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  // Always create a new client on the server to avoid state sharing between requests
  if (typeof window === 'undefined') {
    return createApolloClient();
  }

  // Reuse the same client on the client-side
  if (!apolloClientInstance) {
    apolloClientInstance = createApolloClient();
  }
  
  return apolloClientInstance;
}

// Export cache getter for direct access
export function getCache() {
  return getApolloClient().cache;
}

// Backwards compatible export (for existing imports)
export const apolloClient = typeof window === 'undefined' 
  ? createApolloClient()  // Create a new instance for SSR (will be discarded)
  : getApolloClient();     // Use singleton on client

// Legacy export for cache (deprecated, use getCache instead)
export const cache = typeof window === 'undefined' 
  ? createCache()
  : getApolloClient().cache;