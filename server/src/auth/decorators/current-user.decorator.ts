import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * CurrentUser Decorator
 * 
 * Extracts the authenticated user from the request context.
 * Works with both REST and GraphQL endpoints.
 * 
 * The user object is populated by JwtAuthGuard after successful authentication.
 * 
 * @example
 * ```typescript
 * @Query(() => User)
 * @UseGuards(JwtAuthGuard)
 * async me(@CurrentUser() user: any) {
 *   return this.usersService.getUserById(user.userId, user.organizationId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req.user;
    }

    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
