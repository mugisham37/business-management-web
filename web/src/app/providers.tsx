'use client';

import React, { useState, useEffect } from 'react';
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
 * Loading fallback component displayed while Apollo Client is initializing
 * This prevents components using Apollo hooks from rendering prematurely
 */
function ApolloLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Initializing...</p>
      </div>
    </div>
  );
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
 * 
 * IMPORTANT: Children are NOT rendered until Apollo Client is ready.
 * This prevents "Could not find client in context" errors when components
 * use Apollo hooks (useQuery, useMutation, etc.) during initial render.
 */
export function Providers({ children }: ProvidersProps) {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize Apollo Client only on the client-side
  useEffect(() => {
    import('@/lib/graphql/client').then(({ getApolloClient }) => {
      setClient(getApolloClient());
      setIsInitialized(true);
    });
  }, []);
  
  // Show loading fallback while Apollo Client is initializing
  // CRITICAL: Do NOT render children without ApolloProvider as they may use Apollo hooks
  if (!client || !isInitialized) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <LayoutProvider>
          <NotificationProvider>
            <ApolloLoadingFallback />
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