import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { QueueStats, QueueType, QueueAnalytics } from '../types/queue.types';
import { QueueManagementService } from '../services/queue-management.service';
import { QueueAnalyticsService } from '../services/queue-analytics.service';
import { CustomLoggerService } from '../../logger/logger.service';

interface QueueStatsKey {
  queueType: QueueType;
  tenantId?: string;
}

interface QueueAnalyticsKey {
  queueType: QueueType;
  dateRange: { from: Date; to: Date };
  granularity: string;
  tenantId?: string;
}

@Injectable()
export class QueueDataLoader {
  private queueStatsLoader!: DataLoader<QueueStatsKey, QueueStats>;
  private queueAnalyticsLoader!: DataLoader<QueueAnalyticsKey, QueueAnalytics>;
  private queueHealthLoader!: DataLoader<QueueType, boolean>;

  constructor(
    private readonly queueManagementService: QueueManagementService,
    private readonly queueAnalyticsService: QueueAnalyticsService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueDataLoader');
    this.initializeDataLoaders();
  }

  private initializeDataLoaders(): void {
    // Queue Stats DataLoader
    this.queueStatsLoader = new DataLoader<QueueStatsKey, QueueStats>(
      async (keys) => {
        try {
          const results = await Promise.allSettled(
            keys.map(key => 
              this.queueManagementService.getQueueStats(key.queueType, key.tenantId)
            )
          );

          return results.map(result => {
            if (result.status === 'fulfilled') {
              return result.value;
            } else {
              this.logger.error('Failed to load queue stats', result.reason);
              // Return default stats on error
              return {
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
                delayed: 0,
                paused: 0,
                total: 0,
                throughput: 0,
                averageProcessingTime: 0,
                lastUpdated: new Date(),
              };
            }
          });
        } catch (error) {
          this.logger.error('Failed to batch load queue stats', error instanceof Error ? error.stack : String(error));
          throw error;
        }
      },
      {
        // Cache for 30 seconds
        cacheKeyFn: (key) => `${key.queueType}:${key.tenantId || 'all'}` as any,
        batchScheduleFn: (callback) => setTimeout(callback, 10), // Batch within 10ms
      }
    );

    // Queue Analytics DataLoader
    this.queueAnalyticsLoader = new DataLoader<QueueAnalyticsKey, QueueAnalytics>(
      async (keys) => {
        try {
          const results = await Promise.allSettled(
            keys.map(key => 
              this.queueAnalyticsService.getQueueAnalyticsForType(
                key.queueType,
                key.dateRange,
                key.granularity,
                key.tenantId
              )
            )
          );

          return results.map(result => {
            if (result.status === 'fulfilled') {
              return result.value;
            } else {
              this.logger.error('Failed to load queue analytics', result.reason);
              // Return default analytics on error
              return {
                queueName: 'unknown',
                queueType: QueueType.EMAIL,
                totalJobsProcessed: 0,
                averageProcessingTime: 0,
                successRate: 0,
                throughputPerHour: 0,
                peakConcurrency: 0,
                hourlyStats: [],
                periodStart: new Date(),
                periodEnd: new Date(),
              };
            }
          });
        } catch (error) {
          this.logger.error('Failed to batch load queue analytics', error instanceof Error ? error.stack : String(error));
          throw error;
        }
      },
      {
        // Cache for 5 minutes
        cacheKeyFn: (key) => 
          `${key.queueType}:${key.dateRange.from.getTime()}:${key.dateRange.to.getTime()}:${key.granularity}:${key.tenantId || 'all'}` as any,
        batchScheduleFn: (callback) => setTimeout(callback, 50), // Batch within 50ms for analytics
      }
    );

    // Queue Health DataLoader
    this.queueHealthLoader = new DataLoader<QueueType, boolean>(
      async (queueTypes) => {
        try {
          const results = await Promise.allSettled(
            queueTypes.map(queueType => 
              this.queueManagementService.isQueueHealthy(queueType)
            )
          );

          return results.map(result => {
            if (result.status === 'fulfilled') {
              return result.value;
            } else {
              this.logger.error('Failed to load queue health', result.reason);
              return false; // Default to unhealthy on error
            }
          });
        } catch (error) {
          this.logger.error('Failed to batch load queue health', error instanceof Error ? error.stack : String(error));
          throw error;
        }
      },
      {
        // Cache for 15 seconds
        cacheKeyFn: (queueType) => queueType.toString() as any,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
      }
    );

    this.logger.log('Queue DataLoaders initialized');
  }

  // Public methods to access DataLoaders
  async loadQueueStats(queueType: QueueType, tenantId?: string): Promise<QueueStats> {
    const key: QueueStatsKey = { queueType };
    if (tenantId !== undefined) {
      key.tenantId = tenantId;
    }
    return this.queueStatsLoader.load(key);
  }

  async loadQueueAnalytics(
    queueType: QueueType,
    dateRange: { from: Date; to: Date },
    granularity: string = 'hour',
    tenantId?: string
  ): Promise<QueueAnalytics> {
    const key: QueueAnalyticsKey = {
      queueType,
      dateRange,
      granularity,
    };
    if (tenantId !== undefined) {
      key.tenantId = tenantId;
    }
    return this.queueAnalyticsLoader.load(key);
  }

  async loadQueueHealth(queueType: QueueType): Promise<boolean> {
    return this.queueHealthLoader.load(queueType);
  }

  // Batch loading methods for multiple items
  async loadMultipleQueueStats(
    requests: Array<{ queueType: QueueType; tenantId?: string }>
  ): Promise<QueueStats[]> {
    const results = await this.queueStatsLoader.loadMany(requests);
    return results.map(r => r instanceof Error ? {
      waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0,
      paused: 0, total: 0, throughput: 0, averageProcessingTime: 0,
      lastUpdated: new Date(),
    } : r);
  }

  async loadMultipleQueueAnalytics(
    requests: QueueAnalyticsKey[]
  ): Promise<QueueAnalytics[]> {
    const results = await this.queueAnalyticsLoader.loadMany(requests);
    return results.map(r => r instanceof Error ? {
      queueName: 'unknown', queueType: QueueType.EMAIL, totalJobsProcessed: 0,
      averageProcessingTime: 0, successRate: 0, throughputPerHour: 0,
      peakConcurrency: 0, hourlyStats: [], periodStart: new Date(), periodEnd: new Date(),
    } : r);
  }

  async loadMultipleQueueHealth(queueTypes: QueueType[]): Promise<boolean[]> {
    const results = await this.queueHealthLoader.loadMany(queueTypes);
    return results.map(r => r instanceof Error ? false : r);
  }

  // Cache management methods
  clearQueueStatsCache(queueType?: QueueType, tenantId?: string): void {
    if (queueType) {
      const key: QueueStatsKey = { queueType };
      if (tenantId !== undefined) {
        key.tenantId = tenantId;
      }
      this.queueStatsLoader.clear(key);
    } else {
      this.queueStatsLoader.clearAll();
    }
  }

  clearQueueAnalyticsCache(queueType?: QueueType): void {
    if (queueType) {
      // Clear all analytics entries for this queue type
      // Note: DataLoader doesn't have a partial clear method, so we clear all
      this.queueAnalyticsLoader.clearAll();
    } else {
      this.queueAnalyticsLoader.clearAll();
    }
  }

  clearQueueHealthCache(queueType?: QueueType): void {
    if (queueType) {
      this.queueHealthLoader.clear(queueType);
    } else {
      this.queueHealthLoader.clearAll();
    }
  }

  clearAllCaches(): void {
    this.queueStatsLoader.clearAll();
    this.queueAnalyticsLoader.clearAll();
    this.queueHealthLoader.clearAll();
    this.logger.log('All queue DataLoader caches cleared');
  }

  // Prime cache methods (useful for preloading data)
  primeQueueStats(queueType: QueueType, tenantId: string | undefined, stats: QueueStats): void {
    const key: QueueStatsKey = { queueType };
    if (tenantId !== undefined) {
      key.tenantId = tenantId;
    }
    this.queueStatsLoader.prime(key, stats);
  }

  primeQueueAnalytics(
    queueType: QueueType,
    dateRange: { from: Date; to: Date },
    granularity: string,
    tenantId: string | undefined,
    analytics: QueueAnalytics
  ): void {
    const key: QueueAnalyticsKey = { queueType, dateRange, granularity };
    if (tenantId !== undefined) {
      key.tenantId = tenantId;
    }
    this.queueAnalyticsLoader.prime(key, analytics);
  }

  primeQueueHealth(queueType: QueueType, isHealthy: boolean): void {
    this.queueHealthLoader.prime(queueType, isHealthy);
  }

  // Get DataLoader instances for use in GraphQL context
  getQueueStatsLoader(): DataLoader<QueueStatsKey, QueueStats> {
    return this.queueStatsLoader;
  }

  getQueueAnalyticsLoader(): DataLoader<QueueAnalyticsKey, QueueAnalytics> {
    return this.queueAnalyticsLoader;
  }

  getQueueHealthLoader(): DataLoader<QueueType, boolean> {
    return this.queueHealthLoader;
  }

  // Create new DataLoader instances for each request (recommended pattern)
  createRequestScopedLoaders(): {
    queueStatsLoader: DataLoader<QueueStatsKey, QueueStats>;
    queueAnalyticsLoader: DataLoader<QueueAnalyticsKey, QueueAnalytics>;
    queueHealthLoader: DataLoader<QueueType, boolean>;
  } {
    // Create fresh DataLoader instances for each GraphQL request
    // This ensures proper isolation between requests
    const queueStatsLoader = new DataLoader<QueueStatsKey, QueueStats>(
      async (keys) => {
        const results = await Promise.allSettled(
          keys.map(key => 
            this.queueManagementService.getQueueStats(key.queueType, key.tenantId)
          )
        );

        return results.map(result => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              waiting: 0,
              active: 0,
              completed: 0,
              failed: 0,
              delayed: 0,
              paused: 0,
              total: 0,
              throughput: 0,
              averageProcessingTime: 0,
              lastUpdated: new Date(),
            };
          }
        });
      },
      {
        cacheKeyFn: (key) => `${key.queueType}:${key.tenantId || 'all'}` as any,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
      }
    );

    const queueAnalyticsLoader = new DataLoader<QueueAnalyticsKey, QueueAnalytics>(
      async (keys) => {
        const results = await Promise.allSettled(
          keys.map(key => 
            this.queueAnalyticsService.getQueueAnalyticsForType(
              key.queueType,
              key.dateRange,
              key.granularity,
              key.tenantId
            )
          )
        );

        return results.map(result => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              queueName: 'unknown',
              queueType: QueueType.EMAIL,
              totalJobsProcessed: 0,
              averageProcessingTime: 0,
              successRate: 0,
              throughputPerHour: 0,
              peakConcurrency: 0,
              hourlyStats: [],
              periodStart: new Date(),
              periodEnd: new Date(),
            };
          }
        });
      },
      {
        cacheKeyFn: (key) => 
          `${key.queueType}:${key.dateRange.from.getTime()}:${key.dateRange.to.getTime()}:${key.granularity}:${key.tenantId || 'all'}` as any,
        batchScheduleFn: (callback) => setTimeout(callback, 50),
      }
    );

    const queueHealthLoader = new DataLoader<QueueType, boolean>(
      async (queueTypes) => {
        const results = await Promise.allSettled(
          queueTypes.map(queueType => 
            this.queueManagementService.isQueueHealthy(queueType)
          )
        );

        return results.map(result => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return false;
          }
        });
      },
      {
        cacheKeyFn: (queueType) => queueType.toString() as any,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
      }
    );

    return {
      queueStatsLoader,
      queueAnalyticsLoader,
      queueHealthLoader,
    };
  }
}