/**
 * Warehouse Performance Optimization Utilities
 * Performance monitoring and optimization helpers
 */

import { PERFORMANCE_THRESHOLDS, POLLING_INTERVALS } from './constants';

// ===== PERFORMANCE MONITORING =====

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private thresholds: Record<string, number> = {
    slowOperation: 5000, // 5 seconds
    highMemoryUsage: 50 * 1024 * 1024, // 50MB
  };

  /**
   * Start monitoring an operation
   */
  startOperation(operationName: string, metadata?: Record<string, any>): string {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.metrics.set(operationId, {
      operationName,
      startTime: performance.now(),
      success: false,
      metadata,
    });

    return operationId;
  }

  /**
   * End monitoring an operation
   */
  endOperation(operationId: string, success: boolean = true, errorMessage?: string): PerformanceMetrics | null {
    const metric = this.metrics.get(operationId);
    if (!metric) return null;

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    const memoryUsage = this.getMemoryUsage();

    const completedMetric: PerformanceMetrics = {
      ...metric,
      endTime,
      duration,
      memoryUsage,
      success,
      errorMessage,
    };

    this.metrics.set(operationId, completedMetric);

    // Log performance warnings
    this.checkPerformanceThresholds(completedMetric);

    return completedMetric;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Check performance thresholds and log warnings
   */
  private checkPerformanceThresholds(metric: PerformanceMetrics): void {
    if (metric.duration && metric.duration > this.thresholds.slowOperation) {
      console.warn(`Slow operation detected: ${metric.operationName} took ${metric.duration.toFixed(2)}ms`);
    }

    if (metric.memoryUsage && metric.memoryUsage > this.thresholds.highMemoryUsage) {
      console.warn(`High memory usage detected: ${metric.operationName} used ${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics by operation name
   */
  getMetricsByOperation(operationName: string): PerformanceMetrics[] {
    return Array.from(this.metrics.values()).filter(metric => metric.operationName === operationName);
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(maxAge: number = 300000): void { // 5 minutes
    const cutoffTime = Date.now() - maxAge;
    
    for (const [id, metric] of this.metrics.entries()) {
      if (metric.startTime < cutoffTime) {
        this.metrics.delete(id);
      }
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalOperations: number;
    successRate: number;
    averageDuration: number;
    slowOperations: number;
    highMemoryOperations: number;
  } {
    const metrics = this.getAllMetrics();
    const completedMetrics = metrics.filter(m => m.duration !== undefined);

    const totalOperations = completedMetrics.length;
    const successfulOperations = completedMetrics.filter(m => m.success).length;
    const successRate = totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0;

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalOperations > 0 ? totalDuration / totalOperations : 0;

    const slowOperations = completedMetrics.filter(m => 
      (m.duration || 0) > this.thresholds.slowOperation
    ).length;

    const highMemoryOperations = completedMetrics.filter(m => 
      (m.memoryUsage || 0) > this.thresholds.highMemoryUsage
    ).length;

    return {
      totalOperations,
      successRate,
      averageDuration,
      slowOperations,
      highMemoryOperations,
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// ===== PERFORMANCE DECORATORS =====

/**
 * Performance monitoring decorator for functions
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  operationName: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const operationId = performanceMonitor.startOperation(operationName, { args });
    
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result.then === 'function') {
        return result
          .then((value: any) => {
            performanceMonitor.endOperation(operationId, true);
            return value;
          })
          .catch((error: any) => {
            performanceMonitor.endOperation(operationId, false, error.message);
            throw error;
          });
      }
      
      performanceMonitor.endOperation(operationId, true);
      return result;
    } catch (error) {
      performanceMonitor.endOperation(operationId, false, (error as Error).message);
      throw error;
    }
  }) as T;
}

// ===== CACHING UTILITIES =====

/**
 * Simple in-memory cache with TTL
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set cache value
   */
  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get cache value
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hitRate: number;
    expiredEntries: number;
  } {
    const size = this.cache.size;
    const now = Date.now();
    const expiredEntries = Array.from(this.cache.values()).filter(item => now > item.expiry).length;
    
    return {
      size,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
      expiredEntries,
    };
  }
}

// ===== DEBOUNCING AND THROTTLING =====

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// ===== BATCH PROCESSING =====

/**
 * Batch processor for handling multiple operations efficiently
 */
export class BatchProcessor<T, R> {
  private batch: T[] = [];
  private batchSize: number;
  private batchTimeout: number;
  private processor: (items: T[]) => Promise<R[]>;
  private timeoutId?: NodeJS.Timeout;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSize: number = 10,
    batchTimeout: number = 1000
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
  }

  /**
   * Add item to batch
   */
  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push(item);
      
      // Store resolve/reject for this item
      (item as any).__resolve = resolve;
      (item as any).__reject = reject;
      
      // Process if batch is full
      if (this.batch.length >= this.batchSize) {
        this.processBatch();
      } else {
        // Set timeout for partial batch
        this.scheduleTimeout();
      }
    });
  }

  /**
   * Schedule timeout for batch processing
   */
  private scheduleTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      if (this.batch.length > 0) {
        this.processBatch();
      }
    }, this.batchTimeout);
  }

  /**
   * Process current batch
   */
  private async processBatch(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    
    const currentBatch = this.batch.splice(0);
    
    try {
      const results = await this.processor(currentBatch);
      
      // Resolve promises
      currentBatch.forEach((item, index) => {
        const resolve = (item as any).__resolve;
        if (resolve) {
          resolve(results[index]);
        }
      });
    } catch (error) {
      // Reject all promises
      currentBatch.forEach(item => {
        const reject = (item as any).__reject;
        if (reject) {
          reject(error);
        }
      });
    }
  }

  /**
   * Flush remaining items in batch
   */
  async flush(): Promise<void> {
    if (this.batch.length > 0) {
      await this.processBatch();
    }
  }
}

// ===== POLLING UTILITIES =====

/**
 * Smart polling with exponential backoff
 */
export class SmartPoller {
  private intervalId?: NodeJS.Timeout;
  private currentInterval: number;
  private maxInterval: number;
  private backoffMultiplier: number;
  private isPolling: boolean = false;

  constructor(
    private pollFunction: () => Promise<boolean>, // Returns true if should continue polling
    private initialInterval: number = POLLING_INTERVALS.NORMAL,
    maxInterval: number = POLLING_INTERVALS.VERY_SLOW,
    backoffMultiplier: number = 1.5
  ) {
    this.currentInterval = initialInterval;
    this.maxInterval = maxInterval;
    this.backoffMultiplier = backoffMultiplier;
  }

  /**
   * Start polling
   */
  start(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.currentInterval = this.initialInterval;
    this.scheduleNext();
  }

  /**
   * Stop polling
   */
  stop(): void {
    this.isPolling = false;
    
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Schedule next poll
   */
  private scheduleNext(): void {
    if (!this.isPolling) return;
    
    this.intervalId = setTimeout(async () => {
      try {
        const shouldContinue = await this.pollFunction();
        
        if (shouldContinue) {
          // Reset interval on successful poll
          this.currentInterval = this.initialInterval;
        } else {
          // Increase interval on unsuccessful poll
          this.currentInterval = Math.min(
            this.currentInterval * this.backoffMultiplier,
            this.maxInterval
          );
        }
        
        this.scheduleNext();
      } catch (error) {
        console.error('Polling error:', error);
        
        // Increase interval on error
        this.currentInterval = Math.min(
          this.currentInterval * this.backoffMultiplier,
          this.maxInterval
        );
        
        this.scheduleNext();
      }
    }, this.currentInterval);
  }

  /**
   * Get current polling status
   */
  getStatus(): {
    isPolling: boolean;
    currentInterval: number;
    maxInterval: number;
  } {
    return {
      isPolling: this.isPolling,
      currentInterval: this.currentInterval,
      maxInterval: this.maxInterval,
    };
  }
}

// ===== PERFORMANCE UTILITIES =====

/**
 * Measure function execution time
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T> | T,
  label?: string
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    if (label) {
      console.log(`${label} took ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    
    if (label) {
      console.error(`${label} failed after ${duration.toFixed(2)}ms:`, error);
    }
    
    throw error;
  }
}

/**
 * Create performance-optimized selector
 */
export function createMemoizedSelector<T, R>(
  selector: (input: T) => R,
  equalityFn?: (a: R, b: R) => boolean
): (input: T) => R {
  let lastInput: T;
  let lastResult: R;
  let hasResult = false;

  const defaultEqualityFn = (a: R, b: R) => a === b;
  const isEqual = equalityFn || defaultEqualityFn;

  return (input: T): R => {
    if (!hasResult || input !== lastInput) {
      const newResult = selector(input);
      
      if (!hasResult || !isEqual(lastResult, newResult)) {
        lastResult = newResult;
      }
      
      lastInput = input;
      hasResult = true;
    }
    
    return lastResult;
  };
}

/**
 * Optimize array operations
 */
export const arrayUtils = {
  /**
   * Chunk array into smaller arrays
   */
  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    
    return chunks;
  },

  /**
   * Remove duplicates from array
   */
  unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
    if (!keyFn) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  /**
   * Group array items by key
   */
  groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * Sort array with multiple criteria
   */
  multiSort<T>(
    array: T[],
    sortFns: Array<(a: T, b: T) => number>
  ): T[] {
    return [...array].sort((a, b) => {
      for (const sortFn of sortFns) {
        const result = sortFn(a, b);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });
  },
};

// ===== CLEANUP UTILITIES =====

/**
 * Cleanup manager for handling resource cleanup
 */
export class CleanupManager {
  private cleanupFunctions: Array<() => void | Promise<void>> = [];

  /**
   * Add cleanup function
   */
  add(cleanupFn: () => void | Promise<void>): void {
    this.cleanupFunctions.push(cleanupFn);
  }

  /**
   * Execute all cleanup functions
   */
  async cleanup(): Promise<void> {
    const promises = this.cleanupFunctions.map(fn => {
      try {
        return Promise.resolve(fn());
      } catch (error) {
        console.error('Cleanup function error:', error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
    this.cleanupFunctions = [];
  }

  /**
   * Get number of cleanup functions
   */
  size(): number {
    return this.cleanupFunctions.length;
  }
}