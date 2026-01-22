'use client';

import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { apolloClient } from './client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

/**
 * Apollo Provider wrapper component
 * Provides GraphQL client to the entire application
 */
export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}

export default ApolloProvider;