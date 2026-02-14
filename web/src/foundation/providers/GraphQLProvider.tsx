/**
 * GraphQL Provider
 * 
 * Provides Apollo Client to the application through React Context.
 * Initializes Apollo Client with all configured links and cache.
 * 
 * Features:
 * - Creates Apollo Client with auth, error, retry, and HTTP links
 * - Configures normalized cache with type policies
 * - Wraps application with ApolloProvider
 * 
 * Requirements: 4.1, 4.2, 4.3
 */

'use client';

import React, { useMemo } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from '@/foundation/lib/graphql/client';

/**
 * Props for GraphQLProvider
 */
export interface GraphQLProviderProps {
  children: React.ReactNode;
}

/**
 * GraphQL Provider Component
 * 
 * Wraps the application with ApolloProvider to provide GraphQL client
 * to all child components.
 * 
 * The Apollo Client is created with:
 * - Auth Link: Adds access token to request headers
 * - Error Link: Handles errors and triggers token refresh
 * - Retry Link: Retries failed requests with exponential backoff
 * - HTTP Link: Connects to GraphQL endpoint
 * - InMemoryCache: Normalized caching with type policies
 * 
 * @example
 * ```tsx
 * <GraphQLProvider>
 *   <App />
 * </GraphQLProvider>
 * ```
 */
export function GraphQLProvider({ children }: GraphQLProviderProps) {
  // Create Apollo Client instance (memoized to prevent recreation on re-renders)
  const apolloClient = useMemo(() => {
    return createApolloClient();
  }, []);

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
