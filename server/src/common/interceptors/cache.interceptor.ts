import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Cache interceptor for GraphQL responses
 * Can be extended with actual caching logic
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // For now, this is a pass-through interceptor
    // Can be extended to add caching logic in the future
    return next.handle().pipe(
      tap((data) => {
        // Caching logic can be added here
        return data;
      }),
    );
  }
}
