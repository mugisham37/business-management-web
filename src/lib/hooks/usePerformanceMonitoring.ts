/**
 * usePerformanceMonitoring Hook
 * 
 * Hook for monitoring query and mutation performance.
 * Automatically tracks execution times and cache hit rates.
 * 
 * Features:
 * - Automatic query timing
 * - Cache hit rate tracking
 * - Performance reports
 * 
 * Requirements: 12.10
 */

import { useEffect, useCallback } from 'react';
import { performanceMonitor } from '@/lib/monitoring/performance';
import type { CacheStats, MetricSummary } from '@/lib/monitoring/performance';

export interface UsePerformanceMonitoringReturn {
  /** Track a query execution */
  trackQuery: (operationName: string, duration: number, fromCache?: boolean) => void;
  /** Track a mutation execution */
  trackMutation: (operationName: string, duration: number) => void;
  /** Get cache statistics */
  getCacheStats: () => CacheStats;
  /** Get metrics summary */
  getMetricsSummary: () => Record<string, MetricSummary>;
  /** Log performance report */
  logReport: () => void;
}

/**
 * usePerformanceMonitoring Hook
 * 
 * @returns Performance monitoring utilities
 * 
 * @example
 * ```tsx
 * const { trackQuery, getCacheStats, logReport } = usePerformanceMonitoring();
 * 
 * // Track query
 * const startTime = Date.now();
 * const { data } = await client.query({ query: GET_USERS });
 * trackQuery('GetUsers', Date.now() - startTime, !!data);
 * 
 * // Log report
 * useEffect(() => {
 *   const interval = setInterval(logReport, 60000); // Every minute
 *   return () => clearInterval(interval);
 * }, []);
 * ```
 * 
 * Requirements: 12.10
 */
export function usePerformanceMonitoring(): UsePerformanceMonitoringReturn {
  // Initialize web vitals tracking on mount
  useEffect(() => {
    performanceMonitor.trackWebVitals();
  }, []);

  const trackQuery = useCallback(
    (operationName: string, duration: number, fromCache: boolean = false) => {
      performanceMonitor.trackQuery(operationName, duration, fromCache);
    },
    []
  );

  const trackMutation = useCallback((operationName: string, duration: number) => {
    performanceMonitor.trackMutation(operationName, duration);
  }, []);

  const getCacheStats = useCallback(() => {
    return performanceMonitor.getCacheStats();
  }, []);

  const getMetricsSummary = useCallback(() => {
    return performanceMonitor.getMetricsSummary();
  }, []);

  const logReport = useCallback(() => {
    performanceMonitor.logPerformanceReport();
  }, []);

  return {
    trackQuery,
    trackMutation,
    getCacheStats,
    getMetricsSummary,
    logReport,
  };
}
