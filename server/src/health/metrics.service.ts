import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface MetricData {
  requestCount: number;
  errorCount: number;
  authFailureCount: number;
  cacheHits: number;
  cacheMisses: number;
  responseTimes: number[];
  activeConnections: number;
}

@Injectable()
export class MetricsService {
  private metrics: MetricData = {
    requestCount: 0,
    errorCount: 0,
    authFailureCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    responseTimes: [],
    activeConnections: 0,
  };

  constructor(private readonly prisma: PrismaService) {}

  // Increment request count
  incrementRequestCount(): void {
    this.metrics.requestCount++;
  }

  // Increment error count
  incrementErrorCount(): void {
    this.metrics.errorCount++;
  }

  // Increment authentication failure count
  incrementAuthFailureCount(): void {
    this.metrics.authFailureCount++;
  }

  // Increment cache hits
  incrementCacheHits(): void {
    this.metrics.cacheHits++;
  }

  // Increment cache misses
  incrementCacheMisses(): void {
    this.metrics.cacheMisses++;
  }

  // Record response time
  recordResponseTime(timeMs: number): void {
    this.metrics.responseTimes.push(timeMs);
    // Keep only last 1000 response times to prevent memory issues
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  // Set active connections
  setActiveConnections(count: number): void {
    this.metrics.activeConnections = count;
  }

  // Get average response time
  getAverageResponseTime(): number {
    if (this.metrics.responseTimes.length === 0) return 0;
    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    return sum / this.metrics.responseTimes.length;
  }

  // Get error rate (percentage)
  getErrorRate(): number {
    if (this.metrics.requestCount === 0) return 0;
    return (this.metrics.errorCount / this.metrics.requestCount) * 100;
  }

  // Get cache hit rate (percentage)
  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total === 0) return 0;
    return (this.metrics.cacheHits / total) * 100;
  }

  // Get database connection pool statistics
  async getDatabasePoolStats(): Promise<any> {
    try {
      // Prisma doesn't expose pool stats directly, but we can check connection status
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'connected',
        // Note: Actual pool stats would require custom implementation or database-specific queries
        message: 'Database connection pool is operational',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generate Prometheus-compatible metrics
  async getPrometheusMetrics(): Promise<string> {
    const dbPoolStats = await this.getDatabasePoolStats();
    const avgResponseTime = this.getAverageResponseTime();
    const errorRate = this.getErrorRate();
    const cacheHitRate = this.getCacheHitRate();

    const metrics = [
      '# HELP http_requests_total Total number of HTTP requests',
      '# TYPE http_requests_total counter',
      `http_requests_total ${this.metrics.requestCount}`,
      '',
      '# HELP http_errors_total Total number of HTTP errors',
      '# TYPE http_errors_total counter',
      `http_errors_total ${this.metrics.errorCount}`,
      '',
      '# HELP http_request_duration_ms Average HTTP request duration in milliseconds',
      '# TYPE http_request_duration_ms gauge',
      `http_request_duration_ms ${avgResponseTime.toFixed(2)}`,
      '',
      '# HELP http_error_rate_percent HTTP error rate as percentage',
      '# TYPE http_error_rate_percent gauge',
      `http_error_rate_percent ${errorRate.toFixed(2)}`,
      '',
      '# HELP http_active_connections Number of active HTTP connections',
      '# TYPE http_active_connections gauge',
      `http_active_connections ${this.metrics.activeConnections}`,
      '',
      '# HELP auth_failures_total Total number of authentication failures',
      '# TYPE auth_failures_total counter',
      `auth_failures_total ${this.metrics.authFailureCount}`,
      '',
      '# HELP cache_hits_total Total number of cache hits',
      '# TYPE cache_hits_total counter',
      `cache_hits_total ${this.metrics.cacheHits}`,
      '',
      '# HELP cache_misses_total Total number of cache misses',
      '# TYPE cache_misses_total counter',
      `cache_misses_total ${this.metrics.cacheMisses}`,
      '',
      '# HELP cache_hit_rate_percent Cache hit rate as percentage',
      '# TYPE cache_hit_rate_percent gauge',
      `cache_hit_rate_percent ${cacheHitRate.toFixed(2)}`,
      '',
      '# HELP database_pool_status Database connection pool status (1=connected, 0=error)',
      '# TYPE database_pool_status gauge',
      `database_pool_status ${dbPoolStats.status === 'connected' ? 1 : 0}`,
      '',
    ];

    return metrics.join('\n');
  }

  // Get metrics as JSON
  async getMetricsJson(): Promise<any> {
    const dbPoolStats = await this.getDatabasePoolStats();

    return {
      requests: {
        total: this.metrics.requestCount,
        errors: this.metrics.errorCount,
        errorRate: `${this.getErrorRate().toFixed(2)}%`,
      },
      performance: {
        averageResponseTime: `${this.getAverageResponseTime().toFixed(2)}ms`,
        activeConnections: this.metrics.activeConnections,
      },
      authentication: {
        failures: this.metrics.authFailureCount,
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: `${this.getCacheHitRate().toFixed(2)}%`,
      },
      database: {
        poolStatus: dbPoolStats.status,
        poolMessage: dbPoolStats.message,
      },
    };
  }

  // Reset metrics (useful for testing)
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      authFailureCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      responseTimes: [],
      activeConnections: 0,
    };
  }
}
