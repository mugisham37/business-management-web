'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ApolloProvider, ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { AuthProvider } from '@/lib/providers/auth-provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { NotificationProvider } from '@/lib/providers/notification-provider';
import { RealtimeProvider } from '@/lib/providers/realtime-provider';
import { PermissionProvider } from '@/lib/providers/permission-provider';
import { LayoutProvider } from '@/lib/providers/layout-provider';
import { SessionManager } from '@/components/auth/SessionManager';
import { AuthEventHandler } from '@/components/auth/AuthEventHandler';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Centralized provider setup for the entire application
 * Integrates all systems into a cohesive application structure
 * 
 * Provider Hierarchy (outer to inner):
 * 1. ThemeProvider - Dark/light mode
 * 2. ApolloProvider - GraphQL client
 * 3. AuthProvider - Authentication context
 * 4. SessionManager - Session monitoring and renewal
 * 5. PermissionProvider - RBAC
 * 6. RealtimeProvider - WebSocket/subscriptions
 * 7. LayoutProvider - Responsive state
 * 8. NotificationProvider - Toast notifications
 * 9. AuthEventHandler - Global auth event handling
 */
export function Providers({ children }: ProvidersProps) {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);
  
  // Initialize Apollo Client only on the client-side
  useEffect(() => {
    import('@/lib/graphql/client').then(({ getApolloClient }) => {
      setClient(getApolloClient());
    });
  }, []);
  
  // Show loading or fallback during SSR and initial hydration
  if (!client) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <LayoutProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </LayoutProvider>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ApolloProvider client={client}>
        <AuthProvider>
          <SessionManager>
            <PermissionProvider>
              <RealtimeProvider>
                <LayoutProvider>
                  <NotificationProvider>
                    <AuthEventHandler />
                    {children}
                  </NotificationProvider>
                </LayoutProvider>
              </RealtimeProvider>
            </PermissionProvider>
          </SessionManager>
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default Providers;