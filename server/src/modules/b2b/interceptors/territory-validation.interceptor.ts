import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Interceptor to validate territory access and restrictions
 */
@Injectable()
export class TerritoryValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TerritoryValidationInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const gqlContext = GqlExecutionContext.create(context);
    const { fieldName } = gqlContext.getInfo();
    const args = gqlContext.getArgs();

    this.logger.debug(`Validating territory access for field: ${fieldName}`);

    // Territory validation logic would go here
    // Check if user has access to the territory they're trying to modify

    return next.handle().pipe(
      tap((result) => {
        this.logger.debug(`Territory validation completed for field: ${fieldName}`);
      }),
    );
  }
}
