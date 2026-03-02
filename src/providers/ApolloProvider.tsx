'use client';

import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/api/apollo-client';

/**
 * ApolloProvider Component
 * 
 * Wraps the application with Apollo Client provider to enable GraphQL operations.
 * This component provides the Apollo Client instance to all child components,
 * enabling them to use GraphQL queries, mutations, and subscriptions.
 * 
 * Features:
 * - Provides Apollo Client instance to React component tree
 * - Enables useQuery, useMutation, useSubscription hooks
 * - Manages GraphQL cache and network layer
 * - Handles authentication and error handling through configured links
 * 
 * Requirements: 2.1
 * 
 * @example
 * ```typescript
 * <ApolloProvider>
 *   <App />
 * </ApolloProvider>
 * ```
 */
export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}
