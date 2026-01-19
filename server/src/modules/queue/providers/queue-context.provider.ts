import { Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { QueueDataLoader } from '../dataloaders/queue.dataloader';
import { CustomLoggerService } from '../../logger/logger.service';

@Injectable()
export class QueueContextProvider {
  constructor(
    private readonly queueDataLoader: QueueDataLoader,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueContextProvider');
  }

  createContext(context: any): any {
    try {
      // Create request-scoped DataLoaders for this GraphQL request
      const loaders = this.queueDataLoader.createRequestScopedLoaders();

      // Add queue-specific context
      const queueContext = {
        // DataLoaders for N+1 prevention
        queueStatsLoader: loaders.queueStatsLoader,
        queueAnalyticsLoader: loaders.queueAnalyticsLoader,
        queueHealthLoader: loaders.queueHealthLoader,

        // Request metadata
        requestId: this.generateRequestId(),
        timestamp: new Date(),
        
        // User and tenant context (if available)
        user: context.req?.user,
        tenant: context.req?.tenant || context.req?.user?.tenantId,
        
        // Request tracking
        ip: context.req?.ip,
        userAgent: context.req?.get('User-Agent'),
        correlationId: context.req?.get('X-Correlation-ID'),
        
        // Performance tracking
        startTime: Date.now(),
        
        // Cache management
        clearQueueCache: (queueType?: string, tenantId?: string) => {
          this.queueDataLoader.clearQueueStatsCache(queueType as any, tenantId);
          this.queueDataLoader.clearQueueHealthCache(queueType as any);
        },
        
        // Metrics collection
        metrics: {
          queriesExecuted: 0,
          cacheHits: 0,
          cacheMisses: 0,
        },
      };

      // Merge with existing context
      return {
        ...context,
        queue: queueContext,
      };
    } catch (error) {
      this.logger.error('Failed to create queue context', error instanceof Error ? error.stack : String(error));
      return context;
    }
  }

  extractQueueContext(executionContext: any): any {
    try {
      const ctx = GqlExecutionContext.create(executionContext);
      const context = ctx.getContext();
      return context.queue || {};
    } catch (error) {
      this.logger.error('Failed to extract queue context', error instanceof Error ? error.stack : String(error));
      return {};
    }
  }

  updateMetrics(context: any, operation: string): void {
    try {
      if (context.queue?.metrics) {
        context.queue.metrics.queriesExecuted++;
        
        if (operation === 'cache_hit') {
          context.queue.metrics.cacheHits++;
        } else if (operation === 'cache_miss') {
          context.queue.metrics.cacheMisses++;
        }
      }
    } catch (error) {
      this.logger.error('Failed to update metrics', error instanceof Error ? error.stack : String(error));
    }
  }

  getPerformanceMetrics(context: any): any {
    try {
      if (!context.queue) {
        return null;
      }

      const duration = Date.now() - context.queue.startTime;
      const cacheHitRate = context.queue.metrics.cacheHits / 
                          Math.max(1, context.queue.metrics.cacheHits + context.queue.metrics.cacheMisses);

      return {
        requestId: context.queue.requestId,
        duration,
        queriesExecuted: context.queue.metrics.queriesExecuted,
        cacheHitRate,
        cacheHits: context.queue.metrics.cacheHits,
        cacheMisses: context.queue.metrics.cacheMisses,
      };
    } catch (error) {
      this.logger.error('Failed to get performance metrics', error instanceof Error ? error.stack : String(error));
      return null;
    }
  }

  private generateRequestId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}