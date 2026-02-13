import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import Redis from 'ioredis';

export interface SessionMetadata {
  sessionId: string;
  userId: string;
  organizationId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: Date;
  createdAt: Date;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly PERMISSION_TTL = 3600; // 1 hour in seconds
  private readonly SESSION_TTL = 604800; // 7 days in seconds
  private subscriber: Redis | null = null;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    // Initialize subscriber for pub/sub
    if (this.redisService.isAvailable()) {
      try {
        this.subscriber = this.redisService.getClient().duplicate();
        await this.subscriber.connect();
        this.logger.log('Redis subscriber initialized for pub/sub');
      } catch (error) {
        this.logger.error('Failed to initialize Redis subscriber:', error);
      }
    }
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      await this.subscriber.quit();
    }
  }

  /**
   * Generic Operations
   */

  async get<T>(key: string): Promise<T | null> {
    if (!this.redisService.isAvailable()) {
      this.logger.warn('Redis unavailable, returning null for get operation');
      return null;
    }

    try {
      const value = await this.redisService.getClient().get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.redisService.isAvailable()) {
      this.logger.warn('Redis unavailable, skipping set operation');
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisService.getClient().setex(key, ttlSeconds, serialized);
      } else {
        await this.redisService.getClient().set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redisService.isAvailable()) {
      this.logger.warn('Redis unavailable, skipping delete operation');
      return;
    }

    try {
      await this.redisService.getClient().del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.redisService.isAvailable()) {
      this.logger.warn('Redis unavailable, skipping deletePattern operation');
      return;
    }

    try {
      const client = this.redisService.getClient();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(...keys);
        this.logger.log(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting pattern ${pattern}:`, error);
    }
  }

  /**
   * Permission Cache Methods
   */

  async cacheUserPermissions(
    userId: string,
    organizationId: string,
    permissions: string[],
  ): Promise<void> {
    const key = this.getPermissionCacheKey(userId, organizationId);
    await this.set(key, permissions, this.PERMISSION_TTL);
  }

  async getCachedPermissions(
    userId: string,
    organizationId: string,
  ): Promise<string[] | null> {
    const key = this.getPermissionCacheKey(userId, organizationId);
    return await this.get<string[]>(key);
  }

  async invalidatePermissions(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    const key = this.getPermissionCacheKey(userId, organizationId);
    await this.delete(key);
    
    // Publish invalidation event for distributed systems
    await this.publish('permission:invalidate', { userId, organizationId });
  }

  private getPermissionCacheKey(userId: string, organizationId: string): string {
    return `permissions:${userId}:${organizationId}`;
  }

  /**
   * Token Blacklist Methods
   */

  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    const key = this.getTokenBlacklistKey(token);
    await this.set(key, true, expiresInSeconds);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!this.redisService.isAvailable()) {
      this.logger.warn('Redis unavailable, assuming token is not blacklisted');
      return false;
    }

    try {
      const key = this.getTokenBlacklistKey(token);
      const result = await this.redisService.getClient().exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking token blacklist:`, error);
      return false;
    }
  }

  private getTokenBlacklistKey(token: string): string {
    return `blacklist:token:${token}`;
  }

  /**
   * Session Management Methods
   */

  async createSession(
    userId: string,
    sessionId: string,
    metadata: SessionMetadata,
  ): Promise<void> {
    const key = this.getSessionKey(userId, sessionId);
    await this.set(key, metadata, this.SESSION_TTL);
  }

  async getSession(
    userId: string,
    sessionId: string,
  ): Promise<SessionMetadata | null> {
    const key = this.getSessionKey(userId, sessionId);
    return await this.get<SessionMetadata>(key);
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    const key = this.getSessionKey(userId, sessionId);
    await this.delete(key);
  }

  async deleteAllSessions(userId: string): Promise<void> {
    const pattern = `session:${userId}:*`;
    await this.deletePattern(pattern);
  }

  async getUserSessions(userId: string): Promise<SessionMetadata[]> {
    if (!this.redisService.isAvailable()) {
      this.logger.warn('Redis unavailable, returning empty sessions array');
      return [];
    }

    try {
      const client = this.redisService.getClient();
      const pattern = `session:${userId}:*`;
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return [];
      }

      const sessions: SessionMetadata[] = [];
      for (const key of keys) {
        const session = await this.get<SessionMetadata>(key);
        if (session) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      this.logger.error(`Error getting user sessions:`, error);
      return [];
    }
  }

  private getSessionKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }

  /**
   * Pub/Sub Methods for Distributed Cache Invalidation
   */

  async publish(channel: string, message: any): Promise<void> {
    if (!this.redisService.isAvailable()) {
      this.logger.warn('Redis unavailable, skipping publish operation');
      return;
    }

    try {
      const serialized = JSON.stringify(message);
      await this.redisService.getClient().publish(channel, serialized);
    } catch (error) {
      this.logger.error(`Error publishing to channel ${channel}:`, error);
    }
  }

  async subscribe(
    channel: string,
    handler: (message: any) => void,
  ): Promise<void> {
    if (!this.subscriber) {
      this.logger.warn('Redis subscriber not available, skipping subscribe operation');
      return;
    }

    try {
      await this.subscriber.subscribe(channel);
      
      this.subscriber.on('message', (ch, msg) => {
        if (ch === channel) {
          try {
            const parsed = JSON.parse(msg);
            handler(parsed);
          } catch (error) {
            this.logger.error(`Error parsing message from channel ${channel}:`, error);
          }
        }
      });

      this.logger.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Error subscribing to channel ${channel}:`, error);
    }
  }
}
