'use client';

import React from 'react';
import { ApolloProvider } from './ApolloProvider';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { RootErrorBoundary } from '@/lib/errors/error-boundaries';
import { ToastProvider, Toaster } from '@/components/ui/sonner';
import { ConnectionProvider } from './ConnectionProvider';

/**
 * AppProviders Component
 * 
 * Combines all application-level providers in the correct nesting order.
 * This component wraps the entire application with necessary context providers
 * for error handling, GraphQL operations, authentication, and connection monitoring.
 * 
 * Provider Nesting Order (outer to inner):
 * 1. RootErrorBoundary - Catches and handles application-level errors
 * 2. ToastProvider - Provides toast notification system
 * 3. ApolloProvider - Provides GraphQL client for data fetching
 * 4. ConnectionProvider - Monitors backend connection health
 * 5. AuthProvider - Provides authentication state and methods
 * 
 * Features:
 * - Centralized provider configuration
 * - Proper provider nesting order
 * - Error boundary protection at root level
 * - Toast notifications for user feedback
 * - Backend health monitoring with automatic reconnection
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
      <ToastProvider>
        <ApolloProvider>
          <ConnectionProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ConnectionProvider>
        </ApolloProvider>
        <Toaster position="top-right" />
      </ToastProvider>
    </RootErrorBoundary>
  );
}
