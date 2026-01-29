/**
 * Session Manager Component
 * Handles session monitoring and renewal across the application
 * Integrates with auth provider for transparent session management
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useSessionRenewal } from '@/lib/auth/session-renewal';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface SessionManagerProps {
  children: ReactNode;
}

/**
 * Session Manager Component
 * Provides transparent session management for the entire application
 */
export function SessionManager({ children }: SessionManagerProps) {
  const { isAuthenticated } = useAuth();
  const { startMonitoring, stopMonitoring } = useSessionRenewal();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Start session monitoring when user is authenticated
      startMonitoring();
    } else {
      // Stop monitoring when user is not authenticated
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isAuthenticated, startMonitoring, stopMonitoring]);

  useEffect(() => {
    // Handle session renewal events
    const handleSessionRenewal = (event: CustomEvent) => {
      console.log('Session renewed:', event.detail);
      // Could trigger auth state updates here if needed
    };

    // Handle session expiry events
    const handleSessionExpiry = () => {
      console.log('Session expired, redirecting to login...');
      // Store current location for post-auth redirect
      sessionStorage.setItem('intended_destination', window.location.pathname);
      router.push('/auth');
    };

    window.addEventListener('sessionRenewed', handleSessionRenewal as EventListener);
    window.addEventListener('sessionExpired', handleSessionExpiry);

    return () => {
      window.removeEventListener('sessionRenewed', handleSessionRenewal as EventListener);
      window.removeEventListener('sessionExpired', handleSessionExpiry);
    };
  }, [router]);

  return <>{children}</>;
}

export default SessionManager;