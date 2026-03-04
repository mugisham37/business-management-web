/**
 * useProgress Hook
 * 
 * Hook for managing progress state for long-running operations.
 * Tracks progress, elapsed time, and provides utilities for updates.
 * 
 * Requirements: 8.7
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Progress state
 */
export interface ProgressState {
  /**
   * Current progress value (0-100)
   */
  value: number;
  
  /**
   * Whether operation is in progress
   */
  isActive: boolean;
  
  /**
   * Start time in milliseconds
   */
  startTime: number | null;
  
  /**
   * Elapsed time in milliseconds
   */
  elapsed: number;
  
  /**
   * Current status message
   */
  message: string | null;
}

/**
 * useProgress Hook
 * 
 * Manages progress state for long-running operations.
 * 
 * Requirements: 8.7
 * 
 * @example
 * ```tsx
 * const { progress, start, update, complete, reset } = useProgress();
 * 
 * const handleLongOperation = async () => {
 *   start('Loading data...');
 *   
 *   for (let i = 0; i < items.length; i++) {
 *     await processItem(items[i]);
 *     update((i + 1) / items.length * 100, `Processing ${i + 1}/${items.length}`);
 *   }
 *   
 *   complete('Done!');
 * };
 * 
 * return (
 *   <div>
 *     {progress.isActive && (
 *       <ProgressIndicator
 *         value={progress.value}
 *         message={progress.message}
 *       />
 *     )}
 *   </div>
 * );
 * ```
 */
export function useProgress() {
  const [progress, setProgress] = useState<ProgressState>({
    value: 0,
    isActive: false,
    startTime: null,
    elapsed: 0,
    message: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update elapsed time
  useEffect(() => {
    if (progress.isActive && progress.startTime) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          elapsed: Date.now() - prev.startTime!,
        }));
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [progress.isActive, progress.startTime]);

  /**
   * Start progress tracking
   */
  const start = useCallback((message?: string) => {
    setProgress({
      value: 0,
      isActive: true,
      startTime: Date.now(),
      elapsed: 0,
      message: message || null,
    });
  }, []);

  /**
   * Update progress value and message
   */
  const update = useCallback((value: number, message?: string) => {
    setProgress(prev => ({
      ...prev,
      value: Math.min(100, Math.max(0, value)),
      message: message !== undefined ? message : prev.message,
    }));
  }, []);

  /**
   * Increment progress by a delta
   */
  const increment = useCallback((delta: number, message?: string) => {
    setProgress(prev => ({
      ...prev,
      value: Math.min(100, prev.value + delta),
      message: message !== undefined ? message : prev.message,
    }));
  }, []);

  /**
   * Complete progress
   */
  const complete = useCallback((message?: string) => {
    setProgress(prev => ({
      ...prev,
      value: 100,
      isActive: false,
      message: message !== undefined ? message : prev.message,
    }));
  }, []);

  /**
   * Reset progress
   */
  const reset = useCallback(() => {
    setProgress({
      value: 0,
      isActive: false,
      startTime: null,
      elapsed: 0,
      message: null,
    });
  }, []);

  return {
    progress,
    start,
    update,
    increment,
    complete,
    reset,
  };
}

/**
 * useBatchProgress Hook
 * 
 * Manages progress for batch operations with success/error tracking.
 * 
 * Requirements: 8.7
 * 
 * @example
 * ```tsx
 * const { progress, start, recordSuccess, recordError, complete } = useBatchProgress();
 * 
 * const handleBatchOperation = async (items) => {
 *   start(items.length);
 *   
 *   for (const item of items) {
 *     try {
 *       await processItem(item);
 *       recordSuccess();
 *     } catch (error) {
 *       recordError();
 *     }
 *   }
 *   
 *   complete();
 * };
 * ```
 */
export function useBatchProgress() {
  const [progress, setProgress] = useState({
    total: 0,
    success: 0,
    error: 0,
    pending: 0,
    isActive: false,
    startTime: null as number | null,
  });

  /**
   * Start batch progress
   */
  const start = useCallback((total: number) => {
    setProgress({
      total,
      success: 0,
      error: 0,
      pending: total,
      isActive: true,
      startTime: Date.now(),
    });
  }, []);

  /**
   * Record successful operation
   */
  const recordSuccess = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      success: prev.success + 1,
      pending: prev.pending - 1,
    }));
  }, []);

  /**
   * Record failed operation
   */
  const recordError = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      error: prev.error + 1,
      pending: prev.pending - 1,
    }));
  }, []);

  /**
   * Complete batch operation
   */
  const complete = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  /**
   * Reset batch progress
   */
  const reset = useCallback(() => {
    setProgress({
      total: 0,
      success: 0,
      error: 0,
      pending: 0,
      isActive: false,
      startTime: null,
    });
  }, []);

  /**
   * Get completion percentage
   */
  const getPercentage = useCallback((): number => {
    if (progress.total === 0) return 0;
    return ((progress.success + progress.error) / progress.total) * 100;
  }, [progress]);

  return {
    progress,
    start,
    recordSuccess,
    recordError,
    complete,
    reset,
    getPercentage,
  };
}

/**
 * useQueryProgress Hook
 * 
 * Specialized hook for tracking query/data loading progress.
 * 
 * Requirements: 8.7
 * 
 * @example
 * ```tsx
 * const { progress, start, updateLoaded, complete } = useQueryProgress();
 * 
 * const loadAuditLogs = async () => {
 *   start(1000); // Total records
 *   
 *   let loaded = 0;
 *   while (loaded < 1000) {
 *     const batch = await fetchBatch(loaded);
 *     loaded += batch.length;
 *     updateLoaded(loaded);
 *   }
 *   
 *   complete();
 * };
 * ```
 */
export function useQueryProgress() {
  const [progress, setProgress] = useState({
    loaded: 0,
    total: 0,
    isActive: false,
    indeterminate: false,
  });

  /**
   * Start query progress
   */
  const start = useCallback((total?: number) => {
    setProgress({
      loaded: 0,
      total: total || 0,
      isActive: true,
      indeterminate: !total,
    });
  }, []);

  /**
   * Update loaded count
   */
  const updateLoaded = useCallback((loaded: number) => {
    setProgress(prev => ({
      ...prev,
      loaded,
    }));
  }, []);

  /**
   * Update total count (if it becomes known)
   */
  const updateTotal = useCallback((total: number) => {
    setProgress(prev => ({
      ...prev,
      total,
      indeterminate: false,
    }));
  }, []);

  /**
   * Complete query
   */
  const complete = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  /**
   * Reset progress
   */
  const reset = useCallback(() => {
    setProgress({
      loaded: 0,
      total: 0,
      isActive: false,
      indeterminate: false,
    });
  }, []);

  /**
   * Get completion percentage
   */
  const getPercentage = useCallback((): number => {
    if (progress.indeterminate || progress.total === 0) return 0;
    return (progress.loaded / progress.total) * 100;
  }, [progress]);

  return {
    progress,
    start,
    updateLoaded,
    updateTotal,
    complete,
    reset,
    getPercentage,
  };
}
