import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { MetricsService } from '../health/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
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

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MetricsService))
    private readonly metricsService: MetricsService,
  ) {}

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
      this.metricsService?.incrementCacheMisses();
      return null;
    }

    try {
      const value = await this.redisService.getClient().get(key);
      if (!value) {
        this.metricsService?.incrementCacheMisses();
        return null;
      }
      this.metricsService?.incrementCacheHits();
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      this.metricsService?.incrementCacheMisses();
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
   * Session Management Methods with Database Fallback
   * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.10
   */

  async createSession(
    userId: string,
    sessionId: string,
    metadata: SessionMetadata,
  ): Promise<void> {
    // Try Redis first
    if (this.redisService.isAvailable()) {
      const key = this.getSessionKey(userId, sessionId);
      await this.set(key, metadata, this.SESSION_TTL);
    }

    // Always store in database as fallback (Requirement 13.10)
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await this.prisma.session.create({
        data: {
          sessionId: metadata.sessionId,
          userId: metadata.userId,
          organizationId: metadata.organizationId,
          deviceInfo: metadata.deviceInfo,
          ipAddress: metadata.ipAddress,
          lastActive: metadata.lastActive,
          createdAt: metadata.createdAt,
          expiresAt,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating session in database:`, error);
    }
  }

  async getSession(
    userId: string,
    sessionId: string,
  ): Promise<SessionMetadata | null> {
    // Try Redis first
    if (this.redisService.isAvailable()) {
      const key = this.getSessionKey(userId, sessionId);
      const session = await this.get<SessionMetadata>(key);
      if (session) {
        return session;
      }
    }

    // Fallback to database (Requirement 13.10)
    try {
      const session = await this.prisma.session.findUnique({
        where: { sessionId },
      });

      if (!session || session.userId !== userId) {
        return null;
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.prisma.session.delete({ where: { sessionId } });
        return null;
      }

      return {
        sessionId: session.sessionId,
        userId: session.userId,
        organizationId: session.organizationId,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        lastActive: session.lastActive,
        createdAt: session.createdAt,
      };
    } catch (error) {
      this.logger.error(`Error getting session from database:`, error);
      return null;
    }
  }

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    // Delete from Redis
    if (this.redisService.isAvailable()) {
      const key = this.getSessionKey(userId, sessionId);
      await this.delete(key);
    }

    // Delete from database
    try {
      await this.prisma.session.deleteMany({
        where: {
          sessionId,
          userId,
        },
      });
    } catch (error) {
      this.logger.error(`Error deleting session from database:`, error);
    }
  }

  async deleteAllSessions(userId: string): Promise<void> {
    // Delete from Redis
    if (this.redisService.isAvailable()) {
      const pattern = `session:${userId}:*`;
      await this.deletePattern(pattern);
    }

    // Delete from database
    try {
      await this.prisma.session.deleteMany({
        where: { userId },
      });
    } catch (error) {
      this.logger.error(`Error deleting all sessions from database:`, error);
    }
  }

  async getUserSessions(userId: string): Promise<SessionMetadata[]> {
    // Try Redis first
    if (this.redisService.isAvailable()) {
      try {
        const client = this.redisService.getClient();
        const pattern = `session:${userId}:*`;
        const keys = await client.keys(pattern);
        
        if (keys.length > 0) {
          const sessions: SessionMetadata[] = [];
          for (const key of keys) {
            const session = await this.get<SessionMetadata>(key);
            if (session) {
              sessions.push(session);
            }
          }
          return sessions;
        }
      } catch (error) {
        this.logger.error(`Error getting user sessions from Redis:`, error);
      }
    }

    // Fallback to database (Requirement 13.10)
    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          userId,
          expiresAt: {
            gte: new Date(), // Only return non-expired sessions
          },
        },
        orderBy: {
          lastActive: 'desc',
        },
      });

      return sessions.map(session => ({
        sessionId: session.sessionId,
        userId: session.userId,
        organizationId: session.organizationId,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        lastActive: session.lastActive,
        createdAt: session.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Error getting user sessions from database:`, error);
      return [];
    }
  }

  async updateSessionActivity(userId: string, sessionId: string): Promise<void> {
    const now = new Date();

    // Update in Redis
    if (this.redisService.isAvailable()) {
      const key = this.getSessionKey(userId, sessionId);
      const session = await this.get<SessionMetadata>(key);
      if (session) {
        session.lastActive = now;
        await this.set(key, session, this.SESSION_TTL);
      }
    }

    // Update in database
    try {
      await this.prisma.session.updateMany({
        where: {
          sessionId,
          userId,
        },
        data: {
          lastActive: now,
        },
      });
    } catch (error) {
      this.logger.error(`Error updating session activity in database:`, error);
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      this.logger.error(`Error cleaning up expired sessions:`, error);
      return 0;
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
