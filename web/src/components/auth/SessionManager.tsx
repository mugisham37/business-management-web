/**
 * Session Manager Component
 * Handles session monitoring and renewal across the application
 * Integrates with auth provider for transparent session management
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { useSecurity } from '@/lib/hooks/auth/useSecurity';
import { AuthEventEmitter } from '@/lib/auth/auth-events';
import { TokenManager } from '@/lib/auth/token-manager';

interface SessionManagerProps {
  children: ReactNode;
}

/**
 * Session Manager Component
 * Provides transparent session management for the entire application
 */
export function SessionManager({ children }: SessionManagerProps) {
  const { isAuthenticated, user, refreshToken } = useAuth();
  const { logSecurityEvent } = useSecurity();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Set up session monitoring interval
    const sessionCheckInterval = setInterval(async () => {
      try {
        // Check if token is still valid
        const token = TokenManager.getAccessToken();
        if (!token) {
          AuthEventEmitter.emit('auth:session_expired');
          return;
        }

        // Check if token needs refresh (5 minutes before expiry)
        if (TokenManager.isTokenExpiringSoon()) {
          console.log('Token expiring soon, attempting refresh...');
          const refreshed = await refreshToken();
          
          if (refreshed) {
            console.log('Token refreshed successfully');
            await logSecurityEvent('token_refreshed', 'Session token refreshed', {
              userId: user?.id,
              timestamp: new Date().toISOString(),
            });
          } else {
            console.log('Token refresh failed');
            AuthEventEmitter.emit('auth:session_expired');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [isAuthenticated, user, refreshToken, logSecurityEvent]);

  useEffect(() => {
    // Handle session events
    const handleSessionExpired = () => {
      console.log('Session expired, redirecting to login...');
      
      // Log security event
      logSecurityEvent('session_expired', 'User session expired', {
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });

      // Store current location for post-auth redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('intended_destination', window.location.pathname);
      }
      
      router.push('/auth');
    };

    const handleLogout = (data?: { reason?: string }) => {
      console.log('User logged out:', data?.reason);
      
      // Log security event
      logSecurityEvent('logout', `User logged out: ${data?.reason || 'manual'}`, {
        userId: user?.id,
        reason: data?.reason,
        timestamp: new Date().toISOString(),
      });

      // Clear any stored destination
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('intended_destination');
      }
      
      router.push('/auth');
    };

    const handlePermissionDenied = (data: { operation?: string; error: string }) => {
      console.log('Permission denied:', data);
      
      // Log security event
      logSecurityEvent('permission_denied', `Permission denied: ${data.error}`, {
        userId: user?.id,
        operation: data.operation,
        error: data.error,
        timestamp: new Date().toISOString(),
      });
    };

    // Listen for auth events
    AuthEventEmitter.on('auth:session_expired', handleSessionExpired);
    AuthEventEmitter.on('auth:logout', handleLogout);
    AuthEventEmitter.on('auth:permission_denied', handlePermissionDenied);

    return () => {
      AuthEventEmitter.off('auth:session_expired', handleSessionExpired);
      AuthEventEmitter.off('auth:logout', handleLogout);
      AuthEventEmitter.off('auth:permission_denied', handlePermissionDenied);
    };
  }, [router, user, logSecurityEvent]);

  // Handle page visibility changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, check if session is still valid
        const token = TokenManager.getAccessToken();
        if (!token) {
          AuthEventEmitter.emit('auth:session_expired');
          return;
        }

        // Log security event for session resume
        await logSecurityEvent('session_resumed', 'User resumed session', {
          userId: user?.id,
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user, logSecurityEvent]);

  // Handle storage events (multi-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_tokens') {
        if (!event.newValue) {
          // Tokens were cleared in another tab
          AuthEventEmitter.emit('auth:logout', { reason: 'multi_tab_logout' });
        } else {
          // Tokens were updated in another tab
          console.log('Tokens updated in another tab');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
}

export default SessionManager;