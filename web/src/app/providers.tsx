'use client';

import React from 'react';
import { ApolloProvider } from '@/lib/apollo';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ThemeProvider } from '@/src/lib/providers/theme-provider';
import { NotificationProvider } from '@/src/lib/providers/notification-provider';
import { RealtimeProvider } from '@/src/lib/providers/realtime-provider';
import { PermissionProvider } from '@/src/lib/providers/permission-provider';
import { LayoutProvider } from '@/src/lib/providers/layout-provider';
import { SessionManager } from '@/components/auth/SessionManager';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Centralized provider setup for the entire application
 * Integrates all systems into a cohesive application structure
 * 
 * Provider Hierarchy (outer to inner):
 * 1. ErrorBoundary - Catch errors
 * 2. ThemeProvider - Dark/light mode
 * 3. ApolloProvider - GraphQL client
 * 4. StoreProvider - Zustand state management
 * 5. AuthProvider - Authentication context
 * 6. SessionManager - Session monitoring and renewal
 * 7. TenantProvider - Multi-tenant context
 * 8. PermissionProvider - RBAC
 * 9. RealtimeProvider - WebSocket/subscriptions
 * 10. LayoutProvider - Responsive state
 * 11. NotificationProvider - Toast notifications
 * 12. DevToolsProvider - Development tools
 */
export function Providers({ children }: ProvidersProps) {
  const ErrorBoundaries = setupErrorBoundaryHierarchy();

  return (
    <ErrorBoundaries.App>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <ApolloProvider>
            <AuthProvider>
              <SessionManager>
                  <PermissionProvider>
                    <RealtimeProvider>
                      <LayoutProvider>
                        <NotificationProvider>
                            <ErrorBoundaries.Page>
                              {children}
                            </ErrorBoundaries.Page>
                        </NotificationProvider>
                      </LayoutProvider>
                    </RealtimeProvider>
                  </PermissionProvider>
              </SessionManager>
            </AuthProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundaries.App>
  );
}

export default Providers;