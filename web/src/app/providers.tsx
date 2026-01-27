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
 * 6. TenantProvider - Multi-tenant context
 * 7. PermissionProvider - RBAC
 * 8. RealtimeProvider - WebSocket/subscriptions
 * 9. LayoutProvider - Responsive state
 * 10. NotificationProvider - Toast notifications
 * 11. DevToolsProvider - Development tools
 */
export function Providers({ children }: ProvidersProps) {
  const ErrorBoundaries = setupErrorBoundaryHierarchy();

  return (
    <ErrorBoundaries.App>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <ApolloProvider>
          <StoreProvider enableDebug={process.env.NODE_ENV === 'development'}>
            <AuthProvider>
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
            </AuthProvider>
          </StoreProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundaries.App>
  );
}

export default Providers;