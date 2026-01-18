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

@Injectable()
export class HealthLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HealthLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const request = ctx.getContext().req;
    const user = request?.user;
    
    const operationType = info.operation.operation;
    const fieldName = info.fieldName;
    const startTime = Date.now();
    
    // Log the incoming request
    this.logger.log(`Health ${operationType}: ${fieldName}`, {
      userId: user?.id,
      userRole: user?.roles?.[0],
      operationType,
      fieldName,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        
        // Log successful completion
        this.logger.log(`Health ${operationType} completed: ${fieldName}`, {
          userId: user?.id,
          operationType,
          fieldName,
          duration: `${duration}ms`,
          success: true,
          resultType: Array.isArray(result) ? 'array' : typeof result,
          resultCount: Array.isArray(result) ? result.length : undefined,
        });

        // Log performance warnings
        if (duration > 5000) {
          this.logger.warn(`Slow health operation detected: ${fieldName}`, {
            duration: `${duration}ms`,
            threshold: '5000ms',
            userId: user?.id,
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        // Log error details
        this.logger.error(`Health ${operationType} failed: ${fieldName}`, {
          userId: user?.id,
          operationType,
          fieldName,
          duration: `${duration}ms`,
          error: error.message,
          stack: error.stack,
          success: false,
        });

        // Log security-related errors separately
        if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
          this.logger.warn('Health security violation detected', {
            userId: user?.id,
            operation: fieldName,
            error: error.message,
            ip: request?.ip,
            userAgent: request?.headers?.['user-agent'],
          });
        }

        return throwError(() => error);
      }),
    );
  }
}