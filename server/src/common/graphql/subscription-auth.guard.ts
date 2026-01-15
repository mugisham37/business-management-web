import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Guard for authenticating GraphQL subscriptions over WebSocket
 * Validates JWT tokens from WebSocket connection parameters
 */
@Injectable()
export class SubscriptionAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { connection } = ctx.getContext();

    // If this is not a subscription (WebSocket), allow it
    // Regular queries/mutations are handled by JwtAuthGuard
    if (!connection) {
      return true;
    }

    // Get token from connection context
    const token = connection.context?.token || connection.context?.authorization;

    if (!token) {
      throw new Error('Missing authentication token for subscription');
    }

    try {
      // Extract token from "Bearer <token>" format if needed
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      // Verify JWT token
      const jwtSecret = this.configService.get('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(tokenValue, {
        secret: jwtSecret,
      });

      // Add user and tenant to connection context
      connection.context.user = payload;
      connection.context.tenantId = payload.tenantId;

      return true;
    } catch (error) {
      throw new Error('Invalid authentication token for subscription');
    }
  }
}

/**
 * Decorator to get current user from subscription context
 */
export const SubscriptionUser = () => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // This is handled by the subscription filter/resolve functions
    // The user is available in context.connection.context.user
  };
};

/**
 * Decorator to get current tenant from subscription context
 */
export const SubscriptionTenant = () => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // This is handled by the subscription filter/resolve functions
    // The tenantId is available in context.connection.context.tenantId
  };
};
