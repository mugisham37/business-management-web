import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();

    // Increment request count
    this.metricsService.incrementRequestCount();

    return next.handle().pipe(
      tap(() => {
        // Record response time on success
        const responseTime = Date.now() - startTime;
        this.metricsService.recordResponseTime(responseTime);
      }),
      catchError((error) => {
        // Increment error count on failure
        this.metricsService.incrementErrorCount();

        // Record response time even on error
        const responseTime = Date.now() - startTime;
        this.metricsService.recordResponseTime(responseTime);

        return throwError(() => error);
      }),
    );
  }
}
