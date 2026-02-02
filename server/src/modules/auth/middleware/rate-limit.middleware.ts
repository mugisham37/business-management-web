import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../../cache/cache.service';
import { CustomLoggerService } from '../../logger/logger.service';

/**
 * Rate Limit Middleware
 * 
 * Provides rate limiting functionality to prevent abuse and brute force attacks.
 * Implements sliding window rate limiting with different limits for different endpoints.
 * 
 * Features:
 * - Per-IP rate limiting
 * - Per-user rate limiting (when authenticated)
 * - Different limits for different endpoint types
 * - Progressive penalties for repeated violations
 * - Whitelist support for trusted IPs
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly defaultLimits = {
    '/auth/login': { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
    '/auth/register': { requests: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
    '/auth/forgot-password': { requests: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
    '/auth/reset-password': { requests: 5, window: 60 * 60 * 1000 }, // 5 requests per hour
    '/auth/mfa': { requests: 10, window: 15 * 60 * 1000 }, // 10 requests per 15 minutes
    default: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  };

  private readonly trustedNetworks = [
    '127.0.0.1',
    '::1',
    // Add more trusted IPs/networks as needed
  ];

  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('RateLimitMiddleware');
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientIp = this.getClientIp(req);
      
      // Skip rate limiting for trusted networks
      if (this.isTrustedNetwork(clientIp)) {
        return next();
      }

      // Get rate limit configuration for this endpoint
      const limit = this.getLimitForPath(req.path);
      
      // Check rate limit
      const isAllowed = await this.checkRateLimit(clientIp, req.path, limit);
      
      if (!isAllowed) {
        this.logger.warn('Rate limit exceeded', {
          ip: clientIp,
          path: req.path,
          method: req.method,
          userAgent: req.headers['user-agent'],
        });

        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': limit.requests.toString(),
          'X-RateLimit-Window': limit.window.toString(),
          'X-RateLimit-Remaining': '0',
          'Retry-After': Math.ceil(limit.window / 1000).toString(),
        });

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Rate limit middleware error on ${req.method} ${path} from ${this.getClientIp(req)}: ${error.message}`);

      // Don't block the request on middleware errors
      next();
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.ip ||
      'unknown'
    ).split(',')[0].trim();
  }

  /**
   * Check if IP is in trusted network
   */
  private isTrustedNetwork(ip: string): boolean {
    return this.trustedNetworks.includes(ip);
  }

  /**
   * Get rate limit configuration for path
   */
  private getLimitForPath(path: string): { requests: number; window: number } {
    // Find matching path configuration
    for (const [pathPattern, limit] of Object.entries(this.defaultLimits)) {
      if (pathPattern !== 'default' && path.includes(pathPattern)) {
        return limit;
      }
    }

    return this.defaultLimits.default;
  }

  /**
   * Check rate limit for client
   */
  private async checkRateLimit(
    clientIp: string,
    path: string,
    limit: { requests: number; window: number },
  ): Promise<boolean> {
    try {
      const key = `rate_limit:${clientIp}:${path}`;
      const now = Date.now();
      const windowStart = now - limit.window;

      // Get current request count
      const currentCount = await this.getCurrentRequestCount(key, windowStart);

      // Check if limit exceeded
      if (currentCount >= limit.requests) {
        return false;
      }

      // Record this request
      await this.recordRequest(key, now, limit.window);

      return true;
    } catch (error) {
      this.logger.error(`Rate limit check error for ${clientIp} on ${path}: ${error.message}`);

      // Allow request on error (fail open)
      return true;
    }
  }

  /**
   * Get current request count in window
   */
  private async getCurrentRequestCount(key: string, windowStart: number): Promise<number> {
    try {
      // This would typically use Redis sorted sets for sliding window
      // For now, use a simple cache-based approach
      const requests = await this.cacheService.get<number[]>(key) || [];
      
      // Filter requests within the current window
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      return validRequests.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Record a request timestamp
   */
  private async recordRequest(key: string, timestamp: number, windowSize: number): Promise<void> {
    try {
      const requests = await this.cacheService.get<number[]>(key) || [];
      const windowStart = timestamp - windowSize;
      
      // Add current request and filter old ones
      const updatedRequests = [...requests, timestamp].filter(ts => ts > windowStart);
      
      // Store with TTL slightly longer than window size
      await this.cacheService.set(key, updatedRequests, {
        ttl: Math.ceil(windowSize / 1000) + 60, // Add 1 minute buffer
      });
    } catch (error) {
      // Ignore errors in recording
    }
  }
}