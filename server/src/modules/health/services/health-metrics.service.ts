import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  HealthCheck, 
  HealthMetric, 
  HealthStatus,
  HealthCheckType 
} from '../types/health.types';
import { HealthMetricThresholdInput } from '../inputs/health.input';

interface MetricThreshold {
  metricName: string;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  description?: string;
}

interface AggregatedMetrics {
  totalChecks: number;
  healthyChecks: number;
  unhealthyChecks: number;
  degradedChecks: number;
  averageResponseTime: number;
  totalResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  systemAvailability: number;
  checksByType: Record<HealthCheckType, number>;
  checksByStatus: Record<HealthStatus, number>;
  timestamp: Date;
}

@Injectable()
export class HealthMetricsService {
  private readonly logger = new Logger(HealthMetricsService.name);
  private metrics = new Map<string, HealthMetric[]>();
  private thresholds = new Map<string, MetricThreshold>();
  private aggregatedMetrics: AggregatedMetrics[] = [];
  private readonly maxAggregatedMetrics = 1440; // 24 hours of minute-by-minute data

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.initializeDefaultThresholds();
  }

  private initializeDefaultThresholds(): void {
    const defaultThresholds: MetricThreshold[] = [
      {
        metricName: 'response_time',
        warningThreshold: 1000,
        criticalThreshold: 5000,
        unit: 'ms',
        description: 'Response time threshold for health checks',
      },
      {
        metricName: 'availability',
        warningThreshold: 0.95,
        criticalThreshold: 0.90,
        unit: 'percentage',
        description: 'System availability threshold',
      },
      {
        metricName: 'consecutive_failures',
        warningThreshold: 2,
        criticalThreshold: 5,
        unit: 'count',
        description: 'Consecutive failure threshold',
      },
      {
        metricName: 'memory_usage',
        warningThreshold: 0.80,
        criticalThreshold: 0.95,
        unit: 'percentage',
        description: 'Memory usage threshold',
      },
      {
        metricName: 'disk_usage',
        warningThreshold: 0.85,
        criticalThreshold: 0.95,
        unit: 'percentage',
        description: 'Disk usage threshold',
      },
    ];

    defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.metricName, threshold);
    });
  }

  async updateHealthMetrics(check: HealthCheck): Promise<void> {
    const checkMetrics = this.extractMetricsFromCheck(check);
    this.metrics.set(check.id, checkMetrics);

    // Emit metric update event
    this.eventEmitter.emit('health.metrics.updated', {
      checkId: check.id,
      metrics: checkMetrics,
    });
  }

  private extractMetricsFromCheck(check: HealthCheck): HealthMetric[] {
    const metrics: HealthMetric[] = [];

    // Response time metric
    const responseTimeThreshold = this.thresholds.get('response_time');
    if (responseTimeThreshold) {
      metrics.push({
        name: 'response_time',
        value: check.details.responseTime.toString(),
        unit: 'ms',
        threshold: responseTimeThreshold.warningThreshold,
        withinThreshold: check.details.responseTime <= responseTimeThreshold.warningThreshold,
      });
    }

    // Consecutive failures metric
    const failureThreshold = this.thresholds.get('consecutive_failures');
    if (failureThreshold) {
      metrics.push({
        name: 'consecutive_failures',
        value: check.consecutiveFailures.toString(),
        unit: 'count',
        threshold: failureThreshold.warningThreshold,
        withinThreshold: check.consecutiveFailures <= failureThreshold.warningThreshold,
      });
    }

    // Status metric
    metrics.push({
      name: 'status',
      value: check.status,
      unit: 'enum',
      withinThreshold: check.status === HealthStatus.HEALTHY,
    });

    // Add check-specific metrics from details
    if (check.details.metrics) {
      metrics.push(...check.details.metrics);
    }

    return metrics;
  }

  async getMetrics(checkId?: string): Promise<HealthMetric[]> {
    if (checkId) {
      return this.metrics.get(checkId) || [];
    }

    // Return all metrics
    const allMetrics: HealthMetric[] = [];
    for (const checkMetrics of this.metrics.values()) {
      allMetrics.push(...checkMetrics);
    }
    return allMetrics;
  }

  async getMetricsByName(metricName: string): Promise<HealthMetric[]> {
    const matchingMetrics: HealthMetric[] = [];
    
    for (const checkMetrics of this.metrics.values()) {
      const metric = checkMetrics.find(m => m.name === metricName);
      if (metric) {
        matchingMetrics.push(metric);
      }
    }
    
    return matchingMetrics;
  }

  async setMetricThreshold(input: HealthMetricThresholdInput): Promise<MetricThreshold> {
    const threshold: MetricThreshold = {
      metricName: input.metricName,
      warningThreshold: input.warningThreshold,
      criticalThreshold: input.criticalThreshold,
      unit: input.unit,
      description: input.description,
    };

    this.thresholds.set(input.metricName, threshold);
    
    this.eventEmitter.emit('health.metric.threshold.updated', { threshold });
    this.logger.log(`Metric threshold updated: ${input.metricName}`);
    
    return threshold;
  }

  async getMetricThresholds(): Promise<MetricThreshold[]> {
    return Array.from(this.thresholds.values());
  }

  async getMetricThreshold(metricName: string): Promise<MetricThreshold | null> {
    return this.thresholds.get(metricName) || null;
  }

  async removeMetricThreshold(metricName: string): Promise<boolean> {
    const removed = this.thresholds.delete(metricName);
    if (removed) {
      this.eventEmitter.emit('health.metric.threshold.removed', { metricName });
      this.logger.log(`Metric threshold removed: ${metricName}`);
    }
    return removed;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async aggregateMetrics(): Promise<void> {
    const allChecks = Array.from(this.metrics.keys());
    if (allChecks.length === 0) return;

    const checksByType: Record<HealthCheckType, number> = {} as any;
    const checksByStatus: Record<HealthStatus, number> = {} as any;
    
    let totalChecks = 0;
    let healthyChecks = 0;
    let unhealthyChecks = 0;
    let degradedChecks = 0;
    let totalResponseTime = 0;
    let minResponseTime = Infinity;
    let maxResponseTime = 0;

    // Initialize counters
    Object.values(HealthCheckType).forEach(type => {
      checksByType[type] = 0;
    });
    Object.values(HealthStatus).forEach(status => {
      checksByStatus[status] = 0;
    });

    for (const checkId of allChecks) {
      const checkMetrics = this.metrics.get(checkId) || [];
      
      // Find status and response time metrics
      const statusMetric = checkMetrics.find(m => m.name === 'status');
      const responseTimeMetric = checkMetrics.find(m => m.name === 'response_time');
      
      if (statusMetric) {
        const status = statusMetric.value as HealthStatus;
        checksByStatus[status]++;
        
        switch (status) {
          case HealthStatus.HEALTHY:
            healthyChecks++;
            break;
          case HealthStatus.UNHEALTHY:
            unhealthyChecks++;
            break;
          case HealthStatus.DEGRADED:
            degradedChecks++;
            break;
        }
      }
      
      if (responseTimeMetric) {
        const responseTime = parseFloat(responseTimeMetric.value);
        totalResponseTime += responseTime;
        minResponseTime = Math.min(minResponseTime, responseTime);
        maxResponseTime = Math.max(maxResponseTime, responseTime);
      }
      
      totalChecks++;
    }

    const aggregated: AggregatedMetrics = {
      totalChecks,
      healthyChecks,
      unhealthyChecks,
      degradedChecks,
      averageResponseTime: totalChecks > 0 ? totalResponseTime / totalChecks : 0,
      totalResponseTime,
      minResponseTime: minResponseTime === Infinity ? 0 : minResponseTime,
      maxResponseTime,
      systemAvailability: totalChecks > 0 ? healthyChecks / totalChecks : 0,
      checksByType,
      checksByStatus,
      timestamp: new Date(),
    };

    this.aggregatedMetrics.unshift(aggregated);
    
    // Keep only the last N aggregated metrics
    if (this.aggregatedMetrics.length > this.maxAggregatedMetrics) {
      this.aggregatedMetrics = this.aggregatedMetrics.slice(0, this.maxAggregatedMetrics);
    }

    this.eventEmitter.emit('health.metrics.aggregated', { metrics: aggregated });
  }

  async getAggregatedMetrics(hours: number = 1): Promise<AggregatedMetrics[]> {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.aggregatedMetrics.filter(m => m.timestamp.getTime() >= cutoffTime);
  }

  async getCurrentAggregatedMetrics(): Promise<AggregatedMetrics | null> {
    return this.aggregatedMetrics[0] || null;
  }

  async getMetricTimeSeries(
    metricName: string, 
    hours: number = 24
  ): Promise<Array<{ timestamp: Date; value: number; checkId: string }>> {
    const timeSeries: Array<{ timestamp: Date; value: number; checkId: string }> = [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);

    for (const [checkId, checkMetrics] of this.metrics.entries()) {
      const metric = checkMetrics.find(m => m.name === metricName);
      if (metric) {
        const value = parseFloat(metric.value);
        if (!isNaN(value)) {
          timeSeries.push({
            timestamp: new Date(), // In a real implementation, you'd track timestamps
            value,
            checkId,
          });
        }
      }
    }

    return timeSeries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getMetricStatistics(metricName: string): Promise<{
    count: number;
    min: number;
    max: number;
    average: number;
    median: number;
    standardDeviation: number;
  }> {
    const values: number[] = [];
    
    for (const checkMetrics of this.metrics.values()) {
      const metric = checkMetrics.find(m => m.name === metricName);
      if (metric) {
        const value = parseFloat(metric.value);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }

    if (values.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        average: 0,
        median: 0,
        standardDeviation: 0,
      };
    }

    values.sort((a, b) => a - b);
    
    const count = values.length;
    const min = values[0];
    const max = values[count - 1];
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / count;
    
    const median = count % 2 === 0
      ? (values[count / 2 - 1] + values[count / 2]) / 2
      : values[Math.floor(count / 2)];
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    return {
      count,
      min,
      max,
      average,
      median,
      standardDeviation,
    };
  }

  async exportMetrics(format: 'json' | 'csv' = 'json'): Promise<string> {
    const allMetrics: Array<HealthMetric & { checkId: string }> = [];
    
    for (const [checkId, checkMetrics] of this.metrics.entries()) {
      checkMetrics.forEach(metric => {
        allMetrics.push({ ...metric, checkId });
      });
    }

    if (format === 'csv') {
      const csvHeader = 'checkId,name,value,unit,threshold,withinThreshold\n';
      const csvRows = allMetrics.map(m => 
        `${m.checkId},${m.name},${m.value},${m.unit},${m.threshold || ''},${m.withinThreshold}`
      ).join('\n');
      return csvHeader + csvRows;
    }

    return JSON.stringify(allMetrics, null, 2);
  }

  async clearMetrics(checkId?: string): Promise<void> {
    if (checkId) {
      this.metrics.delete(checkId);
      this.logger.log(`Cleared metrics for check: ${checkId}`);
    } else {
      this.metrics.clear();
      this.aggregatedMetrics.length = 0;
      this.logger.log('Cleared all metrics');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldAggregatedMetrics(): Promise<void> {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    const originalLength = this.aggregatedMetrics.length;
    
    this.aggregatedMetrics = this.aggregatedMetrics.filter(m => 
      m.timestamp.getTime() >= cutoffTime
    );

    const cleaned = originalLength - this.aggregatedMetrics.length;
    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} old aggregated metrics`);
    }
  }
}