import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Interceptor to log all B2B operations for audit trail
 */
@Injectable()
export class AuditTrailInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditTrailInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const gqlContext = GqlExecutionContext.create(context);
    const { fieldName } = gqlContext.getInfo();
    const args = gqlContext.getArgs();
    const request = gqlContext.getContext().req;

    const userId = request?.user?.id || 'unknown';
    const timestamp = new Date().toISOString();

    this.logger.log(`[AUDIT] ${timestamp} - User ${userId} executing: ${fieldName}`, {
      fieldName,
      userId,
      args,
    });

    return next.handle().pipe(
      tap(
        (result) => {
          this.logger.log(`[AUDIT] ${fieldName} completed successfully for user ${userId}`);
        },
        (error) => {
          this.logger.error(`[AUDIT] ${fieldName} failed for user ${userId}:`, error);
        },
      ),
    );
  }
}
