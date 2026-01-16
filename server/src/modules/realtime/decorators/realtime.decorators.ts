import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Extract WebSocket connection from GraphQL context
 */
export const WebSocketConnection = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    return gqlContext.connection || gqlContext.req?.connection;
  },
);

/**
 * Extract subscription filter data from GraphQL context
 */
export const SubscriptionFilter = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const filterData = gqlContext.subscriptionFilter || {};
    return data ? filterData[data] : filterData;
  },
);

/**
 * Extract real-time session info from context
 */
export const RealtimeSession = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    return {
      connectionId: gqlContext.connectionId,
      connectedAt: gqlContext.connectedAt,
      lastActivity: gqlContext.lastActivity,
      rooms: gqlContext.rooms || [],
    };
  },
);

/**
 * Check if request is from WebSocket subscription
 */
export const IsSubscription = createParamDecorator(
  (data: unknown, context: ExecutionContext): boolean => {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    return info?.operation?.operation === 'subscription';
  },
);
