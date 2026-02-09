import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient!: Redis;
  private redisPubClient!: Redis;
  private redisSubClient!: Redis;
  private l1Cache: Map<string, CacheEntry<any>> = new Map();
  private readonly L1_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly L2_TTL_SECONDS = 15 * 60; // 15 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    process.stdout.write('[DEBUG] CacheService.onModuleInit START\n');
    await this.connect();
    process.stdout.write('[DEBUG] CacheService.onModuleInit CONNECTED\n');
    this.startL1Cleanup();
    process.stdout.write('[DEBUG] CacheService.onModuleInit DONE\n');
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect to Redis with connection pooling and error handling
   */
  private async connect(): Promise<void> {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisDb = this.configService.get<number>('REDIS_DB', 0);

    const redisConfig = {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDb,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    };

    try {
      // Main Redis client for get/set operations
      this.redisClient = new Redis(redisConfig);

      // Separate clients for pub/sub (Redis requirement)
      this.redisPubClient = new Redis(redisConfig);
      this.redisSubClient = new Redis(redisConfig);

      // Error handlers
      this.redisClient.on('error', (err) => {
        this.logger.error('Redis client error:', err);
      });

      this.redisPubClient.on('error', (err) => {
        this.logger.error('Redis pub client error:', err);
      });

      this.redisSubClient.on('error', (err) => {
        this.logger.error('Redis sub client error:', err);
      });

      // Connection success handlers
      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.redisPubClient.on('connect', () => {
        this.logger.log('Redis pub client connected');
      });

      this.redisSubClient.on('connect', () => {
        this.logger.log('Redis sub client connected');
      });

      // Wait for connections to be ready
      await Promise.all([
        this.redisClient.ping(),
        this.redisPubClient.ping(),
        this.redisSubClient.ping(),
      ]);

      this.logger.log('All Redis connections established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  private async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    try {
      await Promise.all([
        this.redisClient?.quit(),
        this.redisPubClient?.quit(),
        this.redisSubClient?.quit(),
      ]);
      this.logger.log('Redis connections closed');
    } catch (error) {
      this.logger.error('Error closing Redis connections:', error);
    }
  }

  /**
   * Start periodic cleanup of expired L1 cache entries
   */
  private startL1Cleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.l1Cache.entries()) {
        if (entry.expiresAt <= now) {
          this.l1Cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        this.logger.debug(`Cleaned ${cleaned} expired L1 cache entries`);
      }
    }, 60000); // Run every minute
  }

  /**
   * Get value from cache (L1 → L2 → null)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check L1 cache first
      const l1Entry = this.l1Cache.get(key);
      if (l1Entry) {
        if (l1Entry.expiresAt > Date.now()) {
          this.logger.debug(`L1 cache hit: ${key}`);
          return l1Entry.value as T;
        } else {
          // Expired, remove from L1
          this.l1Cache.delete(key);
        }
      }

      // Check L2 cache (Redis)
      const l2Value = await this.redisClient.get(key);
      if (l2Value !== null) {
        this.logger.debug(`L2 cache hit: ${key}`);
        const parsed = JSON.parse(l2Value) as T;

        // Populate L1 cache
        this.l1Cache.set(key, {
          value: parsed,
          expiresAt: Date.now() + this.L1_TTL_MS,
        });

        return parsed;
      }

      this.logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in both L1 and L2 cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const l1Ttl = ttl ? Math.min(ttl * 1000, this.L1_TTL_MS) : this.L1_TTL_MS;
      const l2Ttl = ttl || this.L2_TTL_SECONDS;

      // Store in L1 cache
      this.l1Cache.set(key, {
        value,
        expiresAt: Date.now() + l1Ttl,
      });

      // Store in L2 cache (Redis)
      const serialized = JSON.stringify(value);
      await this.redisClient.setex(key, l2Ttl, serialized);

      this.logger.debug(`Cache set: ${key} (L1 TTL: ${l1Ttl}ms, L2 TTL: ${l2Ttl}s)`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete key from both L1 and L2 cache
   */
  async del(key: string): Promise<void> {
    try {
      // Delete from L1
      this.l1Cache.delete(key);

      // Delete from L2
      await this.redisClient.del(key);

      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete keys matching a pattern from both L1 and L2 cache
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // Delete from L1 cache
      const l1Keys = Array.from(this.l1Cache.keys());
      const regex = this.patternToRegex(pattern);
      let l1Deleted = 0;

      for (const key of l1Keys) {
        if (regex.test(key)) {
          this.l1Cache.delete(key);
          l1Deleted++;
        }
      }

      // Delete from L2 cache (Redis)
      const l2Keys = await this.redisClient.keys(pattern);
      if (l2Keys.length > 0) {
        await this.redisClient.del(...l2Keys);
      }

      this.logger.debug(
        `Cache pattern deleted: ${pattern} (L1: ${l1Deleted}, L2: ${l2Keys.length})`,
      );
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Publish cache invalidation event
   */
  async publish(channel: string, message: any): Promise<void> {
    try {
      const serialized = JSON.stringify(message);
      await this.redisPubClient.publish(channel, serialized);
      this.logger.debug(`Published to channel ${channel}:`, message);
    } catch (error) {
      this.logger.error(`Error publishing to channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to cache invalidation events
   */
  subscribe(channel: string, handler: (message: any) => void): void {
    try {
      if (!this.redisSubClient) {
        this.logger.error(`Error setting up subscription for channel ${channel}: Redis subscriber not initialized`);
        return;
      }
      this.redisSubClient.subscribe(channel, (err) => {
        if (err) {
          this.logger.error(`Error subscribing to channel ${channel}:`, err);
          return;
        }
        this.logger.log(`Subscribed to channel: ${channel}`);
      });

      this.redisSubClient.on('message', (ch, msg) => {
        if (ch === channel) {
          try {
            const parsed = JSON.parse(msg);
            handler(parsed);
          } catch (error) {
            this.logger.error(`Error parsing message from channel ${channel}:`, error);
          }
        }
      });
    } catch (error) {
      this.logger.error(`Error setting up subscription for channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Convert glob pattern to regex
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Get Redis client for advanced operations
   */
  getRedisClient(): Redis {
    return this.redisClient;
  }

  /**
   * Clear all cache (L1 and L2) - use with caution
   */
  async clear(): Promise<void> {
    try {
      this.l1Cache.clear();
      await this.redisClient.flushdb();
      this.logger.warn('All cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      throw error;
    }
  }
}
