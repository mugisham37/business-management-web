import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { 
  QueueAnalytics, 
  QueueHourlyStats,
  QueueType 
} from '../types/queue.types';
import { QueueAnalyticsInput } from '../inputs/queue.input';
import { CustomLoggerService } from '../../logger/logger.service';
import { CacheService } from '../../cache/cache.service';
import { DatabaseService } from '../../database/database.service';

interface QueueMetrics {
  queueName: string;
  timestamp: Date;
  jobsProcessed: number;
  jobsSucceeded: number;
  jobsFailed: number;
  averageProcessingTime: number;
  peakConcurrency: number;
  throughputPerHour: number;
}

@Injectable()
export class QueueAnalyticsService {
  private readonly logger = new Logger(QueueAnalyticsService.name);
  private readonly metricsCache = new Map<string, QueueMetrics[]>();

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('reports') private readonly reportsQueue: Queue,
    @InjectQueue('sync') private readonly syncQueue: Queue,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
    private readonly customLogger: CustomLoggerService,
    private readonly cacheService?: CacheService,
    private readonly databaseService?: DatabaseService,
  ) {
    this.customLogger.setContext('QueueAnalyticsService');
    this.initializeMetricsCollection();
  }

  async getQueueAnalytics(input: QueueAnalyticsInput, tenantId?: string): Promise<QueueAnalytics[]> {
    try {
      const queueTypes = input.queueTypes || Object.values(QueueType);
      const analytics: QueueAnalytics[] = [];

      for (const queueType of queueTypes) {
        try {
          const queueAnalytics = await this.getQueueAnalyticsForType(
            queueType,
            input.dateRange,
            input.granularity,
            tenantId
          );
          analytics.push(queueAnalytics);
        } catch (error) {
          this.customLogger.warn(`Failed to get analytics for queue ${queueType}`, {
            error: error.message,
            queueType,
            tenantId,
          });
        }
      }

      this.customLogger.log('Queue analytics retrieved successfully', {
        queueCount: analytics.length,
        dateRange: input.dateRange,
        granularity: input.granularity,
        tenantId,
      });

      return analytics;
    } catch (error) {
      this.customLogger.error('Failed to get queue analytics', error.stack, { input, tenantId });
      throw error;
    }
  }

  async getQueueAnalyticsForType(
    queueType: QueueType,
    dateRange: any,
    granularity: string = 'hour',
    tenantId?: string
  ): Promise<QueueAnalytics> {
    const queue = this.getQueueByType(queueType);
    const cacheKey = this.generateAnalyticsCacheKey(queueType, dateRange, granularity, tenantId);

    // Try to get from cache first
    if (this.cacheService) {
      try {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          this.customLogger.debug('Analytics cache hit', { cacheKey, queueType });
          return cached;
        }
      } catch (error) {
        this.customLogger.warn('Failed to get analytics from cache', { error: error.message, cacheKey });
      }
    }

    // Calculate analytics from queue data and metrics
    const analytics = await this.calculateQueueAnalytics(queue, queueType, dateRange, granularity, tenantId);

    // Cache the result
    if (this.cacheService) {
      try {
        await this.cacheService.set(cacheKey, analytics, 300); // Cache for 5 minutes
      } catch (error) {
        this.customLogger.warn('Failed to cache analytics', { error: error.message, cacheKey });
      }
    }

    return analytics;
  }

  async recordQueueMetrics(queueType: QueueType, metrics: Partial<QueueMetrics>): Promise<void> {
    try {
      const queueName = queueType.toString();
      const timestamp = new Date();

      const queueMetrics: QueueMetrics = {
        queueName,
        timestamp,
        jobsProcessed: metrics.jobsProcessed || 0,
        jobsSucceeded: metrics.jobsSucceeded || 0,
        jobsFailed: metrics.jobsFailed || 0,
        averageProcessingTime: metrics.averageProcessingTime || 0,
        peakConcurrency: metrics.peakConcurrency || 0,
        throughputPerHour: metrics.throughputPerHour || 0,
      };

      // Store in memory cache
      if (!this.metricsCache.has(queueName)) {
        this.metricsCache.set(queueName, []);
      }
      
      const queueMetricsArray = this.metricsCache.get(queueName)!;
      queueMetricsArray.push(queueMetrics);

      // Keep only last 24 hours of metrics in memory
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metricsCache.set(
        queueName,
        queueMetricsArray.filter(m => m.timestamp > cutoffTime)
      );

      // Store in database if available
      if (this.databaseService) {
        await this.persistMetricsToDatabase(queueMetrics);
      }

      // Store in Redis cache if available
      if (this.cacheService) {
        const metricsKey = `queue:metrics:${queueName}:${timestamp.getTime()}`;
        await this.cacheService.set(metricsKey, queueMetrics, 86400); // 24 hours
      }

      this.customLogger.debug('Queue metrics recorded', {
        queueName,
        metrics: queueMetrics,
      });
    } catch (error) {
      this.customLogger.error('Failed to record queue metrics', error.stack, {
        queueType,
        metrics,
      });
    }
  }

  async getRealtimeMetrics(queueType: QueueType, tenantId?: string): Promise<QueueMetrics | null> {
    try {
      const queue = this.getQueueByType(queueType);
      const queueName = queueType.toString();

      // Get current queue statistics
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      // Calculate real-time metrics
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get recent completed jobs for throughput calculation
      const recentCompleted = completed.filter(job => 
        new Date(job.finishedOn || job.timestamp) > oneHourAgo &&
        (!tenantId || job.data.tenantId === tenantId)
      );

      const recentFailed = failed.filter(job => 
        new Date(job.finishedOn || job.timestamp) > oneHourAgo &&
        (!tenantId || job.data.tenantId === tenantId)
      );

      // Calculate processing times
      const processingTimes = recentCompleted
        .filter(job => job.processedOn && job.finishedOn)
        .map(job => job.finishedOn! - job.processedOn!);

      const averageProcessingTime = processingTimes.length > 0
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
        : 0;

      const metrics: QueueMetrics = {
        queueName,
        timestamp: now,
        jobsProcessed: recentCompleted.length + recentFailed.length,
        jobsSucceeded: recentCompleted.length,
        jobsFailed: recentFailed.length,
        averageProcessingTime,
        peakConcurrency: active.length,
        throughputPerHour: recentCompleted.length + recentFailed.length,
      };

      return metrics;
    } catch (error) {
      this.customLogger.error('Failed to get realtime metrics', error.stack, {
        queueType,
        tenantId,
      });
      return null;
    }
  }

  async getHistoricalTrends(
    queueType: QueueType,
    days: number = 7,
    tenantId?: string
  ): Promise<QueueHourlyStats[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const trends = await this.calculateHourlyStats(
        queueType,
        { from: startDate, to: endDate },
        tenantId
      );

      this.customLogger.log('Historical trends calculated', {
        queueType,
        days,
        trendsCount: trends.length,
        tenantId,
      });

      return trends;
    } catch (error) {
      this.customLogger.error('Failed to get historical trends', error.stack, {
        queueType,
        days,
        tenantId,
      });
      throw error;
    }
  }

  async getPerformanceInsights(queueType: QueueType, tenantId?: string): Promise<any> {
    try {
      const realtimeMetrics = await this.getRealtimeMetrics(queueType, tenantId);
      const historicalTrends = await this.getHistoricalTrends(queueType, 7, tenantId);

      if (!realtimeMetrics) {
        return null;
      }

      // Calculate performance insights
      const avgThroughput = historicalTrends.length > 0
        ? historicalTrends.reduce((sum, stat) => sum + stat.jobsProcessed, 0) / historicalTrends.length
        : 0;

      const avgProcessingTime = historicalTrends.length > 0
        ? historicalTrends.reduce((sum, stat) => sum + stat.averageProcessingTime, 0) / historicalTrends.length
        : 0;

      const avgSuccessRate = historicalTrends.length > 0
        ? historicalTrends.reduce((sum, stat) => {
            const total = stat.jobsSucceeded + stat.jobsFailed;
            return sum + (total > 0 ? stat.jobsSucceeded / total : 1);
          }, 0) / historicalTrends.length
        : 1;

      const insights = {
        currentThroughput: realtimeMetrics.throughputPerHour,
        averageThroughput: avgThroughput,
        throughputTrend: realtimeMetrics.throughputPerHour > avgThroughput ? 'increasing' : 'decreasing',
        
        currentProcessingTime: realtimeMetrics.averageProcessingTime,
        averageProcessingTime: avgProcessingTime,
        processingTimeTrend: realtimeMetrics.averageProcessingTime > avgProcessingTime ? 'slower' : 'faster',
        
        currentSuccessRate: realtimeMetrics.jobsProcessed > 0 
          ? realtimeMetrics.jobsSucceeded / realtimeMetrics.jobsProcessed 
          : 1,
        averageSuccessRate: avgSuccessRate,
        
        peakConcurrency: Math.max(...historicalTrends.map(t => t.peakConcurrency), realtimeMetrics.peakConcurrency),
        
        recommendations: this.generateRecommendations(realtimeMetrics, historicalTrends),
      };

      return insights;
    } catch (error) {
      this.customLogger.error('Failed to get performance insights', error.stack, {
        queueType,
        tenantId,
      });
      throw error;
    }
  }

  private async calculateQueueAnalytics(
    queue: Queue,
    queueType: QueueType,
    dateRange: any,
    granularity: string,
    tenantId?: string
  ): Promise<QueueAnalytics> {
    const queueName = queueType.toString();
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    // Get jobs within date range
    const [completed, failed] = await Promise.all([
      queue.getCompleted(),
      queue.getFailed(),
    ]);

    // Filter jobs by date range and tenant
    const filteredCompleted = completed.filter(job => {
      const jobDate = new Date(job.finishedOn || job.timestamp);
      const inDateRange = jobDate >= startDate && jobDate <= endDate;
      const inTenant = !tenantId || job.data.tenantId === tenantId;
      return inDateRange && inTenant;
    });

    const filteredFailed = failed.filter(job => {
      const jobDate = new Date(job.finishedOn || job.timestamp);
      const inDateRange = jobDate >= startDate && jobDate <= endDate;
      const inTenant = !tenantId || job.data.tenantId === tenantId;
      return inDateRange && inTenant;
    });

    // Calculate overall metrics
    const totalJobsProcessed = filteredCompleted.length + filteredFailed.length;
    const successRate = totalJobsProcessed > 0 ? filteredCompleted.length / totalJobsProcessed : 0;

    // Calculate processing times
    const processingTimes = filteredCompleted
      .filter(job => job.processedOn && job.finishedOn)
      .map(job => job.finishedOn! - job.processedOn!);

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    // Calculate throughput
    const periodHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const throughputPerHour = periodHours > 0 ? totalJobsProcessed / periodHours : 0;

    // Calculate peak concurrency (simplified - would need real-time tracking)
    const peakConcurrency = Math.max(
      ...filteredCompleted.map(() => 1), // Simplified calculation
      ...filteredFailed.map(() => 1),
      0
    );

    // Generate hourly stats
    const hourlyStats = await this.calculateHourlyStats(queueType, dateRange, tenantId);

    return {
      queueName,
      queueType,
      totalJobsProcessed,
      averageProcessingTime,
      successRate,
      throughputPerHour,
      peakConcurrency,
      hourlyStats,
      periodStart: startDate,
      periodEnd: endDate,
    };
  }

  private async calculateHourlyStats(
    queueType: QueueType,
    dateRange: any,
    tenantId?: string
  ): Promise<QueueHourlyStats[]> {
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    const hourlyStats: QueueHourlyStats[] = [];

    // Generate hourly buckets
    const currentHour = new Date(startDate);
    currentHour.setMinutes(0, 0, 0);

    while (currentHour < endDate) {
      const nextHour = new Date(currentHour.getTime() + 60 * 60 * 1000);
      
      // Get metrics from cache or calculate
      const stats = await this.getHourlyStatsFromCache(queueType, currentHour, tenantId) ||
                   await this.calculateHourlyStatsForPeriod(queueType, currentHour, nextHour, tenantId);

      hourlyStats.push(stats);
      currentHour.setTime(nextHour.getTime());
    }

    return hourlyStats;
  }

  private async getHourlyStatsFromCache(
    queueType: QueueType,
    hour: Date,
    tenantId?: string
  ): Promise<QueueHourlyStats | null> {
    if (!this.cacheService) {
      return null;
    }

    try {
      const cacheKey = `queue:hourly:${queueType}:${hour.getTime()}:${tenantId || 'all'}`;
      return await this.cacheService.get(cacheKey);
    } catch (error) {
      return null;
    }
  }

  private async calculateHourlyStatsForPeriod(
    queueType: QueueType,
    startHour: Date,
    endHour: Date,
    tenantId?: string
  ): Promise<QueueHourlyStats> {
    // Get cached metrics for this period
    const queueName = queueType.toString();
    const cachedMetrics = this.metricsCache.get(queueName) || [];
    
    const periodMetrics = cachedMetrics.filter(m => 
      m.timestamp >= startHour && 
      m.timestamp < endHour
    );

    // Calculate aggregated stats
    const jobsProcessed = periodMetrics.reduce((sum, m) => sum + m.jobsProcessed, 0);
    const jobsSucceeded = periodMetrics.reduce((sum, m) => sum + m.jobsSucceeded, 0);
    const jobsFailed = periodMetrics.reduce((sum, m) => sum + m.jobsFailed, 0);
    
    const avgProcessingTime = periodMetrics.length > 0
      ? periodMetrics.reduce((sum, m) => sum + m.averageProcessingTime, 0) / periodMetrics.length
      : 0;

    const peakConcurrency = Math.max(...periodMetrics.map(m => m.peakConcurrency), 0);

    const stats: QueueHourlyStats = {
      hour: startHour,
      jobsProcessed,
      jobsSucceeded,
      jobsFailed,
      averageProcessingTime: avgProcessingTime,
      peakConcurrency,
    };

    // Cache the calculated stats
    if (this.cacheService) {
      try {
        const cacheKey = `queue:hourly:${queueType}:${startHour.getTime()}:${tenantId || 'all'}`;
        await this.cacheService.set(cacheKey, stats, 3600); // Cache for 1 hour
      } catch (error) {
        this.customLogger.warn('Failed to cache hourly stats', { error: error.message });
      }
    }

    return stats;
  }

  private generateRecommendations(
    currentMetrics: QueueMetrics,
    historicalTrends: QueueHourlyStats[]
  ): string[] {
    const recommendations: string[] = [];

    // Throughput recommendations
    const avgThroughput = historicalTrends.length > 0
      ? historicalTrends.reduce((sum, stat) => sum + stat.jobsProcessed, 0) / historicalTrends.length
      : 0;

    if (currentMetrics.throughputPerHour < avgThroughput * 0.8) {
      recommendations.push('Consider increasing worker concurrency to improve throughput');
    }

    // Processing time recommendations
    const avgProcessingTime = historicalTrends.length > 0
      ? historicalTrends.reduce((sum, stat) => sum + stat.averageProcessingTime, 0) / historicalTrends.length
      : 0;

    if (currentMetrics.averageProcessingTime > avgProcessingTime * 1.5) {
      recommendations.push('Processing times are higher than average - investigate performance bottlenecks');
    }

    // Success rate recommendations
    const successRate = currentMetrics.jobsProcessed > 0
      ? currentMetrics.jobsSucceeded / currentMetrics.jobsProcessed
      : 1;

    if (successRate < 0.95) {
      recommendations.push('Success rate is below 95% - review error patterns and retry strategies');
    }

    // Concurrency recommendations
    const maxConcurrency = Math.max(...historicalTrends.map(t => t.peakConcurrency));
    if (currentMetrics.peakConcurrency > maxConcurrency * 1.2) {
      recommendations.push('Peak concurrency is unusually high - monitor resource usage');
    }

    return recommendations;
  }

  private async persistMetricsToDatabase(metrics: QueueMetrics): Promise<void> {
    if (!this.databaseService) {
      return;
    }

    try {
      // This would use your actual database schema
      // await this.databaseService.insertQueueMetrics(metrics);
      this.customLogger.debug('Metrics persisted to database', { queueName: metrics.queueName });
    } catch (error) {
      this.customLogger.warn('Failed to persist metrics to database', { error: error.message });
    }
  }

  private generateAnalyticsCacheKey(
    queueType: QueueType,
    dateRange: any,
    granularity: string,
    tenantId?: string
  ): string {
    const fromTime = new Date(dateRange.from).getTime();
    const toTime = new Date(dateRange.to).getTime();
    return `queue:analytics:${queueType}:${fromTime}:${toTime}:${granularity}:${tenantId || 'all'}`;
  }

  private getQueueByType(queueType: QueueType): Queue {
    switch (queueType) {
      case QueueType.EMAIL:
        return this.emailQueue;
      case QueueType.REPORTS:
        return this.reportsQueue;
      case QueueType.SYNC:
        return this.syncQueue;
      case QueueType.NOTIFICATIONS:
        return this.notificationsQueue;
      case QueueType.ANALYTICS:
        return this.analyticsQueue;
      default:
        throw new Error(`Unknown queue type: ${queueType}`);
    }
  }

  private initializeMetricsCollection(): void {
    // Set up periodic metrics collection
    setInterval(async () => {
      try {
        for (const queueType of Object.values(QueueType)) {
          const metrics = await this.getRealtimeMetrics(queueType);
          if (metrics) {
            await this.recordQueueMetrics(queueType, metrics);
          }
        }
      } catch (error) {
        this.customLogger.error('Failed to collect periodic metrics', error.stack);
      }
    }, 60000); // Collect metrics every minute

    this.customLogger.log('Queue analytics service initialized with periodic metrics collection');
  }
}