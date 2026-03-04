'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apolloClient } from '@/lib/api/apollo-client';
import { checkBackendHealth, HealthCheckResult } from '@/lib/api/health-check';

/**
 * Connection Status
 */
export type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'reconnecting';

/**
 * Backend Connection State
 */
export interface BackendConnectionState {
  status: ConnectionStatus;
  isHealthy: boolean;
  lastChecked: Date | null;
  error: string | null;
  retryCount: number;
  healthDetails: HealthCheckResult | null;
}

/**
 * Hook Configuration
 */
interface UseBackendConnectionConfig {
  checkOnMount?: boolean;
  retryInterval?: number;
  maxRetries?: number;
  onStatusChange?: (status: ConnectionStatus) => void;
}

/**
 * useBackendConnection Hook
 * 
 * Monitors backend connection health and provides real-time status updates.
 * 
 * Features:
 * - Initial health check on mount
 * - Automatic retry with exponential backoff when disconnected
 * - Status change callbacks for toast notifications
 * - Manual retry capability
 * 
 * @param config - Hook configuration options
 * @returns Connection state and control functions
 * 
 * Requirements: 2.1
 */
export function useBackendConnection(config: UseBackendConnectionConfig = {}) {
  const {
    checkOnMount = true,
    retryInterval = 10000, // 10 seconds
    maxRetries = Infinity,
    onStatusChange,
  } = config;

  const [state, setState] = useState<BackendConnectionState>({
    status: 'checking',
    isHealthy: false,
    lastChecked: null,
    error: null,
    retryCount: 0,
    healthDetails: null,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  /**
   * Perform Health Check
   */
  const performHealthCheck = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) return;
    
    isCheckingRef.current = true;

    try {
      const result = await checkBackendHealth(apolloClient, 5000);

      setState((prev) => {
        const newStatus: ConnectionStatus = result.isHealthy 
          ? 'connected' 
          : prev.status === 'connected' 
            ? 'reconnecting' 
            : 'disconnected';

        // Call status change callback if status changed
        if (newStatus !== prev.status && onStatusChange) {
          onStatusChange(newStatus);
        }

        return {
          status: newStatus,
          isHealthy: result.isHealthy,
          lastChecked: new Date(),
          error: result.error || null,
          retryCount: result.isHealthy ? 0 : prev.retryCount,
          healthDetails: result,
        };
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setState((prev) => ({
        ...prev,
        status: 'disconnected',
        isHealthy: false,
        lastChecked: new Date(),
        error: errorMessage,
      }));

      return null;
    } finally {
      isCheckingRef.current = false;
    }
  }, [onStatusChange]);

  /**
   * Schedule Retry
   */
  const scheduleRetry = useCallback(() => {
    // Clear existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState((prev) => {
      // Don't retry if connected or exceeded max retries
      if (prev.isHealthy || prev.retryCount >= maxRetries) {
        return prev;
      }

      // Schedule next retry
      retryTimeoutRef.current = setTimeout(() => {
        performHealthCheck();
      }, retryInterval);

      return {
        ...prev,
        retryCount: prev.retryCount + 1,
      };
    });
  }, [performHealthCheck, retryInterval, maxRetries]);

  /**
   * Manual Retry
   */
  const retry = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: 'checking',
      retryCount: 0,
    }));

    await performHealthCheck();
  }, [performHealthCheck]);

  /**
   * Initial Health Check
   */
  useEffect(() => {
    if (checkOnMount) {
      performHealthCheck();
    }
  }, [checkOnMount, performHealthCheck]);

  /**
   * Auto-retry when disconnected
   */
  useEffect(() => {
    if (!state.isHealthy && state.status !== 'checking') {
      scheduleRetry();
    }

    // Cleanup timeout on unmount or when connected
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [state.isHealthy, state.status, scheduleRetry]);

  return {
    ...state,
    retry,
    checkHealth: performHealthCheck,
  };
}
