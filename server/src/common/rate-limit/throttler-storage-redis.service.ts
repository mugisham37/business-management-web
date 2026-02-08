import { ThrottlerStorage } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// Define the interface locally since it's not exported from the main package
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

/**
 * Redis-based storage for @nestjs/throttler
 * Implements sliding window rate limiting using Redis
 */
export class ThrottlerStorageRedisService implements ThrottlerStorage {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisDb = this.configService.get<number>('REDIS_DB', 0);

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDb,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });
  }

  /**
   * Increment the request count for a key using sliding window
   * Returns the current count and TTL
   */
  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const now = Date.now();
    const windowStart = now - ttl * 1000;

    // Use Redis sorted set for sliding window
    const redisKey = `throttle:${throttlerName}:${key}`;

    try {
      // Remove old entries outside the window
      await this.redisClient.zremrangebyscore(redisKey, 0, windowStart);

      // Add current request with timestamp as score
      await this.redisClient.zadd(redisKey, now, `${now}`);

      // Count requests in current window
      const totalHits = await this.redisClient.zcard(redisKey);

      // Set expiration on the key
      await this.redisClient.expire(redisKey, ttl);

      // Calculate time to expire (TTL in milliseconds)
      const oldestEntry = await this.redisClient.zrange(redisKey, 0, 0, 'WITHSCORES');
      const timeToExpire = oldestEntry.length > 0 
        ? Math.max(0, ttl * 1000 - (now - parseInt(oldestEntry[1])))
        : ttl * 1000;

      // Check if blocked
      const isBlocked = totalHits > limit;
      const timeToBlockExpire = isBlocked ? blockDuration * 1000 : 0;

      return {
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire,
      };
    } catch (error) {
      console.error('Error incrementing throttle key:', error);
      // Fail open - allow request if Redis is down
      return {
        totalHits: 0,
        timeToExpire: ttl * 1000,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    await this.redisClient.quit();
  }
}
