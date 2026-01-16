import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Local Authentication Guard for REST endpoints
 * Validates email/password credentials
 * Used for login endpoints
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  override getRequest(context: ExecutionContext) {
    // Handle both REST and GraphQL contexts
    const ctx = context.getType<string>();
    
    if (ctx === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;
    }
    
    // For REST
    return context.switchToHttp().getRequest();
  }
}
