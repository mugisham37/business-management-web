import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

/**
 * Service for managing rate limits and brute force protection
 * Implements progressive delays and account lockout
 */
@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  // Rate limit configuration
  private readonly LOGIN_RATE_LIMIT = 10; // 10 attempts per minute
  private readonly GENERAL_RATE_LIMIT = 100; // 100 requests per minute
  private readonly AUTHENTICATED_RATE_LIMIT = 1000; // 1000 requests per minute

  // Brute force protection configuration
  private readonly PROGRESSIVE_DELAY_THRESHOLD = 5; // Start delays after 5 failures
  private readonly ACCOUNT_LOCK_THRESHOLD = 10; // Lock account after 10 failures
  private readonly ACCOUNT_LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Track a failed login attempt for a user
   * Returns the number of failed attempts
   */
  async trackFailedLogin(identifier: string): Promise<number> {
    const key = `failed_login:${identifier}`;
    const redisClient = this.cacheService.getRedisClient();

    try {
      // Increment counter with 1 hour expiry
      const count = await redisClient.incr(key);
      await redisClient.expire(key, 3600); // 1 hour

      this.logger.warn(`Failed login attempt for ${identifier}: ${count} attempts`);

      return count;
    } catch (error) {
      this.logger.error(`Error tracking failed login for ${identifier}:`, error);
      return 0;
    }
  }

  /**
   * Reset failed login attempts for a user (on successful login)
   */
  async resetFailedLogins(identifier: string): Promise<void> {
    const key = `failed_login:${identifier}`;
    const redisClient = this.cacheService.getRedisClient();

    try {
      await redisClient.del(key);
      this.logger.debug(`Reset failed login attempts for ${identifier}`);
    } catch (error) {
      this.logger.error(`Error resetting failed logins for ${identifier}:`, error);
    }
  }

  /**
   * Get the number of failed login attempts for a user
   */
  async getFailedLoginCount(identifier: string): Promise<number> {
    const key = `failed_login:${identifier}`;
    const redisClient = this.cacheService.getRedisClient();

    try {
      const count = await redisClient.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      this.logger.error(`Error getting failed login count for ${identifier}:`, error);
      return 0;
    }
  }

  /**
   * Calculate progressive delay based on failed attempts
   * Returns delay in milliseconds
   * Delays: 1s, 2s, 4s, 8s, 16s after 5 failures
   */
  calculateProgressiveDelay(failedAttempts: number): number {
    if (failedAttempts < this.PROGRESSIVE_DELAY_THRESHOLD) {
      return 0;
    }

    // Calculate exponential delay: 2^(attempts - threshold) seconds
    const delaySeconds = Math.pow(2, failedAttempts - this.PROGRESSIVE_DELAY_THRESHOLD);
    const delayMs = Math.min(delaySeconds * 1000, 16000); // Cap at 16 seconds

    return delayMs;
  }

  /**
   * Check if account should be locked based on failed attempts
   */
  shouldLockAccount(failedAttempts: number): boolean {
    return failedAttempts >= this.ACCOUNT_LOCK_THRESHOLD;
  }

  /**
   * Lock an account temporarily
   */
  async lockAccount(userId: string, reason: string): Promise<void> {
    const key = `account_lock:${userId}`;
    const redisClient = this.cacheService.getRedisClient();

    try {
      const lockData = {
        lockedAt: new Date().toISOString(),
        reason,
        expiresAt: new Date(Date.now() + this.ACCOUNT_LOCK_DURATION_MS).toISOString(),
      };

      await redisClient.setex(
        key,
        Math.floor(this.ACCOUNT_LOCK_DURATION_MS / 1000),
        JSON.stringify(lockData),
      );

      this.logger.warn(`Account locked: ${userId} - ${reason}`);
    } catch (error) {
      this.logger.error(`Error locking account ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if an account is locked
   * Returns lock information if locked, null otherwise
   */
  async isAccountLocked(userId: string): Promise<{
    locked: boolean;
    reason?: string;
    expiresAt?: string;
  }> {
    const key = `account_lock:${userId}`;
    const redisClient = this.cacheService.getRedisClient();

    try {
      const lockData = await redisClient.get(key);

      if (!lockData) {
        return { locked: false };
      }

      const parsed = JSON.parse(lockData);
      return {
        locked: true,
        reason: parsed.reason,
        expiresAt: parsed.expiresAt,
      };
    } catch (error) {
      this.logger.error(`Error checking account lock for ${userId}:`, error);
      return { locked: false };
    }
  }

  /**
   * Unlock an account manually
   */
  async unlockAccount(userId: string): Promise<void> {
    const key = `account_lock:${userId}`;
    const redisClient = this.cacheService.getRedisClient();

    try {
      await redisClient.del(key);
      this.logger.log(`Account unlocked: ${userId}`);
    } catch (error) {
      this.logger.error(`Error unlocking account ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Apply progressive delay (sleep)
   */
  async applyProgressiveDelay(delayMs: number): Promise<void> {
    if (delayMs > 0) {
      this.logger.debug(`Applying progressive delay: ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  /**
   * Get rate limit configuration for endpoint type
   */
  getRateLimitConfig(endpointType: 'login' | 'general' | 'authenticated'): {
    limit: number;
    ttl: number;
  } {
    switch (endpointType) {
      case 'login':
        return { limit: this.LOGIN_RATE_LIMIT, ttl: 60 };
      case 'authenticated':
        return { limit: this.AUTHENTICATED_RATE_LIMIT, ttl: 60 };
      case 'general':
      default:
        return { limit: this.GENERAL_RATE_LIMIT, ttl: 60 };
    }
  }
}
