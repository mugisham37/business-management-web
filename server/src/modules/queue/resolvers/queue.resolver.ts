import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { 
  QueueInfo, 
  QueueStats, 
  QueueOperationResponse, 
  PaginatedQueues,
  QueueHealthUpdate,
  QueueAnalytics,
  QueueType,
  QueueStatus 
} from '../types/queue.types';
import { 
  GetQueuesInput, 
  QueueOperationInput, 
  CleanQueueInput,
  QueueAnalyticsInput,
  QueueSubscriptionInput 
} from '../inputs/queue.input';
import { QueueService } from '../queue.service';
import { QueueManagementService } from '../services/queue-management.service';
import { QueueAnalyticsService } from '../services/queue-analytics.service';
import { 
  QueuePermissionGuard, 
  QueueTenantGuard, 
  QueueRateLimitGuard,
  QueueValidationGuard 
} from '../guards/queue.guards';
import { 
  QueueAuditInterceptor, 
  QueueCacheInterceptor, 
  QueueMonitoringInterceptor 
} from '../interceptors/queue.interceptors';
import { 
  RequireQueueRead, 
  RequireQueueAdmin, 
  RequireQueueManage,
  RequireTenantIsolation,
  QueueRateLimitByUser,
  CacheQueueStats,
  AuditQueueOperation,
  MonitorQueueHealth,
  CurrentTenant,
  QueueContext 
} from '../decorators/queue.decorators';
import { CustomLoggerService } from '../../logger/logger.service';

@Resolver(() => QueueInfo)
@UseGuards(QueuePermissionGuard, QueueTenantGuard, QueueRateLimitGuard, QueueValidationGuard)
@UseInterceptors(QueueAuditInterceptor, QueueCacheInterceptor, QueueMonitoringInterceptor)
export class QueueResolver {
  constructor(
    private readonly queueService: QueueService,
    private readonly queueManagementService: QueueManagementService,
    private readonly queueAnalyticsService: QueueAnalyticsService,
    private readonly logger: CustomLoggerService,
    private readonly pubSub: PubSub,
  ) {
    this.logger.setContext('QueueResolver');
  }

  // Queries
  @Query(() => PaginatedQueues, { 
    name: 'getQueues',
    description: 'Get paginated list of queues with filtering and sorting' 
  })
  @RequireQueueRead()
  @RequireTenantIsolation()
  @CacheQueueStats(60)
  @MonitorQueueHealth()
  @QueueRateLimitByUser(100, 60000)
  async getQueues(
    @Args('input', { nullable: true }) input?: GetQueuesInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<PaginatedQueues> {
    try {
      this.logger.log('Getting queues', { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.queueManagementService.getQueues(input, tenantId);
      
      this.logger.debug('Queues retrieved successfully', { 
        total: result.total,
        page: result.page,
        tenantId 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get queues', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });
      throw error;
    }
  }

  @Query(() => QueueInfo, { 
    name: 'getQueue',
    description: 'Get detailed information about a specific queue' 
  })
  @RequireQueueRead()
  @RequireTenantIsolation()
  @CacheQueueStats(30)
  @MonitorQueueHealth()
  async getQueue(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueInfo> {
    try {
      this.logger.log('Getting queue info', { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.queueManagementService.getQueueInfo(queueType, tenantId);
      
      this.logger.debug('Queue info retrieved successfully', { 
        queueType, 
        status: result.status,
        tenantId 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get queue info', error.stack, { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });
      throw error;
    }
  }

  @Query(() => QueueStats, { 
    name: 'getQueueStats',
    description: 'Get comprehensive statistics for a specific queue' 
  })
  @RequireQueueRead()
  @RequireTenantIsolation()
  @CacheQueueStats(15)
  @MonitorQueueHealth()
  async getQueueStats(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueStats> {
    try {
      this.logger.log('Getting queue stats', { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.queueManagementService.getQueueStats(queueType, tenantId);
      
      this.logger.debug('Queue stats retrieved successfully', { 
        queueType, 
        total: result.total,
        active: result.active,
        tenantId 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get queue stats', error.stack, { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });
      throw error;
    }
  }

  @Query(() => [QueueAnalytics], { 
    name: 'getQueueAnalytics',
    description: 'Get analytics data for queues over a specified time period' 
  })
  @RequireQueueRead()
  @RequireTenantIsolation()
  @MonitorQueueHealth()
  @QueueRateLimitByUser(50, 60000)
  async getQueueAnalytics(
    @Args('input') input: QueueAnalyticsInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueAnalytics[]> {
    try {
      this.logger.log('Getting queue analytics', { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.queueAnalyticsService.getQueueAnalytics(
        input, 
        tenantId || input.tenantId
      );
      
      this.logger.debug('Queue analytics retrieved successfully', { 
        queueCount: result.length,
        dateRange: input.dateRange,
        tenantId 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get queue analytics', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });
      throw error;
    }
  }

  @Query(() => Boolean, { 
    name: 'isQueueHealthy',
    description: 'Check if a specific queue is healthy and operational' 
  })
  @RequireQueueRead()
  @CacheQueueStats(10)
  async isQueueHealthy(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @CurrentTenant() tenantId?: string,
  ): Promise<boolean> {
    try {
      this.logger.log('Checking queue health', { queueType, tenantId });

      const result = await this.queueManagementService.isQueueHealthy(queueType);
      
      this.logger.debug('Queue health check completed', { 
        queueType, 
        isHealthy: result,
        tenantId 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to check queue health', error.stack, { 
        queueType, 
        tenantId 
      });
      return false;
    }
  }

  // Mutations
  @Mutation(() => QueueOperationResponse, { 
    name: 'pauseQueue',
    description: 'Pause a queue to stop processing new jobs' 
  })
  @RequireQueueManage()
  @RequireTenantIsolation()
  @AuditQueueOperation('pause')
  @MonitorQueueHealth()
  async pauseQueue(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueOperationResponse> {
    try {
      this.logger.log('Pausing queue', { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      await this.queueService.pauseQueue(queueType as any);
      
      const queueInfo = await this.queueManagementService.getQueueInfo(queueType, tenantId);
      
      // Publish queue status update
      await this.pubSub.publish('queueHealthUpdated', {
        queueHealthUpdated: {
          queueName: queueType,
          queueType,
          status: QueueStatus.PAUSED,
          stats: await this.queueManagementService.getQueueStats(queueType, tenantId),
          isHealthy: false,
          healthMessage: 'Queue manually paused',
          timestamp: new Date(),
          tenantId,
        },
      });

      this.logger.log('Queue paused successfully', { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Queue ${queueType} paused successfully`,
        queue: queueInfo,
      };
    } catch (error) {
      this.logger.error('Failed to pause queue', error.stack, { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to pause queue ${queueType}: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => QueueOperationResponse, { 
    name: 'resumeQueue',
    description: 'Resume a paused queue to continue processing jobs' 
  })
  @RequireQueueManage()
  @RequireTenantIsolation()
  @AuditQueueOperation('resume')
  @MonitorQueueHealth()
  async resumeQueue(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueOperationResponse> {
    try {
      this.logger.log('Resuming queue', { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      await this.queueService.resumeQueue(queueType as any);
      
      const queueInfo = await this.queueManagementService.getQueueInfo(queueType, tenantId);
      
      // Publish queue status update
      await this.pubSub.publish('queueHealthUpdated', {
        queueHealthUpdated: {
          queueName: queueType,
          queueType,
          status: QueueStatus.ACTIVE,
          stats: await this.queueManagementService.getQueueStats(queueType, tenantId),
          isHealthy: true,
          healthMessage: 'Queue resumed and operational',
          timestamp: new Date(),
          tenantId,
        },
      });

      this.logger.log('Queue resumed successfully', { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Queue ${queueType} resumed successfully`,
        queue: queueInfo,
      };
    } catch (error) {
      this.logger.error('Failed to resume queue', error.stack, { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to resume queue ${queueType}: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => QueueOperationResponse, { 
    name: 'cleanQueue',
    description: 'Clean completed, failed, or stale jobs from a queue' 
  })
  @RequireQueueManage()
  @RequireTenantIsolation()
  @AuditQueueOperation('clean')
  @MonitorQueueHealth()
  async cleanQueue(
    @Args('input') input: CleanQueueInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueOperationResponse> {
    try {
      this.logger.log('Cleaning queue', { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      await this.queueService.cleanQueue(
        input.queueType as any,
        input.grace,
        input.status as any
      );
      
      const queueInfo = await this.queueManagementService.getQueueInfo(input.queueType, tenantId);

      this.logger.log('Queue cleaned successfully', { 
        queueType: input.queueType, 
        status: input.status,
        grace: input.grace,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Queue ${input.queueType} cleaned successfully (${input.status} jobs with ${input.grace}ms grace period)`,
        queue: queueInfo,
      };
    } catch (error) {
      this.logger.error('Failed to clean queue', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to clean queue ${input.queueType}: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => QueueOperationResponse, { 
    name: 'drainQueue',
    description: 'Drain all jobs from a queue (remove waiting jobs)' 
  })
  @RequireQueueAdmin()
  @RequireTenantIsolation()
  @AuditQueueOperation('drain')
  @MonitorQueueHealth()
  async drainQueue(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueOperationResponse> {
    try {
      this.logger.log('Draining queue', { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      const drainedCount = await this.queueManagementService.drainQueue(queueType);
      
      const queueInfo = await this.queueManagementService.getQueueInfo(queueType, tenantId);

      this.logger.log('Queue drained successfully', { 
        queueType, 
        drainedCount,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Queue ${queueType} drained successfully (${drainedCount} jobs removed)`,
        queue: queueInfo,
      };
    } catch (error) {
      this.logger.error('Failed to drain queue', error.stack, { 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to drain queue ${queueType}: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => QueueOperationResponse, { 
    name: 'obliterateQueue',
    description: 'Completely obliterate a queue and all its jobs (DESTRUCTIVE)' 
  })
  @RequireQueueAdmin()
  @AuditQueueOperation('obliterate')
  @MonitorQueueHealth()
  async obliterateQueue(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @Args('confirm', { type: () => Boolean }) confirm: boolean,
    @QueueContext() context?: any,
  ): Promise<QueueOperationResponse> {
    if (!confirm) {
      return {
        success: false,
        message: 'Obliterate operation requires explicit confirmation',
        errors: ['Confirmation required'],
      };
    }

    try {
      this.logger.warn('Obliterating queue', { 
        queueType, 
        userId: context?.user?.id 
      });

      await this.queueManagementService.obliterateQueue(queueType);

      this.logger.warn('Queue obliterated', { 
        queueType, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Queue ${queueType} obliterated successfully`,
      };
    } catch (error) {
      this.logger.error('Failed to obliterate queue', error.stack, { 
        queueType, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to obliterate queue ${queueType}: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  // Subscriptions
  @Subscription(() => QueueHealthUpdate, {
    name: 'queueHealthUpdated',
    description: 'Subscribe to queue health status updates',
    filter: (payload, variables, context) => {
      // Filter by tenant and queue types
      const update = payload.queueHealthUpdated;
      const input = variables.input as QueueSubscriptionInput;
      
      // Tenant isolation
      if (context.req?.user?.tenantId && update.tenantId !== context.req.user.tenantId) {
        return false;
      }
      
      // Queue type filter
      if (input?.queueTypes && !input.queueTypes.includes(update.queueType)) {
        return false;
      }
      
      return true;
    },
  })
  @RequireQueueRead()
  queueHealthUpdated(
    @Args('input', { nullable: true }) input?: QueueSubscriptionInput,
  ) {
    return this.pubSub.asyncIterator('queueHealthUpdated');
  }

  // Field Resolvers
  @Query(() => [String], { 
    name: 'getAvailableQueueTypes',
    description: 'Get list of all available queue types' 
  })
  @RequireQueueRead()
  async getAvailableQueueTypes(): Promise<string[]> {
    return Object.values(QueueType);
  }

  @Query(() => [String], { 
    name: 'getQueueProcessors',
    description: 'Get list of available processors for a queue type' 
  })
  @RequireQueueRead()
  async getQueueProcessors(
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
  ): Promise<string[]> {
    return this.queueManagementService.getAvailableProcessors(queueType);
  }
}