/**
 * useHealthCheck Hook
 * 
 * React hook for health check operations.
 * Provides access to system health status monitoring.
 * 
 * Features:
 * - Fetch system health status
 * - Monitor component health
 * - Automatic polling support
 * - Centralized error handling
 * 
 * Requirements: 3.9, 3.10
 */

import { useState, useCallback } from 'react';
import { useQuery as useApolloQuery } from '@apollo/client/react';

import { HEALTH } from '@/graphql/queries/health';
import type { HealthData } from '@/graphql/types/operations';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

/**
 * Component health type
 */
export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastCheck: string;
}

/**
 * Health check response type
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: ComponentHealth[];
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UseHealthCheckReturn {
  // Query data
  health: HealthCheckResponse | undefined;
  
  // Loading state
  loading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations
  checkHealth: () => Promise<void>;
  startPolling: (interval: number) => void;
  stopPolling: () => void;
}

/**
 * useHealthCheck Hook
 * 
 * @param pollInterval - Optional polling interval in milliseconds
 * @returns Health check operations and data
 * 
 * Requirements: 3.9, 3.10
 */
export function useHealthCheck(pollInterval?: number): UseHealthCheckReturn {
  const [error, setError] = useState<AppError | null>(null);

  // Query for health status
  const {
    data: healthData,
    loading,
    error: healthError,
    refetch,
    startPolling,
    stopPolling,
  } = useApolloQuery<HealthData>(HEALTH, {
    fetchPolicy: 'network-only', // Always fetch fresh health data
    pollInterval: pollInterval || 0, // Optional polling
  });

  /**
   * Manually trigger health check
   * Requirements: 3.9
   */
  const checkHealth = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await refetch();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetch]);

  // Handle query errors
  if (healthError && !error) {
    setError(errorHandler.handle(healthError));
  }

  return {
    // Data
    health: healthData?.health,
    
    // Loading state
    loading,
    
    // Error state
    error,
    
    // Operations
    checkHealth,
    startPolling,
    stopPolling,
  };
}
 