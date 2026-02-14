/**
 * Apollo Client Configuration
 * 
 * Creates and configures the Apollo Client instance with:
 * - Authentication link (adds access token to headers)
 * - Error link (handles errors and token refresh)
 * - Retry link (retries failed requests with exponential backoff)
 * - HTTP link (connects to GraphQL endpoint)
 * - InMemoryCache (normalized caching with type policies)
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.7
 */

import { ApolloClient, HttpLink, from } from '@apollo/client';
import { createAuthLink } from './links/auth-link';
import { createErrorLink } from './links/error-link';
import { createRetryLink } from './links/retry-link';
import { createCache } from './cache';
import { env } from '@/foundation/config/env';

/**
 * Configuration options for creating Apollo Client
 */
export interface ApolloClientConfig {
  uri: string;
  credentials?: 'include' | 'same-origin' | 'omit';
  enableDeduplication?: boolean;
}

/**
 * Create a configured Apollo Client instance
 * 
 * Link Chain Order (request flows through these in order):
 * 1. Auth Link - Adds access token to request headers
 * 2. Error Link - Handles errors and triggers token refresh
 * 3. Retry Link - Retries failed requests with exponential backoff
 * 4. HTTP Link - Sends request to GraphQL endpoint
 * 
 * @param config - Configuration options
 * @returns Configured Apollo Client instance
 */
export function createApolloClient(
  config?: Partial<ApolloClientConfig>
): ApolloClient {
  // Merge config with defaults from environment
  const clientConfig: ApolloClientConfig = {
    uri: config?.uri || env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    credentials: config?.credentials || 'include',
    enableDeduplication: config?.enableDeduplication ?? env.NEXT_PUBLIC_DEDUPLICATION_ENABLED,
  };

  // Create HTTP link - connects to GraphQL endpoint
  const httpLink = new HttpLink({
    uri: clientConfig.uri,
    credentials: clientConfig.credentials,
  });

  // Create auth link - adds access token to headers
  const authLink = createAuthLink();

  // Create error link - handles errors and token refresh
  const errorLink = createErrorLink();

  // Create retry link - retries failed requests
  const retryLink = createRetryLink();

  // Combine links in order: auth -> error -> retry -> http
  // Requests flow through this chain, responses flow back
  const link = from([
    authLink,
    errorLink,
    retryLink,
    httpLink,
  ]);

  // Create cache with type policies
  const cache = createCache();

  // Create Apollo Client instance
  const client = new ApolloClient({
    link,
    cache,
    
    // Request deduplication - prevents duplicate identical requests
    queryDeduplication: clientConfig.enableDeduplication,
    
    // Default options for queries
    defaultOptions: {
      query: {
        // Show errors in UI
        errorPolicy: 'all',
      },
      
      mutate: {
        // Always fetch from network for mutations
        fetchPolicy: 'network-only',
        
        // Show errors in UI
        errorPolicy: 'all',
      },
      
      watchQuery: {
        // Show errors in UI
        errorPolicy: 'all',
      },
    },
  });

  return client;
}

/**
 * Default Apollo Client instance
 * 
 * This is a singleton instance that can be used throughout the application.
 * It's created with default configuration from environment variables.
 * 
 * @example
 * ```ts
 * import { apolloClient } from '@/foundation/lib/graphql/client';
 * 
 * const result = await apolloClient.query({
 *   query: MY_QUERY,
 * });
 * ```
 */
export const apolloClient = createApolloClient();
