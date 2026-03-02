'use client';

import React from 'react';
import { ApolloProvider } from './ApolloProvider';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { RootErrorBoundary } from '@/lib/errors/error-boundaries';

/**
 * AppProviders Component
 * 
 * Combines all application-level providers in the correct nesting order.
 * This component wraps the entire application with necessary context providers
 * for error handling, GraphQL operations, and authentication.
 * 
 * Provider Nesting Order (outer to inner):
 * 1. RootErrorBoundary - Catches and handles application-level errors
 * 2. ApolloProvider - Provides GraphQL client for data fetching
 * 3. AuthProvider - Provides authentication state and methods
 * 
 * Features:
 * - Centralized provider configuration
 * - Proper provider nesting order
 * - Error boundary protection at root level
 * - GraphQL and authentication context available throughout app
 * 
 * Requirements: 2.1, 4.2, 6.2
 * 
 * @example
 * ```typescript
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AppProviders>
 *           {children}
 *         </AppProviders>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RootErrorBoundary>
      <ApolloProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ApolloProvider>
    </RootErrorBoundary>
  );
}
