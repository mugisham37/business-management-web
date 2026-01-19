import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { 
  QueueInfo, 
  QueueStats, 
  PaginatedQueues,
  QueueType,
  QueueStatus 
} from '../types/queue.types';
import { GetQueuesInput } from '../inputs/queue.input';
import { CustomLoggerService } from '../../logger/logger.service';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class QueueManagementService {
  private readonly logger = new Logger(QueueManagementService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('reports') private readonly reportsQueue: Queue,
    @InjectQueue('sync') private readonly syncQueue: Queue,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
    private readonly customLogger: CustomLoggerService,
    private readonly cacheService?: CacheService,
  ) {
    this.customLogger.setContext('QueueManagementService');
  }

  async getQueues(input?: GetQueuesInput, tenantId?: string): Promise<PaginatedQueues> {
    try {
      const page = input?.pagination?.page || 1;
      const limit = input?.pagination?.limit || 20;
      const offset = (page - 1) * limit;

      // Get all available queues
      const allQueues = await this.getAllQueueInfos(tenantId);
      
      // Apply filters
      let filteredQueues = allQueues;
      
      if (input?.filter) {
        filteredQueues = this.applyQueueFilters(allQueues, input.filter);
      }

      // Apply sorting
      if (input?.sort && input.sort.length > 0) {
        filteredQueues = this.applyQueueSorting(filteredQueues, input.sort);
      }

      // Apply pagination
      const total = filteredQueues.length;
      const paginatedQueues = filteredQueues.slice(offset, offset + limit);
      const totalPages = Math.ceil(total / limit);

      return {
        queues: paginatedQueues,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } catch (error) {
      this.customLogger.error('Failed to get queues', error instanceof Error ? error.stack : String(error), { input, tenantId });
      throw error;
    }
  }

  async getQueueInfo(queueType: QueueType, tenantId?: string): Promise<QueueInfo> {
    try {
      const queue = this.getQueueByType(queueType);
      const stats = await this.getQueueStats(queueType, tenantId);
      const status = await this.getQueueStatus(queue);
      const isHealthy = await this.isQueueHealthy(queueType);

      const queueInfo: QueueInfo = {
        name: queueType,
        type: queueType,
        status,
        stats,
        availableProcessors: this.getAvailableProcessors(queueType),
        configuration: await this.getQueueConfiguration(queue),
        createdAt: new Date(), // This would come from queue metadata in production
        lastActivity: new Date(),
        isHealthy,
        healthMessage: isHealthy ? 'Queue is operational' : 'Queue has issues',
      };

      return queueInfo;
    } catch (error) {
      this.customLogger.error('Failed to get queue info', error instanceof Error ? error.stack : String(error), { queueType, tenantId });
      throw new NotFoundException(`Queue ${queueType} not found`);
    }
  }

  async getQueueStats(queueType: QueueType, tenantId?: string): Promise<QueueStats> {
    try {
      const queue = this.getQueueByType(queueType);
      const counts = await this.getQueueCounts(queue);
      
      // Calculate additional metrics
      const throughput = await this.calculateThroughput(queue);
      const averageProcessingTime = await this.calculateAverageProcessingTime(queue);

      return {
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
        paused: counts.paused,
        total: counts.waiting + counts.active + counts.completed + counts.failed + counts.delayed + counts.paused,
        throughput,
        averageProcessingTime,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.customLogger.error('Failed to get queue stats', error instanceof Error ? error.stack : String(error), { queueType, tenantId });
      throw error;
    }
  }

  async isQueueHealthy(queueType: QueueType): Promise<boolean> {
    try {
      const queue = this.getQueueByType(queueType);
      const stats = await this.getQueueStats(queueType);
      
      // Health checks
      const isConnected = await this.checkQueueConnection(queue);
      const hasReasonableFailureRate = stats.total === 0 || (stats.failed / stats.total) < 0.1;
      const hasActiveProcessing = stats.active > 0 || stats.waiting === 0;
      
      return isConnected && hasReasonableFailureRate && hasActiveProcessing;
    } catch (error) {
      this.customLogger.error('Failed to check queue health', error instanceof Error ? error.stack : String(error), { queueType });
      return false;
    }
  }

  async drainQueue(queueType: QueueType): Promise<number> {
    try {
      const queue = this.getQueueByType(queueType);
      const waitingJobs = await queue.getWaiting();
      const delayedJobs = await queue.getDelayed();
      
      let drainedCount = 0;
      
      // Remove waiting jobs
      for (const job of waitingJobs) {
        await job.remove();
        drainedCount++;
      }
      
      // Remove delayed jobs
      for (const job of delayedJobs) {
        await job.remove();
        drainedCount++;
      }

      this.customLogger.log('Queue drained successfully', {
        queueType,
        drainedCount,
      });

      return drainedCount;
    } catch (error) {
      this.customLogger.error('Failed to drain queue', error instanceof Error ? error.stack : String(error), { queueType });
      throw error;
    }
  }

  async obliterateQueue(queueType: QueueType): Promise<void> {
    try {
      const queue = this.getQueueByType(queueType);
      
      // This is a destructive operation - remove all jobs and reset queue
      await queue.obliterate({ force: true });

      this.customLogger.warn('Queue obliterated', { queueType });
    } catch (error) {
      this.customLogger.error('Failed to obliterate queue', error instanceof Error ? error.stack : String(error), { queueType });
      throw error;
    }
  }

  getAvailableProcessors(queueType: QueueType): string[] {
    switch (queueType) {
      case QueueType.EMAIL:
        return ['send-email', 'send-bulk-email'];
      case QueueType.REPORTS:
        return ['generate-report', 'schedule-report'];
      case QueueType.SYNC:
        return ['sync-data', 'sync-inventory', 'sync-customers', 'sync-transactions'];
      case QueueType.NOTIFICATIONS:
        return ['send-notification', 'send-bulk-notification'];
      case QueueType.ANALYTICS:
        return ['process-analytics-event', 'aggregate-analytics'];
      default:
        return [];
    }
  }

  private async getAllQueueInfos(tenantId?: string): Promise<QueueInfo[]> {
    const queueTypes = Object.values(QueueType);
    const queueInfos: QueueInfo[] = [];

    for (const queueType of queueTypes) {
      try {
        const queueInfo = await this.getQueueInfo(queueType, tenantId);
        queueInfos.push(queueInfo);
      } catch (error) {
        this.customLogger.warn(`Failed to get info for queue ${queueType}`, {
          error: error instanceof Error ? error.message : String(error),
          queueType,
          tenantId,
        });
      }
    }

    return queueInfos;
  }

  private applyQueueFilters(queues: QueueInfo[], filter: any): QueueInfo[] {
    if (!filter) {
      return queues;
    }

    return queues.filter(queue => {
      // Type filter
      if (filter.types && filter.types.length > 0) {
        if (!filter.types.includes(queue.type)) {
          return false;
        }
      }

      // Status filter
      if (filter.statuses && filter.statuses.length > 0) {
        if (!filter.statuses.includes(queue.status)) {
          return false;
        }
      }

      // Search filter
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        if (!queue.name.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Health filter
      if (filter.isHealthy !== undefined) {
        if (filter.isHealthy !== queue.isHealthy) {
          return false;
        }
      }

      return true;
    });
  }

  private applyQueueSorting(queues: QueueInfo[], sortOptions: any[]): QueueInfo[] {
    return queues.sort((a, b) => {
      for (const sort of sortOptions) {
        let aValue: any;
        let bValue: any;

        switch (sort.field) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'createdAt':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'lastActivity':
            aValue = a.lastActivity.getTime();
            bValue = b.lastActivity.getTime();
            break;
          case 'total':
            aValue = a.stats.total;
            bValue = b.stats.total;
            break;
          case 'throughput':
            aValue = a.stats.throughput;
            bValue = b.stats.throughput;
            break;
          default:
            continue;
        }

        if (aValue < bValue) {
          return sort.direction === 'ASC' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sort.direction === 'ASC' ? 1 : -1;
        }
      }
      return 0;
    });
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
        throw new NotFoundException(`Queue type ${queueType} not found`);
    }
  }

  private async getQueueStatus(queue: Queue): Promise<QueueStatus> {
    try {
      const isPaused = await queue.isPaused();
      if (isPaused) {
        return QueueStatus.PAUSED;
      }

      const [active, waiting, failed] = await Promise.all([
        queue.getActive(),
        queue.getWaiting(),
        queue.getFailed(),
      ]);

      if (active.length > 0) {
        return QueueStatus.ACTIVE;
      }

      if (waiting.length > 0) {
        return QueueStatus.WAITING;
      }

      if (failed.length > 0) {
        return QueueStatus.FAILED;
      }

      return QueueStatus.COMPLETED;
    } catch (error) {
      return QueueStatus.FAILED;
    }
  }

  private async getQueueConfiguration(queue: Queue): Promise<any> {
    return {
      name: queue.name,
      // Note: Bull Queue doesn't expose defaultJobOptions as a public property
      // defaultJobOptions: queue.defaultJobOptions,
      settings: {
        stalledInterval: 30000,
        maxStalledCount: 1,
      },
      redis: {
        host: 'localhost', // This would come from actual config
        port: 6379,
      },
    };
  }

  private async getQueueCounts(queue: Queue): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    // Check if queue is paused
    const isPaused = await queue.isPaused();
    const paused = isPaused ? waiting.length : 0;

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused,
    };
  }

  private async calculateThroughput(queue: Queue): Promise<number> {
    try {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const completed = await queue.getCompleted();
      
      const recentCompleted = completed.filter(job => 
        (job.finishedOn || job.timestamp) > oneHourAgo
      );

      return recentCompleted.length; // Jobs per hour
    } catch (error) {
      return 0;
    }
  }

  private async calculateAverageProcessingTime(queue: Queue): Promise<number> {
    try {
      const completed = await queue.getCompleted();
      const recentCompleted = completed
        .filter(job => job.processedOn && job.finishedOn)
        .slice(-100); // Last 100 jobs

      if (recentCompleted.length === 0) {
        return 0;
      }

      const totalTime = recentCompleted.reduce((sum, job) => {
        return sum + (job.finishedOn! - job.processedOn!);
      }, 0);

      return totalTime / recentCompleted.length;
    } catch (error) {
      return 0;
    }
  }

  private async checkQueueConnection(queue: Queue): Promise<boolean> {
    try {
      // Try to get queue info to check connection
      await queue.getWaiting();
      return true;
    } catch (error) {
      return false;
    }
  }
}