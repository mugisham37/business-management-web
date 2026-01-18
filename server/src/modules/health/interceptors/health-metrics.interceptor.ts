import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface HealthOperationMetric {
  operationType: string;
  fieldName: string;
  userId?: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  error?: string;
  resultSize?: number;
}

@Injectable()
export class HealthMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HealthMetricsInterceptor.name);
  private operationMetrics: HealthOperationMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 operations

  constructor(private readonly eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const request = ctx.getContext().req;
    const user = request?.user;
    
    const operationType = info.operation.operation;
    const fieldName = info.fieldName;
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        const resultSize = this.calculateResultSize(result);
        
        const metric: HealthOperationMetric = {
          operationType,
          fieldName,
          userId: user?.id,
          duration,
          success: true,
          timestamp: new Date(),
          resultSize,
        };

        this.recordMetric(metric);
        this.emitMetricEvent(metric);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        const metric: HealthOperationMetric = {
          operationType,
          fieldName,
          userId: user?.id,
          duration,
          success: false,
          timestamp: new Date(),
          error: error.message,
        };

        this.recordMetric(metric);
        this.emitMetricEvent(metric);

        return throwError(() => error);
      }),
    );
  }

  private calculateResultSize(result: any): number {
    if (Array.isArray(result)) {
      return result.length;
    }
    if (typeof result === 'object' && result !== null) {
      return Object.keys(result).length;
    }
    return 1;
  }

  private recordMetric(metric: HealthOperationMetric): void {
    this.operationMetrics.unshift(metric);
    
    // Keep only the last N metrics
    if (this.operationMetrics.length > this.maxMetrics) {
      this.operationMetrics = this.operationMetrics.slice(0, this.maxMetrics);
    }

    // Log performance issues
    if (metric.duration > 3000) {
      this.logger.warn(`Slow health operation: ${metric.fieldName}`, {
        duration: metric.duration,
        operationType: metric.operationType,
        userId: metric.userId,
      });
    }

    // Log error patterns
    if (!metric.success) {
      this.logger.error(`Health operation failed: ${metric.fieldName}`, {
        error: metric.error,
        duration: metric.duration,
        userId: metric.userId,
      });
    }
  }

  private emitMetricEvent(metric: HealthOperationMetric): void {
    this.eventEmitter.emit('health.operation.metric', metric);
    
    // Emit specific events for monitoring
    if (metric.duration > 5000) {
      this.eventEmitter.emit('health.operation.slow', metric);
    }
    
    if (!metric.success) {
      this.eventEmitter.emit('health.operation.error', metric);
    }
  }

  getOperationMetrics(hours: number = 1): HealthOperationMetric[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.operationMetrics.filter(m => m.timestamp.getTime() >= cutoffTime);
  }

  getOperationStats(hours: number = 1): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageDuration: number;
    slowOperations: number;
    operationsByType: Record<string, number>;
    operationsByField: Record<string, number>;
  } {
    const metrics = this.getOperationMetrics(hours);
    
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        slowOperations: 0,
        operationsByType: {},
        operationsByField: {},
      };
    }

    const successfulOperations = metrics.filter(m => m.success).length;
    const failedOperations = metrics.length - successfulOperations;
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const slowOperations = metrics.filter(m => m.duration > 3000).length;

    const operationsByType: Record<string, number> = {};
    const operationsByField: Record<string, number> = {};

    metrics.forEach(metric => {
      operationsByType[metric.operationType] = (operationsByType[metric.operationType] || 0) + 1;
      operationsByField[metric.fieldName] = (operationsByField[metric.fieldName] || 0) + 1;
    });

    return {
      totalOperations: metrics.length,
      successfulOperations,
      failedOperations,
      averageDuration: totalDuration / metrics.length,
      slowOperations,
      operationsByType,
      operationsByField,
    };
  }

  getTopSlowOperations(limit: number = 10): HealthOperationMetric[] {
    return [...this.operationMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getErrorOperations(hours: number = 1): HealthOperationMetric[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.operationMetrics.filter(m => 
      !m.success && m.timestamp.getTime() >= cutoffTime
    );
  }

  getUserOperationStats(userId: string, hours: number = 1): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageDuration: number;
  } {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const userMetrics = this.operationMetrics.filter(m => 
      m.userId === userId && m.timestamp.getTime() >= cutoffTime
    );

    if (userMetrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
      };
    }

    const successfulOperations = userMetrics.filter(m => m.success).length;
    const totalDuration = userMetrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      totalOperations: userMetrics.length,
      successfulOperations,
      failedOperations: userMetrics.length - successfulOperations,
      averageDuration: totalDuration / userMetrics.length,
    };
  }

  clearMetrics(): void {
    this.operationMetrics = [];
    this.logger.log('Health operation metrics cleared');
  }

  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'timestamp,operationType,fieldName,userId,duration,success,error,resultSize\n';
      const rows = this.operationMetrics.map(m => 
        `${m.timestamp.toISOString()},${m.operationType},${m.fieldName},${m.userId || ''},${m.duration},${m.success},${m.error || ''},${m.resultSize || ''}`
      ).join('\n');
      return headers + rows;
    }

    return JSON.stringify(this.operationMetrics, null, 2);
  }
}