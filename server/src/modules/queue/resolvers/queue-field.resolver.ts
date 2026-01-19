import { Resolver, ResolveField, Parent, Args, Context } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { 
  QueueInfo, 
  QueueStats, 
  QueueAnalytics,
  QueueHourlyStats,
  QueueType,
  JobStatus 
} from '../types/queue.types';
import { QueueManagementService } from '../services/queue-management.service';
import { QueueAnalyticsService } from '../services/queue-analytics.service';
import { JobManagementService } from '../services/job-management.service';
import { 
  QueuePermissionGuard, 
  QueueTenantGuard, 
  QueueRateLimitGuard 
} from '../guards/queue.guards';
import { 
  QueueCacheInterceptor, 
  QueueMonitoringInterceptor 
} from '../interceptors/queue.interceptors';
import { 
  RequireQueueRead,
  CacheQueueStats,
  MonitorQueueHealth,
  CurrentTenant 
} from '../decorators/queue.decorators';
import { CustomLoggerService } from '../../logger/logger.service';
import DataLoader from 'dataloader';

// Helper function to safely get error stack
function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return String(error);
}

@Resolver(() => QueueInfo)
@UseGuards(QueuePermissionGuard, QueueTenantGuard, QueueRateLimitGuard)
@UseInterceptors(QueueCacheInterceptor, QueueMonitoringInterceptor)
export class QueueFieldResolver {
  constructor(
    private readonly queueManagementService: QueueManagementService,
    private readonly queueAnalyticsService: QueueAnalyticsService,
    private readonly jobManagementService: JobManagementService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueFieldResolver');
  }

  @ResolveField(() => QueueStats, { 
    name: 'stats',
    description: 'Real-time queue statistics' 
  })
  @RequireQueueRead()
  @CacheQueueStats(30)
  @MonitorQueueHealth()
  async getQueueStats(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
    @Context() context?: any,
  ): Promise<QueueStats> {
    try {
      // Use DataLoader if available in context
      if (context.queueStatsLoader) {
        return await context.queueStatsLoader.load({
          queueType: queue.type,
          tenantId,
        });
      }

      return await this.queueManagementService.getQueueStats(queue.type, tenantId);
    } catch (error) {
      this.logger.error('Failed to resolve queue stats', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      throw error;
    }
  }

  @ResolveField(() => [String], { 
    name: 'availableProcessors',
    description: 'List of available processors for this queue' 
  })
  @RequireQueueRead()
  async getAvailableProcessors(
    @Parent() queue: QueueInfo,
  ): Promise<string[]> {
    return this.queueManagementService.getAvailableProcessors(queue.type);
  }

  @ResolveField(() => Boolean, { 
    name: 'isHealthy',
    description: 'Current health status of the queue' 
  })
  @RequireQueueRead()
  @CacheQueueStats(15)
  async getQueueHealth(
    @Parent() queue: QueueInfo,
  ): Promise<boolean> {
    try {
      return await this.queueManagementService.isQueueHealthy(queue.type);
    } catch (error) {
      this.logger.error('Failed to resolve queue health', getErrorStack(error), {
        queueType: queue.type,
      });
      return false;
    }
  }

  @ResolveField(() => String, { 
    name: 'healthMessage',
    description: 'Detailed health status message',
    nullable: true 
  })
  @RequireQueueRead()
  async getHealthMessage(
    @Parent() queue: QueueInfo,
  ): Promise<string | null> {
    try {
      const isHealthy = await this.queueManagementService.isQueueHealthy(queue.type);
      const stats = await this.queueManagementService.getQueueStats(queue.type);
      
      if (!isHealthy) {
        if (stats.failed > stats.total * 0.1) {
          return `High failure rate: ${Math.round((stats.failed / stats.total) * 100)}%`;
        }
        if (stats.active === 0 && stats.waiting > 0) {
          return 'No active workers processing jobs';
        }
        return 'Queue health check failed';
      }
      
      return 'Queue is operational';
    } catch (error) {
      return 'Unable to determine queue health';
    }
  }

  @ResolveField(() => QueueAnalytics, { 
    name: 'analytics',
    description: 'Queue analytics for the last 24 hours',
    nullable: true 
  })
  @RequireQueueRead()
  async getQueueAnalytics(
    @Parent() queue: QueueInfo,
    @Args('hours', { type: () => Number, defaultValue: 24 }) hours: number,
    @CurrentTenant() tenantId?: string,
  ): Promise<QueueAnalytics | null> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
      
      return await this.queueAnalyticsService.getQueueAnalyticsForType(
        queue.type,
        { from: startDate, to: endDate },
        'hour',
        tenantId
      );
    } catch (error) {
      this.logger.error('Failed to resolve queue analytics', getErrorStack(error), {
        queueType: queue.type,
        hours,
        tenantId,
      });
      return null;
    }
  }

  @ResolveField(() => [QueueHourlyStats], { 
    name: 'hourlyTrends',
    description: 'Hourly performance trends for the last 7 days' 
  })
  @RequireQueueRead()
  async getHourlyTrends(
    @Parent() queue: QueueInfo,
    @Args('days', { type: () => Number, defaultValue: 7 }) days: number,
    @CurrentTenant() tenantId?: string,
  ): Promise<QueueHourlyStats[]> {
    try {
      return await this.queueAnalyticsService.getHistoricalTrends(
        queue.type,
        days,
        tenantId
      );
    } catch (error) {
      this.logger.error('Failed to resolve hourly trends', getErrorStack(error), {
        queueType: queue.type,
        days,
        tenantId,
      });
      return [];
    }
  }

  @ResolveField(() => Number, { 
    name: 'activeJobCount',
    description: 'Current number of active jobs' 
  })
  @RequireQueueRead()
  async getActiveJobCount(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<number> {
    try {
      const stats = await this.queueManagementService.getQueueStats(queue.type, tenantId);
      return stats.active;
    } catch (error) {
      this.logger.error('Failed to resolve active job count', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 0;
    }
  }

  @ResolveField(() => Number, { 
    name: 'waitingJobCount',
    description: 'Current number of waiting jobs' 
  })
  @RequireQueueRead()
  async getWaitingJobCount(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<number> {
    try {
      const stats = await this.queueManagementService.getQueueStats(queue.type, tenantId);
      return stats.waiting;
    } catch (error) {
      this.logger.error('Failed to resolve waiting job count', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 0;
    }
  }

  @ResolveField(() => Number, { 
    name: 'failedJobCount',
    description: 'Current number of failed jobs' 
  })
  @RequireQueueRead()
  async getFailedJobCount(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<number> {
    try {
      const stats = await this.queueManagementService.getQueueStats(queue.type, tenantId);
      return stats.failed;
    } catch (error) {
      this.logger.error('Failed to resolve failed job count', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 0;
    }
  }

  @ResolveField(() => Number, { 
    name: 'completedJobCount',
    description: 'Current number of completed jobs' 
  })
  @RequireQueueRead()
  async getCompletedJobCount(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<number> {
    try {
      const stats = await this.queueManagementService.getQueueStats(queue.type, tenantId);
      return stats.completed;
    } catch (error) {
      this.logger.error('Failed to resolve completed job count', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 0;
    }
  }

  @ResolveField(() => Number, { 
    name: 'throughputPerMinute',
    description: 'Jobs processed per minute (last hour average)' 
  })
  @RequireQueueRead()
  async getThroughputPerMinute(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<number> {
    try {
      const stats = await this.queueManagementService.getQueueStats(queue.type, tenantId);
      return stats.throughput / 60; // Convert from per hour to per minute
    } catch (error) {
      this.logger.error('Failed to resolve throughput per minute', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 0;
    }
  }

  @ResolveField(() => Number, { 
    name: 'averageWaitTime',
    description: 'Average time jobs wait before processing (in milliseconds)' 
  })
  @RequireQueueRead()
  async getAverageWaitTime(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<number> {
    try {
      // This would require tracking job wait times
      // For now, return a calculated estimate based on queue depth and throughput
      const stats = await this.queueManagementService.getQueueStats(queue.type, tenantId);
      
      if (stats.throughput === 0) {
        return 0;
      }
      
      // Estimate: waiting jobs / (throughput per second)
      const throughputPerSecond = stats.throughput / 3600;
      return throughputPerSecond > 0 ? (stats.waiting / throughputPerSecond) * 1000 : 0;
    } catch (error) {
      this.logger.error('Failed to resolve average wait time', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 0;
    }
  }

  @ResolveField(() => Number, { 
    name: 'successRate',
    description: 'Success rate percentage (last 24 hours)' 
  })
  @RequireQueueRead()
  async getSuccessRate(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<number> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      
      const analytics = await this.queueAnalyticsService.getQueueAnalyticsForType(
        queue.type,
        { from: startDate, to: endDate },
        'hour',
        tenantId
      );
      
      return analytics.successRate * 100; // Convert to percentage
    } catch (error) {
      this.logger.error('Failed to resolve success rate', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 0;
    }
  }

  @ResolveField(() => Date, { 
    name: 'lastJobProcessed',
    description: 'Timestamp of the last processed job',
    nullable: true 
  })
  @RequireQueueRead()
  async getLastJobProcessed(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<Date | null> {
    try {
      // Get the most recent completed job
      const filter: { queueTypes: QueueType[]; statuses: JobStatus[]; tenantId?: string } = {
        queueTypes: [queue.type],
        statuses: [JobStatus.COMPLETED],
      };
      if (tenantId) {
        filter.tenantId = tenantId;
      }
      
      const jobs = await this.jobManagementService.getJobs(
        {
          filter,
          pagination: { page: 1, limit: 1 },
          sort: [{ field: 'completedAt', direction: 'DESC' }],
        },
        tenantId
      );

      const firstJob = jobs.jobs?.[0];
      return firstJob?.completedAt ?? null;
    } catch (error) {
      this.logger.error('Failed to resolve last job processed', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return null;
    }
  }

  @ResolveField(() => String, { 
    name: 'performanceGrade',
    description: 'Performance grade based on throughput and success rate' 
  })
  @RequireQueueRead()
  async getPerformanceGrade(
    @Parent() queue: QueueInfo,
    @CurrentTenant() tenantId?: string,
  ): Promise<string> {
    try {
      const insights = await this.queueAnalyticsService.getPerformanceInsights(
        queue.type,
        tenantId
      );

      if (!insights) {
        return 'N/A';
      }

      const successRate = insights.currentSuccessRate;
      const throughputRatio = insights.averageThroughput > 0 
        ? insights.currentThroughput / insights.averageThroughput 
        : 1;

      // Calculate grade based on success rate and throughput
      let score = 0;
      
      // Success rate component (60% of score)
      if (successRate >= 0.99) score += 60;
      else if (successRate >= 0.95) score += 50;
      else if (successRate >= 0.90) score += 40;
      else if (successRate >= 0.80) score += 30;
      else score += 20;

      // Throughput component (40% of score)
      if (throughputRatio >= 1.2) score += 40;
      else if (throughputRatio >= 1.0) score += 35;
      else if (throughputRatio >= 0.8) score += 30;
      else if (throughputRatio >= 0.6) score += 25;
      else score += 15;

      // Convert score to grade
      if (score >= 90) return 'A+';
      if (score >= 85) return 'A';
      if (score >= 80) return 'A-';
      if (score >= 75) return 'B+';
      if (score >= 70) return 'B';
      if (score >= 65) return 'B-';
      if (score >= 60) return 'C+';
      if (score >= 55) return 'C';
      if (score >= 50) return 'C-';
      if (score >= 45) return 'D+';
      if (score >= 40) return 'D';
      return 'F';
    } catch (error) {
      this.logger.error('Failed to resolve performance grade', getErrorStack(error), {
        queueType: queue.type,
        tenantId,
      });
      return 'N/A';
    }
  }
}