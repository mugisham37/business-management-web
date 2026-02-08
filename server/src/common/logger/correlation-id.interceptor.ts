import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from './logger.service';

/**
 * Correlation ID Interceptor
 * 
 * Automatically injects correlation IDs into all requests and makes them
 * available throughout the request lifecycle via AsyncLocalStorage.
 * 
 * Features:
 * - Generates unique correlation ID for each request
 * - Accepts existing correlation ID from X-Correlation-ID header
 * - Makes correlation ID available to all loggers in the request context
 * - Adds correlation ID to response headers
 * 
 * Usage:
 * Apply globally in main.ts:
 * ```typescript
 * app.useGlobalInterceptors(new CorrelationIdInterceptor());
 * ```
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get or generate correlation ID
    const correlationId = 
      request.headers['x-correlation-id'] || 
      request.headers['x-request-id'] ||
      uuidv4();

    // Set correlation ID in response headers
    response.setHeader('X-Correlation-ID', correlationId);

    // Extract user and organization context if available
    const user = request.user;
    const logContext = {
      correlationId,
      userId: user?.id,
      organizationId: user?.organizationId,
    };

    // Run the request handler with the correlation context
    return new Observable(subscriber => {
      LoggerService.runWithContext(logContext, () => {
        next.handle()
          .pipe(
            tap({
              next: () => {
                // Request completed successfully
              },
              error: (error) => {
                // Request failed - correlation ID is already in context
                // Error will be logged by exception filter with correlation ID
              },
            })
          )
          .subscribe(subscriber);
      });
    });
  }
}
