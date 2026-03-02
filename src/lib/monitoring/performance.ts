/**
 * Performance Monitoring System
 * 
 * Tracks performance metrics including:
 * - API request durations
 * - Cache hit/miss rates
 * - WebSocket connection stability
 * - Core Web Vitals (LCP, FID, CLS)
 * 
 * Requirements: 8.1
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: Date;
  context?: Record<string, any>;
}

interface MetricSummary {
  avg: number;
  min: number;
  max: number;
  count: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  /**
   * Track API request duration
   * @param endpoint - The API endpoint being called
   * @param duration - Request duration in milliseconds
   * @param correlationId - Optional correlation ID for tracing
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
   * Track cache hit or miss
   * @param hit - Whether the cache was hit (true) or missed (false)
   * @param key - The cache key being accessed
   */
  trackCacheHit(hit: boolean, key: string): void {
    this.recordMetric({
      name: hit ? 'cache_hit' : 'cache_miss',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      context: { key },
    });
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
   * Get aggregated metrics summary
   * @returns Summary statistics for each metric type
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
      };
    });

    return result;
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
export type { PerformanceMetric, MetricSummary };
