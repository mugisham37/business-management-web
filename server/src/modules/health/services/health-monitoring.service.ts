import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  HealthCheck, 
  HealthStatus, 
  HealthTrend, 
  HealthHistory,
  HealthSeverity 
} from '../types/health.types';
import { HealthHistoryService } from './health-history.service';
import { HealthAlertService } from './health-alert.service';
import { HealthMetricsService } from './health-metrics.service';

interface HealthMonitoringConfig {
  trendAnalysisEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  predictiveAnalysisEnabled: boolean;
  alertThresholds: {
    consecutiveFailures: number;
    responseTimeThreshold: number;
    availabilityThreshold: number;
  };
}

@Injectable()
export class HealthMonitoringService {
  private readonly logger = new Logger(HealthMonitoringService.name);
  private monitoringConfig: HealthMonitoringConfig = {
    trendAnalysisEnabled: true,
    anomalyDetectionEnabled: true,
    predictiveAnalysisEnabled: true,
    alertThresholds: {
      consecutiveFailures: 3,
      responseTimeThreshold: 5000, // 5 seconds
      availabilityThreshold: 0.95, // 95%
    },
  };

  private healthTrends = new Map<string, HealthTrend>();
  private anomalyBaselines = new Map<string, number[]>();

  constructor(
    private readonly historyService: HealthHistoryService,
    private readonly alertService: HealthAlertService,
    private readonly metricsService: HealthMetricsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('health.check.completed')
  async handleHealthCheckCompleted(payload: { check: HealthCheck; previousStatus?: HealthStatus }): Promise<void> {
    const { check, previousStatus } = payload;
    
    // Update trends
    await this.updateHealthTrend(check);
    
    // Perform anomaly detection
    if (this.monitoringConfig.anomalyDetectionEnabled) {
      await this.detectAnomalies(check);
    }
    
    // Check for threshold violations
    await this.checkThresholdViolations(check);
    
    // Status change detection
    if (previousStatus && previousStatus !== check.status) {
      await this.handleStatusChange(check, previousStatus);
    }
    
    // Update metrics
    await this.metricsService.updateHealthMetrics(check);
  }

  private async updateHealthTrend(check: HealthCheck): Promise<void> {
    let trend = this.healthTrends.get(check.id);
    
    if (!trend) {
      const history = await this.historyService.getHealthHistory({
        checkId: check.id,
        limit: 100,
      });
      
      trend = {
        checkId: check.id,
        name: check.name,
        history: history,
        availabilityPercentage: this.calculateAvailability(history),
        averageResponseTime: this.calculateAverageResponseTime(history),
        totalChecks: history.length,
        failureCount: history.filter(h => h.status === HealthStatus.UNHEALTHY).length,
      };
    }

    // Add current check to history
    const currentHistory: HealthHistory = {
      checkId: check.id,
      status: check.status,
      timestamp: check.lastChecked,
      responseTime: check.details.responseTime,
      error: check.details.error || '',
    };

    trend.history.unshift(currentHistory);
    
    // Keep only last 100 entries
    if (trend.history.length > 100) {
      trend.history = trend.history.slice(0, 100);
    }

    // Recalculate metrics
    trend.availabilityPercentage = this.calculateAvailability(trend.history);
    trend.averageResponseTime = this.calculateAverageResponseTime(trend.history);
    trend.totalChecks = trend.history.length;
    trend.failureCount = trend.history.filter(h => h.status === HealthStatus.UNHEALTHY).length;

    this.healthTrends.set(check.id, trend);
    
    this.eventEmitter.emit('health.trend.updated', { trend });
  }

  private async detectAnomalies(check: HealthCheck): Promise<void> {
    const baseline = this.anomalyBaselines.get(check.id) || [];
    const currentResponseTime = check.details.responseTime;

    if (baseline.length >= 10) {
      const mean = baseline.reduce((sum, val) => sum + val, 0) / baseline.length;
      const variance = baseline.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / baseline.length;
      const stdDev = Math.sqrt(variance);
      
      // Detect if current response time is more than 2 standard deviations from mean
      const zScore = Math.abs(currentResponseTime - mean) / stdDev;
      
      if (zScore > 2) {
        await this.alertService.createAlert({
          checkId: check.id,
          severity: zScore > 3 ? HealthSeverity.HIGH : HealthSeverity.MEDIUM,
          message: `Anomalous response time detected: ${currentResponseTime}ms (z-score: ${zScore.toFixed(2)})`,
          isActive: true,
        });
        
        this.eventEmitter.emit('health.anomaly.detected', {
          check,
          zScore,
          mean,
          stdDev,
          currentValue: currentResponseTime,
        });
      }
    }

    // Update baseline (keep last 50 values)
    baseline.push(currentResponseTime);
    if (baseline.length > 50) {
      baseline.shift();
    }
    this.anomalyBaselines.set(check.id, baseline);
  }

  private async checkThresholdViolations(check: HealthCheck): Promise<void> {
    const { alertThresholds } = this.monitoringConfig;
    
    // Check consecutive failures
    if (check.consecutiveFailures >= alertThresholds.consecutiveFailures) {
      await this.alertService.createAlert({
        checkId: check.id,
        severity: HealthSeverity.HIGH,
        message: `Health check has failed ${check.consecutiveFailures} consecutive times`,
        isActive: true,
      });
    }
    
    // Check response time threshold
    if (check.details.responseTime > alertThresholds.responseTimeThreshold) {
      await this.alertService.createAlert({
        checkId: check.id,
        severity: HealthSeverity.MEDIUM,
        message: `Response time exceeded threshold: ${check.details.responseTime}ms > ${alertThresholds.responseTimeThreshold}ms`,
        isActive: true,
      });
    }
    
    // Check availability threshold
    const trend = this.healthTrends.get(check.id);
    if (trend && trend.availabilityPercentage < alertThresholds.availabilityThreshold) {
      await this.alertService.createAlert({
        checkId: check.id,
        severity: HealthSeverity.HIGH,
        message: `Availability below threshold: ${(trend.availabilityPercentage * 100).toFixed(2)}% < ${(alertThresholds.availabilityThreshold * 100)}%`,
        isActive: true,
      });
    }
  }

  private async handleStatusChange(check: HealthCheck, previousStatus: HealthStatus): Promise<void> {
    const severity = this.getStatusChangeSeverity(previousStatus, check.status);
    
    await this.alertService.createAlert({
      checkId: check.id,
      severity,
      message: `Health status changed from ${previousStatus} to ${check.status}`,
      isActive: check.status !== HealthStatus.HEALTHY,
    });
    
    this.eventEmitter.emit('health.status.changed', {
      check,
      previousStatus,
      currentStatus: check.status,
    });
  }

  private getStatusChangeSeverity(from: HealthStatus, to: HealthStatus): HealthSeverity {
    if (to === HealthStatus.UNHEALTHY) {
      return HealthSeverity.HIGH;
    }
    if (to === HealthStatus.DEGRADED) {
      return HealthSeverity.MEDIUM;
    }
    if (from === HealthStatus.UNHEALTHY && to === HealthStatus.HEALTHY) {
      return HealthSeverity.INFO;
    }
    return HealthSeverity.LOW;
  }

  async getHealthTrends(checkIds?: string[]): Promise<HealthTrend[]> {
    const trends = Array.from(this.healthTrends.values());
    
    if (checkIds?.length) {
      return trends.filter(trend => checkIds.includes(trend.checkId));
    }
    
    return trends;
  }

  async getHealthTrend(checkId: string): Promise<HealthTrend | null> {
    return this.healthTrends.get(checkId) || null;
  }

  private calculateAvailability(history: HealthHistory[]): number {
    if (history.length === 0) return 1;
    
    const healthyCount = history.filter(h => h.status === HealthStatus.HEALTHY).length;
    return healthyCount / history.length;
  }

  private calculateAverageResponseTime(history: HealthHistory[]): number {
    if (history.length === 0) return 0;
    
    const totalResponseTime = history.reduce((sum, h) => sum + h.responseTime, 0);
    return totalResponseTime / history.length;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async performTrendAnalysis(): Promise<void> {
    if (!this.monitoringConfig.trendAnalysisEnabled) return;

    const trends = Array.from(this.healthTrends.values());
    
    for (const trend of trends) {
      await this.analyzeTrendPatterns(trend);
    }
  }

  private async analyzeTrendPatterns(trend: HealthTrend): Promise<void> {
    const recentHistory = trend.history.slice(0, 20); // Last 20 checks
    
    if (recentHistory.length < 10) return;
    
    // Analyze degradation patterns
    const degradationPattern = this.detectDegradationPattern(recentHistory);
    if (degradationPattern.isDetected) {
      await this.alertService.createAlert({
        checkId: trend.checkId,
        severity: HealthSeverity.MEDIUM,
        message: `Degradation pattern detected: ${degradationPattern.description}`,
        isActive: true,
      });
    }
    
    // Analyze response time trends
    const responseTimeTrend = this.analyzeResponseTimeTrend(recentHistory);
    if (responseTimeTrend.isIncreasing && responseTimeTrend.slope > 100) { // 100ms increase per check
      await this.alertService.createAlert({
        checkId: trend.checkId,
        severity: HealthSeverity.MEDIUM,
        message: `Response time trend increasing: ${responseTimeTrend.slope.toFixed(2)}ms per check`,
        isActive: true,
      });
    }
  }

  private detectDegradationPattern(history: HealthHistory[]): { isDetected: boolean; description: string } {
    const failureRate = history.filter(h => h.status === HealthStatus.UNHEALTHY).length / history.length;
    const degradedRate = history.filter(h => h.status === HealthStatus.DEGRADED).length / history.length;
    
    if (failureRate > 0.3) {
      return {
        isDetected: true,
        description: `High failure rate: ${(failureRate * 100).toFixed(1)}%`,
      };
    }
    
    if (degradedRate > 0.5) {
      return {
        isDetected: true,
        description: `High degradation rate: ${(degradedRate * 100).toFixed(1)}%`,
      };
    }
    
    return { isDetected: false, description: '' };
  }

  private analyzeResponseTimeTrend(history: HealthHistory[]): { isIncreasing: boolean; slope: number } {
    if (history.length < 5) return { isIncreasing: false, slope: 0 };
    
    const responseTimes = history.map(h => h.responseTime ?? 0);
    const n = responseTimes.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    // Calculate linear regression slope
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = responseTimes.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * (responseTimes[i] ?? 0), 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const denominator = n * sumXX - sumX * sumX;
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
    
    return {
      isIncreasing: slope > 0,
      slope: slope || 0,
    };
  }

  async updateMonitoringConfig(config: Partial<HealthMonitoringConfig>): Promise<HealthMonitoringConfig> {
    this.monitoringConfig = { ...this.monitoringConfig, ...config };
    
    this.eventEmitter.emit('health.monitoring.config.updated', { config: this.monitoringConfig });
    this.logger.log('Health monitoring configuration updated');
    
    return this.monitoringConfig;
  }

  getMonitoringConfig(): HealthMonitoringConfig {
    return { ...this.monitoringConfig };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOldData(): Promise<void> {
    // Clean up old trend data
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    
    for (const [checkId, trend] of this.healthTrends.entries()) {
      trend.history = trend.history.filter(h => h.timestamp.getTime() > cutoffTime);
      
      if (trend.history.length === 0) {
        this.healthTrends.delete(checkId);
      } else {
        // Recalculate metrics after cleanup
        trend.availabilityPercentage = this.calculateAvailability(trend.history);
        trend.averageResponseTime = this.calculateAverageResponseTime(trend.history);
        trend.totalChecks = trend.history.length;
        trend.failureCount = trend.history.filter(h => h.status === HealthStatus.UNHEALTHY).length;
      }
    }
    
    // Clean up anomaly baselines
    for (const [checkId, baseline] of this.anomalyBaselines.entries()) {
      if (!this.healthTrends.has(checkId)) {
        this.anomalyBaselines.delete(checkId);
      }
    }
    
    this.logger.log('Health monitoring data cleanup completed');
  }
}