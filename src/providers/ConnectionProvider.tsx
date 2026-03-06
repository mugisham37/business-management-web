'use client';

import React, { useEffect, useRef } from 'react';
import { useBackendConnection, ConnectionStatus } from '@/lib/hooks/useBackendConnection';
import { useToast } from '@/components/ui/sonner';

/**
 * Connection Provider Props
 */
interface ConnectionProviderProps {
  children: React.ReactNode;
  showToasts?: boolean;
  checkOnMount?: boolean;
}

/**
 * ConnectionProvider Component
 * 
 * Monitors backend connection health and displays toast notifications
 * for connection status changes.
 * 
 * Features:
 * - Automatic health check on mount
 * - Toast notifications for connection status
 * - Graceful degradation (app loads even if backend is down)
 * - Automatic reconnection with retry logic
 * 
 * Toast Behavior:
 * - Connected: Green success toast, auto-dismiss after 3s
 * - Disconnected: Yellow warning toast, persistent with retry info
 * - Reconnected: Green success toast with celebration, auto-dismiss after 4s
 * - Error: Red error toast for critical issues
 * 
 * Requirements: 2.1
 * 
 * @example
 * ```typescript
 * <ConnectionProvider>
 *   <App />
 * </ConnectionProvider>
 * ```
 */
export function ConnectionProvider({
  children,
  showToasts = true,
  checkOnMount = true,
}: ConnectionProviderProps) {
  const { addToast } = useToast();
  const hasShownInitialToast = useRef(false);
  const previousStatus = useRef<ConnectionStatus | null>(null);

  /**
   * Handle Status Changes
   */
  const handleStatusChange = (status: ConnectionStatus) => {
    if (!showToasts) return;

    const isInitialCheck = !hasShownInitialToast.current;
    const wasConnected = previousStatus.current === 'connected';
    const isReconnecting = previousStatus.current === 'reconnecting' || previousStatus.current === 'disconnected';

    switch (status) {
      case 'connected':
        if (isInitialCheck) {
          // Initial connection success
          addToast({
            title: 'Connected to Backend',
            description: 'GraphQL server is ready on port 3001',
            variant: 'success',
            duration: 3000,
          });
        } else if (isReconnecting) {
          // Reconnection success
          addToast({
            title: 'Connection Restored',
            description: 'Successfully reconnected to backend',
            variant: 'success',
            duration: 4000,
          });
        }
        break;

      case 'disconnected':
        if (isInitialCheck) {
          // Initial connection failed
          addToast({
            title: 'Backend Unavailable',
            description: 'Cannot connect to GraphQL server on port 3001. Retrying...',
            variant: 'warning',
            duration: Infinity, // Persistent until connected
          });
        } else if (wasConnected) {
          // Lost connection
          addToast({
            title: 'Connection Lost',
            description: 'Lost connection to backend. Attempting to reconnect...',
            variant: 'warning',
            duration: Infinity,
          });
        }
        break;

      case 'reconnecting':
        // Silent - already showing disconnected toast
        break;

      case 'checking':
        // Silent - checking is brief
        break;
    }

    hasShownInitialToast.current = true;
    previousStatus.current = status;
  };

  /**
   * Use Backend Connection Hook
   */
  const connection = useBackendConnection({
    checkOnMount,
    retryInterval: 30000, // Retry every 30 seconds instead of 10
    maxRetries: Infinity, // Keep retrying
    onStatusChange: handleStatusChange,
  });

  /**
   * Log connection status in development
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ConnectionProvider] Status:', connection.status, {
        isHealthy: connection.isHealthy,
        retryCount: connection.retryCount,
        lastChecked: connection.lastChecked,
        error: connection.error,
      });
    }
  }, [connection.status, connection.isHealthy, connection.retryCount, connection.lastChecked, connection.error]);

  return <>{children}</>;
}
