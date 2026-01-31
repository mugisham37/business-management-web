'use client';

/**
 * Network Status Hook
 * Provides real-time network connectivity status and retry mechanisms
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { networkChecker } from '@/lib/auth/auth-errors';

export interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastChecked: Date | null;
  retryCount: number;
}

export interface UseNetworkStatusReturn extends NetworkStatus {
  checkConnectivity: () => Promise<boolean>;
  retry: () => Promise<void>;
  resetRetryCount: () => void;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: networkChecker.getStatus(),
    isConnected: true,
    lastChecked: null,
    retryCount: 0,
  });
  
  // Track if initial check has been done
  const hasInitialized = useRef(false);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    const isConnected = await networkChecker.checkConnectivity();
    const now = new Date();
    
    setStatus(prev => ({
      ...prev,
      isConnected,
      lastChecked: now,
    }));

    return isConnected;
  }, []);

  const retry = useCallback(async (): Promise<void> => {
    setStatus(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
    }));

    await checkConnectivity();
  }, [checkConnectivity]);

  const resetRetryCount = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      retryCount: 0,
    }));
  }, []);

  useEffect(() => {
    const unsubscribe = networkChecker.addListener((isOnline) => {
      setStatus(prev => ({
        ...prev,
        isOnline,
        isConnected: isOnline ? prev.isConnected : false,
      }));

      // Reset retry count when coming back online
      if (isOnline) {
        setStatus(prev => ({
          ...prev,
          retryCount: 0,
        }));
      }
    });

    // Initial connectivity check - deferred to avoid synchronous setState in effect
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Use queueMicrotask to defer the async check outside the synchronous effect body
      queueMicrotask(() => {
        checkConnectivity();
      });
    }

    return unsubscribe;
  }, [checkConnectivity]);

  return {
    ...status,
    checkConnectivity,
    retry,
    resetRetryCount,
  };
}