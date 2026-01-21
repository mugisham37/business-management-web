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
 * Interceptor to handle approval workflow validation and pre/post processing
 */
@Injectable()
export class ApprovalWorkflowInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApprovalWorkflowInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const gqlContext = GqlExecutionContext.create(context);
    const { fieldName } = gqlContext.getInfo();

    this.logger.debug(`Processing approval workflow for field: ${fieldName}`);

    return next.handle().pipe(
      tap((result) => {
        this.logger.debug(`Approval workflow processing completed for field: ${fieldName}`);
      }),
    );
  }
}
