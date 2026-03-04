/**
 * Performance Monitoring System
 * 
 * Tracks performance metrics including:
 * - API request durations
 * - GraphQL query execution times
 * - Cache hit/miss rates
 * - WebSocket connection stability
 * - Core Web Vitals (LCP, FID, CLS)
 * 
 * Requirements: 8.1, 12.10
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: Date;
  context?: Record<string, any>;
}

interface MetricSummary {
  avg: number;
  min: number;
  max: number;
  count: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Track API request duration
   * @param endpoint - The API endpoint being called
   * @param duration - Request duration in milliseconds
   * @param correlationId - Optional correlation ID for tracing
   * 
   * Requirements: 12.10
   */
  trackRequest(endpoint: string, duration: number, correlationId?: string): void {
    this.recordMetric({
      name: 'api_request_duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: { endpoint, correlationId },
    });
  }

  /**
   * Track GraphQL query execution time
   * @param operationName - The GraphQL operation name
   * @param duration - Query execution time in milliseconds
   * @param fromCache - Whether the result came from cache
   * 
   * Requirements: 12.10
   */
  trackQuery(operationName: string, duration: number, fromCache: boolean = false): void {
    this.recordMetric({
      name: 'graphql_query_duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: { operationName, fromCache },
    });

    // Track cache hit/miss
    if (fromCache) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
  }

  /**
   * Track GraphQL mutation execution time
   * @param operationName - The GraphQL mutation name
   * @param duration - Mutation execution time in milliseconds
   * 
   * Requirements: 12.10
   */
  trackMutation(operationName: string, duration: number): void {
    this.recordMetric({
      name: 'graphql_mutation_duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: { operationName },
    });
  }

  /**
   * Track cache hit or miss
   * @param hit - Whether the cache was hit (true) or missed (false)
   * @param key - The cache key being accessed
   * 
   * Requirements: 12.10
   */
  trackCacheHit(hit: boolean, key: string): void {
    this.recordMetric({
      name: hit ? 'cache_hit' : 'cache_miss',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      context: { key },
    });

    if (hit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
  }

  /**
   * Get cache statistics
   * @returns Cache hit/miss statistics
   * 
   * Requirements: 12.10
   */
  getCacheStats(): CacheStats {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests,
    };
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Track WebSocket connection state changes
   * @param state - The connection state (connecting, connected, disconnected, reconnecting)
   * @param duration - Optional duration in the state (milliseconds)
   */
  trackWebSocketState(state: string, duration?: number): void {
    this.recordMetric({
      name: 'websocket_state',
      value: duration || 0,
      unit: 'ms',
      timestamp: new Date(),
      context: { state },
    });
  }

  /**
   * Track Core Web Vitals using PerformanceObserver API
   * Monitors:
   * - Largest Contentful Paint (LCP)
   * - First Input Delay (FID)
   * - Cumulative Layout Shift (CLS)
   */
  trackWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric({
          name: 'lcp',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: new Date(),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      // LCP not supported in this browser
      console.debug('LCP tracking not supported:', error);
    }

    // First Input Delay (FID)
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric({
            name: 'fid',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: new Date(),
          });
        });
      }).observe({ entryTypes: ['first-input'] });
    } catch (error) {
      // FID not supported in this browser
      console.debug('FID tracking not supported:', error);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric({
          name: 'cls',
          value: clsValue,
          unit: 'count',
          timestamp: new Date(),
        });
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      // CLS not supported in this browser
      console.debug('CLS tracking not supported:', error);
    }
  }

  /**
   * Calculate percentiles for a set of values
   * @param values - Array of numeric values
   * @param percentile - Percentile to calculate (0-100)
   * @returns The percentile value
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get aggregated metrics summary with percentiles
   * @returns Summary statistics for each metric type
   * 
   * Requirements: 12.10
   */
  getMetricsSummary(): Record<string, MetricSummary> {
    const summary: Record<string, { values: number[]; count: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { values: [], count: 0 };
      }
      summary[metric.name].values.push(metric.value);
      summary[metric.name].count++;
    });

    const result: Record<string, MetricSummary> = {};
    Object.entries(summary).forEach(([name, data]) => {
      const values = data.values;
      result[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: data.count,
        p50: this.calculatePercentile(values, 50),
        p95: this.calculatePercentile(values, 95),
        p99: this.calculatePercentile(values, 99),
      };
    });

    return result;
  }

  /**
   * Get performance report
   * @returns Comprehensive performance report
   * 
   * Requirements: 12.10
   */
  getPerformanceReport(): {
    metrics: Record<string, MetricSummary>;
    cache: CacheStats;
    timestamp: Date;
  } {
    return {
      metrics: this.getMetricsSummary(),
      cache: this.getCacheStats(),
      timestamp: new Date(),
    };
  }

  /**
   * Log performance report to console
   * 
   * Requirements: 12.10
   */
  logPerformanceReport(): void {
    const report = this.getPerformanceReport();
    
    console.group('📊 Performance Report');
    console.log('Timestamp:', report.timestamp.toISOString());
    
    console.group('Cache Statistics');
    console.log(`Hit Rate: ${report.cache.hitRate}%`);
    console.log(`Hits: ${report.cache.hits}`);
    console.log(`Misses: ${report.cache.misses}`);
    console.log(`Total Requests: ${report.cache.totalRequests}`);
    console.groupEnd();
    
    console.group('Query Metrics');
    Object.entries(report.metrics).forEach(([name, stats]) => {
      console.log(`${name}:`, {
        avg: `${stats.avg.toFixed(2)}ms`,
        min: `${stats.min.toFixed(2)}ms`,
        max: `${stats.max.toFixed(2)}ms`,
        p50: `${stats.p50?.toFixed(2)}ms`,
        p95: `${stats.p95?.toFixed(2)}ms`,
        p99: `${stats.p99?.toFixed(2)}ms`,
        count: stats.count,
      });
    });
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Record a performance metric
   * @param metric - The metric to record
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last N metrics to prevent memory issues
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Performance]', metric);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service (e.g., Datadog, New Relic)
      // this.sendToMonitoring(metric);
    }
  }

  /**
   * Clear all recorded metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.resetCacheStats();
  }

  /**
   * Get all recorded metrics
   * @returns Array of all performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

export const performanceMonitor = new PerformanceMonitor();
export type { PerformanceMetric, MetricSummary, CacheStats };
