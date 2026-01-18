import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map, timeout, retry } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { 
  QUEUE_AUDIT_KEY, 
  QUEUE_CACHE_KEY, 
  QUEUE_MONITORING_KEY,
  QUEUE_RETRY_KEY 
} from '../decorators/queue.decorators';
import { CustomLoggerService } from '../../logger/logger.service';
import { CacheService } from '../../cache/cache.service';
import { RealtimeService } from '../../realtime/services/realtime.service';
import { randomUUID } from 'crypto';

@Injectable()
export class QueueAuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueAuditInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.getAllAndOverride<any>(QUEUE_AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditOptions) {
      return next.handle();
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();
    const user = request.user;
    const startTime = Date.now();
    const auditId = randomUUID();

    const auditData = {
      auditId,
      action: auditOptions.action,
      resource: auditOptions.resource,
      userId: user?.id,
      tenantId: user?.tenantId || request.tenant,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      correlationId: request.get('X-Correlation-ID') || request.correlationId,
      timestamp: new Date(),
      handler: context.getHandler().name,
      class: context.getClass().name,
    };

    // Include request data if configured
    if (auditOptions.includeRequest) {
      auditData['requestData'] = this.sanitizeData(args, auditOptions.sensitiveFields);
    }

    this.logger.log('Queue operation audit started', auditData);

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        
        const completedAuditData = {
          ...auditData,
          status: 'success',
          duration,
          completedAt: new Date(),
        };

        // Include response data if configured
        if (auditOptions.includeResponse) {
          completedAuditData['responseData'] = this.sanitizeData(response, auditOptions.sensitiveFields);
        }

        this.logger.log('Queue operation audit completed', completedAuditData);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        const failedAuditData = {
          ...auditData,
          status: 'error',
          duration,
          error: error.message,
          errorStack: error.stack,
          completedAt: new Date(),
        };

        this.logger.error('Queue operation audit failed', error.stack, failedAuditData);
        
        return throwError(() => error);
      }),
    );
  }

  private sanitizeData(data: any, sensitiveFields: string[] = []): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Remove sensitive fields
    for (const field of sensitiveFields) {
      this.removeSensitiveField(sanitized, field);
    }

    return sanitized;
  }

  private removeSensitiveField(obj: any, fieldPath: string): void {
    const parts = fieldPath.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]]) {
        current = current[parts[i]];
      } else {
        return;
      }
    }

    if (current && current[parts[parts.length - 1]]) {
      current[parts[parts.length - 1]] = '[REDACTED]';
    }
  }
}

@Injectable()
export class QueueCacheInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
    private cacheService?: CacheService,
  ) {
    this.logger.setContext('QueueCacheInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.cacheService) {
      return next.handle();
    }

    const cacheOptions = this.reflector.getAllAndOverride<any>(QUEUE_CACHE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!cacheOptions) {
      return next.handle();
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();
    const user = request.user;

    const cacheKey = this.generateCacheKey(cacheOptions, args, user, context);

    return new Observable((observer) => {
      // Try to get from cache first
      this.cacheService.get(cacheKey).then((cachedResult) => {
        if (cachedResult !== null) {
          this.logger.debug('Queue cache hit', { cacheKey });
          observer.next(cachedResult);
          observer.complete();
          return;
        }

        // Cache miss, execute handler
        this.logger.debug('Queue cache miss', { cacheKey });
        
        next.handle().subscribe({
          next: (result) => {
            // Cache the result
            this.cacheService.set(cacheKey, result, cacheOptions.ttl).catch((error) => {
              this.logger.warn('Failed to cache queue result', { error: error.message, cacheKey });
            });

            // Tag the cache entry for invalidation
            if (cacheOptions.tags) {
              this.tagCacheEntry(cacheKey, cacheOptions.tags);
            }

            observer.next(result);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          },
        });
      }).catch((error) => {
        this.logger.warn('Cache lookup failed, proceeding without cache', { error: error.message, cacheKey });
        
        // Fallback to executing handler without cache
        next.handle().subscribe({
          next: (result) => observer.next(result),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      });
    });
  }

  private generateCacheKey(cacheOptions: any, args: any, user: any, context: ExecutionContext): string {
    if (cacheOptions.key) {
      return cacheOptions.key;
    }

    const handler = context.getHandler().name;
    const className = context.getClass().name;
    const argsHash = this.hashArgs(args);
    const userContext = user?.id || 'anonymous';
    const tenantContext = user?.tenantId || 'default';

    return `queue:${className}:${handler}:${tenantContext}:${userContext}:${argsHash}`;
  }

  private hashArgs(args: any): string {
    // Simple hash of arguments for cache key
    const argsString = JSON.stringify(args);
    let hash = 0;
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async tagCacheEntry(cacheKey: string, tags: string[]): Promise<void> {
    try {
      // Store cache tags for invalidation
      for (const tag of tags) {
        const tagKey = `cache:tag:${tag}`;
        await this.cacheService.sadd(tagKey, cacheKey);
        await this.cacheService.expire(tagKey, 3600); // Expire tags after 1 hour
      }
    } catch (error) {
      this.logger.warn('Failed to tag cache entry', { error: error.message, cacheKey, tags });
    }
  }
}

@Injectable()
export class QueueMonitoringInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
    private realtimeService?: RealtimeService,
  ) {
    this.logger.setContext('QueueMonitoringInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const monitoringOptions = this.reflector.getAllAndOverride<any>(QUEUE_MONITORING_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!monitoringOptions) {
      return next.handle();
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;
    const startTime = Date.now();
    const operationId = randomUUID();

    const monitoringData = {
      operationId,
      handler: context.getHandler().name,
      class: context.getClass().name,
      userId: user?.id,
      tenantId: user?.tenantId || request.tenant,
      timestamp: new Date(),
      startTime,
    };

    if (monitoringOptions.trackPerformance) {
      this.logger.debug('Queue operation started', monitoringData);
    }

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        
        if (monitoringOptions.trackPerformance) {
          const performanceData = {
            ...monitoringData,
            duration,
            status: 'success',
            completedAt: new Date(),
          };

          this.logger.log('Queue operation completed', performanceData);
          
          // Send real-time performance metrics
          if (this.realtimeService && user?.tenantId) {
            this.realtimeService.sendMetrics(user.tenantId, {
              type: 'queue_operation_performance',
              data: performanceData,
            }).catch((error) => {
              this.logger.warn('Failed to send real-time performance metrics', { error: error.message });
            });
          }
        }

        if (monitoringOptions.trackUsage) {
          this.trackUsage(monitoringData, 'success');
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        if (monitoringOptions.trackErrors) {
          const errorData = {
            ...monitoringData,
            duration,
            status: 'error',
            error: error.message,
            errorType: error.constructor.name,
            completedAt: new Date(),
          };

          this.logger.error('Queue operation failed', error.stack, errorData);
          
          // Send real-time error alerts
          if (this.realtimeService && user?.tenantId) {
            this.realtimeService.sendAlert(user.tenantId, {
              type: 'queue_operation_error',
              severity: 'error',
              message: `Queue operation failed: ${error.message}`,
              data: errorData,
            }).catch((alertError) => {
              this.logger.warn('Failed to send real-time error alert', { error: alertError.message });
            });
          }
        }

        if (monitoringOptions.trackUsage) {
          this.trackUsage(monitoringData, 'error');
        }

        if (monitoringOptions.alertOnFailure) {
          this.handleFailureAlert(monitoringData, error, monitoringOptions.alertThreshold);
        }

        return throwError(() => error);
      }),
    );
  }

  private trackUsage(monitoringData: any, status: string): void {
    // Track usage statistics
    const usageKey = `queue:usage:${monitoringData.class}:${monitoringData.handler}:${status}`;
    
    // In a real implementation, you would increment counters in Redis or a metrics system
    this.logger.debug('Tracking queue usage', {
      key: usageKey,
      ...monitoringData,
      status,
    });
  }

  private async handleFailureAlert(monitoringData: any, error: any, threshold?: number): Promise<void> {
    if (!threshold) {
      return;
    }

    const failureKey = `queue:failures:${monitoringData.class}:${monitoringData.handler}`;
    
    try {
      // In a real implementation, you would track failure counts and send alerts
      // when the threshold is exceeded
      this.logger.warn('Queue operation failure alert', {
        ...monitoringData,
        error: error.message,
        threshold,
      });

      // Send alert to monitoring system or notification service
      if (this.realtimeService && monitoringData.tenantId) {
        await this.realtimeService.sendAlert(monitoringData.tenantId, {
          type: 'queue_failure_threshold',
          severity: 'warning',
          message: `Queue operation ${monitoringData.handler} has exceeded failure threshold`,
          data: {
            ...monitoringData,
            error: error.message,
            threshold,
          },
        });
      }
    } catch (alertError) {
      this.logger.error('Failed to handle failure alert', alertError);
    }
  }
}

@Injectable()
export class QueueRetryInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueRetryInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const retryOptions = this.reflector.getAllAndOverride<any>(QUEUE_RETRY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!retryOptions) {
      return next.handle();
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    const retryData = {
      handler: context.getHandler().name,
      userId: user?.id,
      tenantId: user?.tenantId || request.tenant,
      maxAttempts: retryOptions.maxAttempts,
      backoffStrategy: retryOptions.backoffStrategy,
      baseDelay: retryOptions.baseDelay,
    };

    this.logger.debug('Queue retry interceptor active', retryData);

    return next.handle().pipe(
      retry({
        count: retryOptions.maxAttempts - 1, // -1 because the first attempt is not a retry
        delay: (error, retryCount) => {
          const delay = this.calculateDelay(retryOptions, retryCount);
          
          this.logger.warn('Queue operation retry', {
            ...retryData,
            retryCount,
            delay,
            error: error.message,
          });

          return delay;
        },
      }),
      catchError((error) => {
        this.logger.error('Queue operation failed after all retries', error.stack, {
          ...retryData,
          finalError: error.message,
        });
        
        return throwError(() => error);
      }),
    );
  }

  private calculateDelay(retryOptions: any, retryCount: number): number {
    const { backoffStrategy, baseDelay, maxDelay = 30000 } = retryOptions;

    let delay: number;

    switch (backoffStrategy) {
      case 'fixed':
        delay = baseDelay;
        break;
      case 'linear':
        delay = baseDelay * retryCount;
        break;
      case 'exponential':
      default:
        delay = baseDelay * Math.pow(2, retryCount - 1);
        break;
    }

    // Apply jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    delay += jitter;

    // Respect maximum delay
    return Math.min(delay, maxDelay);
  }
}

@Injectable()
export class QueueTimeoutInterceptor implements NestInterceptor {
  constructor(
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueTimeoutInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    
    // Extract timeout from job options or use default
    const timeoutMs = this.extractTimeout(args) || 300000; // 5 minutes default

    const operationData = {
      handler: context.getHandler().name,
      timeout: timeoutMs,
    };

    this.logger.debug('Queue timeout interceptor active', operationData);

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          this.logger.error('Queue operation timed out', undefined, {
            ...operationData,
            actualTimeout: timeoutMs,
          });
          
          // Transform timeout error to a more user-friendly message
          const timeoutError = new Error(`Queue operation timed out after ${timeoutMs}ms`);
          timeoutError.name = 'QueueTimeoutError';
          return throwError(() => timeoutError);
        }
        
        return throwError(() => error);
      }),
    );
  }

  private extractTimeout(args: any): number | null {
    // Look for timeout in various argument structures
    return args.options?.timeout || 
           args.input?.options?.timeout || 
           args.timeout || 
           null;
  }
}

@Injectable()
export class QueueTransformInterceptor implements NestInterceptor {
  constructor(
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('QueueTransformInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    return next.handle().pipe(
      map((response) => {
        // Transform response to include additional metadata
        if (response && typeof response === 'object') {
          return this.transformResponse(response, user, context);
        }
        
        return response;
      }),
    );
  }

  private transformResponse(response: any, user: any, context: ExecutionContext): any {
    const handler = context.getHandler().name;
    
    // Add metadata to queue operations
    if (this.isQueueResponse(response)) {
      return {
        ...response,
        metadata: {
          requestedBy: user?.id,
          requestedAt: new Date(),
          handler,
          version: '1.0.0',
        },
      };
    }

    return response;
  }

  private isQueueResponse(response: any): boolean {
    // Check if response is a queue-related object
    return response && (
      response.jobs || 
      response.queues || 
      response.job || 
      response.queue ||
      response.success !== undefined
    );
  }
}