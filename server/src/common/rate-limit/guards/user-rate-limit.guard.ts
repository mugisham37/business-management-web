import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

/**
 * User-based rate limiting guard
 * Implements per-user rate limits for authenticated requests
 * Uses sliding window algorithm via Redis
 */
@Injectable()
export class UserRateLimitGuard extends ThrottlerGuard {
  private readonly logger = new Logger(UserRateLimitGuard.name);

  constructor(
    protected readonly options: any,
    protected readonly storageService: any,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * Get the tracking key for rate limiting
   * Uses user ID from JWT payload
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as FastifyRequest & { user?: { id: string; organizationId: string } };

    // If user is authenticated, use user ID
    if (request.user?.id) {
      return `user:${request.user.organizationId}:${request.user.id}`;
    }

    // Fallback to IP-based tracking for unauthenticated requests
    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.headers['x-real-ip']?.toString() ||
      request.ip ||
      'unknown';

    return `ip:${ip}`;
  }

  /**
   * Get throttler configuration from metadata or use defaults
   */
  protected async getThrottlerConfig(context: ExecutionContext): Promise<{
    limit: number;
    ttl: number;
  }> {
    // Check for custom throttler metadata on the route
    const customLimit = this.reflector.get<number>('throttle_limit', context.getHandler());
    const customTtl = this.reflector.get<number>('throttle_ttl', context.getHandler());

    if (customLimit !== undefined && customTtl !== undefined) {
      return { limit: customLimit, ttl: customTtl };
    }

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: any }>();

    // Authenticated users: 1000 requests per minute
    if (request.user) {
      return { limit: 1000, ttl: 60 };
    }

    // Unauthenticated: 100 requests per minute
    return { limit: 100, ttl: 60 };
  }

  /**
   * Handle rate limit exceeded
   */
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: any }>();
    const identifier = request.user?.id || this.getIpFromRequest(request);

    this.logger.warn(`Rate limit exceeded for user/IP: ${identifier} on ${request.url}`);

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please try again later.',
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  /**
   * Extract IP address from request
   */
  private getIpFromRequest(request: FastifyRequest): string {
    return (
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.headers['x-real-ip']?.toString() ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Override canActivate to use custom configuration
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { limit, ttl } = await this.getThrottlerConfig(context);
    const tracker = await this.getTracker(context.switchToHttp().getRequest());

    try {
      const result = await this.storageService.increment(tracker, ttl, limit, ttl, 'user-rate-limit');

      if (result.totalHits > limit) {
        await this.throwThrottlingException(context);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Fail open - allow request if rate limiting fails
      this.logger.error('Rate limiting error:', error);
      return true;
    }
  }
}
