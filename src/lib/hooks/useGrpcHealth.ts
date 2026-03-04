/**
 * useGrpcHealth Hook
 * 
 * React hook for gRPC Health Service operations
 * Provides health check and health watch functionality with loading/error states
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { healthClient, type HealthCheckResponse } from '@/grpc/clients/health-client';
import { errorHandler } from '@/lib/errors/error-handler';
import type { AppError } from '@/lib/errors/error-types';

export interface UseGrpcHealthResult {
  // State
  health: HealthCheckResponse | null;
  loading: boolean;
  error: AppError | null;
  isWatching: boolean;

  // Operations
  checkHealth: (service?: string) => Promise<HealthCheckResponse | null>;
  startWatching: (service?: string) => void;
  stopWatching: () => void;
}

/**
 * Hook for gRPC Health Service operations
 * 
 * @example
 * ```typescript
 * const { health, loading, error, checkHealth, startWatching, stopWatching } = useGrpcHealth();
 * 
 * // Check health once
 * await checkHealth();
 * 
 * // Watch health continuously
 * startWatching();
 * 
 * // Stop watching
 * stopWatching();
 * ```
 */
export function useGrpcHealth(): UseGrpcHealthResult {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const cancelWatchRef = useRef<(() => void) | null>(null);

  /**
   * Check health status (one-time check)
   */
  const checkHealth = useCallback(async (service?: string): Promise<HealthCheckResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await healthClient.check(service);
      setHealth(response);
      return response;
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Start watching health status (continuous updates)
   */
  const startWatching = useCallback((service?: string) => {
    // Stop existing watch if any
    if (cancelWatchRef.current) {
      cancelWatchRef.current();
    }

    setIsWatching(true);
    setError(null);

    const cancelWatch = healthClient.watch(
      (response) => {
        setHealth(response);
        setError(null);
      },
      (err) => {
        const appError = errorHandler.handle(err);
        setError(appError);
        setIsWatching(false);
      },
      service
    );

    cancelWatchRef.current = cancelWatch;
  }, []);

  /**
   * Stop watching health status
   */
  const stopWatching = useCallback(() => {
    if (cancelWatchRef.current) {
      cancelWatchRef.current();
      cancelWatchRef.current = null;
    }
    setIsWatching(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelWatchRef.current) {
        cancelWatchRef.current();
      }
    };
  }, []);

  return {
    health,
    loading,
    error,
    isWatching,
    checkHealth,
    startWatching,
    stopWatching,
  };
}

