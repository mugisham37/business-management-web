import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    
    // Check if this is an authentication-related mutation
    const authMutations = [
      'login',
      'loginWithGoogle',
      'verifyMFA',
      'requestPasswordReset',
      'resetPassword',
      'registerOrganization',
    ];

    const isAuthEndpoint = authMutations.includes(info?.fieldName);

    // Use stricter rate limiting for auth endpoints
    if (isAuthEndpoint) {
      // Override the throttler options for auth endpoints
      const request = this.getRequestResponse(context).req;
      const tracker = await this.getTracker(request);
      const key = this.generateKey(context, tracker, 'auth');
      const { totalHits } = await this.storageService.increment(
        key,
        900, // 15 minutes in seconds
        5, // 5 requests limit
        60, // block duration in seconds
        'auth',
      );

      if (totalHits > 5) {
        const response = this.getRequestResponse(context).res;
        response.header('Retry-After', '900'); // 15 minutes in seconds
        throw new ThrottlerException('Too many authentication attempts. Please try again later.');
      }

      return true;
    }

    // Use default rate limiting for other endpoints
    return super.canActivate(context);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address as the tracker
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  protected getRequestResponse(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
