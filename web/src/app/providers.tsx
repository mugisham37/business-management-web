'use client';

import React from 'react';
import { ApolloProvider } from '@/lib/apollo';
import { AuthProvider } from '@/components/providers/auth-provider';
import { TenantProvider } from '@/components/tenant/tenant-provider';
import { StoreProvider } from '@/lib/stores';
import { DevToolsProvider } from '@/lib/dev-tools';
import { setupErrorBoundaryHierarchy } from '@/lib/error-handling';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { RealtimeProvider } from '@/components/providers/realtime-provider';
import { PermissionProvider } from '@/components/providers/permission-provider';
import { LayoutProvider } from '@/components/providers/layout-provider';
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
          <StoreProvider enableDebug={process.env.NODE_ENV === 'development'}>
            <AuthProvider>
              <SessionManager>
                <TenantProvider>
                  <PermissionProvider>
                    <RealtimeProvider>
                      <LayoutProvider>
                        <NotificationProvider>
                          <DevToolsProvider>
                            <ErrorBoundaries.Page>
                              {children}
                            </ErrorBoundaries.Page>
                          </DevToolsProvider>
                        </NotificationProvider>
                      </LayoutProvider>
                    </RealtimeProvider>
                  </PermissionProvider>
                </TenantProvider>
              </SessionManager>
            </AuthProvider>
          </StoreProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundaries.App>
  );
}

export default Providers;