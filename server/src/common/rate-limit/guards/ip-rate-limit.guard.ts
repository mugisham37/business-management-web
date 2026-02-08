import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';

/**
 * IP-based rate limiting guard
 * Implements per-endpoint rate limits based on IP address
 * Uses sliding window algorithm via Redis
 */
@Injectable()
export class IpRateLimitGuard extends ThrottlerGuard {
  private readonly logger = new Logger(IpRateLimitGuard.name);

  constructor(
    protected readonly options: any,
    protected readonly storageService: any,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * Get the tracking key for rate limiting
   * Uses IP address as the key
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as FastifyRequest;
    
    // Try to get real IP from headers (for proxies/load balancers)
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

    // Get endpoint-specific defaults
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const path = request.url;

    // Login endpoints: 10 requests per minute
    if (path.includes('/auth/login')) {
      return { limit: 10, ttl: 60 };
    }

    // General endpoints: 100 requests per minute
    return { limit: 100, ttl: 60 };
  }

  /**
   * Handle rate limit exceeded
   */
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const ip = this.getIpFromRequest(request);

    this.logger.warn(`Rate limit exceeded for IP: ${ip} on ${request.url}`);

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
      const result = await this.storageService.increment(tracker, ttl, limit, ttl, 'ip-rate-limit');

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
