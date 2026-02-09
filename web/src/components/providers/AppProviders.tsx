/**
 * App Providers Component
 * 
 * Root provider wrapper that combines all application-level providers.
 * This component wraps the entire application to provide global state and context.
 * 
 * Current providers:
 * - AuthProvider: Manages authentication state and methods
 * 
 * Requirements: 5.1
 */

'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';

/**
 * AppProviders Component
 * 
 * Wraps children with all necessary application providers.
 * Use this component in the root layout to provide global context.
 * 
 * @param children - React children to be wrapped with providers
 * @returns JSX element with all providers applied
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
