import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Simple CurrentTenant decorator that extracts tenantId from user context
 * This is a replacement for the missing tenant module decorator
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request?.user;
    
    // Try to get tenantId from user context or headers
    return user?.tenantId || request?.headers['x-tenant-id'] || '';
  },
);