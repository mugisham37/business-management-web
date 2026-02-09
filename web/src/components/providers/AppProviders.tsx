/**
 * App Providers Component
 * 
 * Root provider wrapper that combines all application-level providers.
 * This component wraps the entire application to provide global state and context.
 * 
 * Current providers:
 * - QueryProvider: React Query for data fetching and caching
 * - AuthProvider: Manages authentication state and methods
 * 
 * Requirements: 5.1
 */

'use client';

import React from 'react';
import { QueryProvider } from '@/lib/query/query-provider';
import { AuthProvider } from '@/lib/auth/auth-context';

/**
 * AppProviders Component
 * 
 * Wraps children with all necessary application providers.
 * Use this component in the root layout to provide global context.
 * 
 * Provider order matters:
 * 1. QueryProvider - Must be outermost for React Query
 * 2. AuthProvider - Depends on QueryProvider for API calls
 * 
 * @param children - React children to be wrapped with providers
 * @returns JSX element with all providers applied
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
