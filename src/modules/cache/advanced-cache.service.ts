import { Injectable, Logger } from '@nestjs/common';
import { IntelligentCacheService } from './intelligent-cache.service';
import { RedisService } from './redis.service';
import { CustomLoggerService } from '../logger/logger.service';

interface CacheWarmingConfig {
  key: string;
  dataLoader: () => Promise<any>;
  ttl: number;
  priority: 'high' | 'medium' | 'low';
  schedule?: string; // Cron expression
  dependencies?: string[]; // Other cache keys this depends on
}

interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  keyCount: number;
  hotKeys: Array<{ key: string; hits: number; lastAccess: Date }>;
}

interface DistributedCacheConfig {
  nodes: string[];
  replicationFactor: number;
  consistencyLevel: 'eventual' | 'strong';
  partitionStrategy: 'hash' | 'range';
}

@Injectable()
export class AdvancedCacheService {
  private readonly logger = new Logger(AdvancedCacheService.name);
  
  // Cache warming configurations
  private warmingConfigs = new Map<string, CacheWarmingConfig>();
  
  // Cache metrics tracking
  private metrics: CacheMetrics = {
    hitRate: 0,
    missRate: 0,
    evictionRate: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    keyCount: 0,
    hotKeys: [],
  };

  // Hot key tracking
  private keyAccessStats = new Map<string, { hits: number; lastAccess: Date }>();
  
  // Cache warming intervals
  private warmingIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly intelligentCache: IntelligentCacheService,
    private readonly redisService: RedisService,
    private readonly customLogger: CustomLoggerService,
  ) {
    this.customLogger.setContext('AdvancedCacheService');
    this.startMetricsCollection();
    this.startCacheWarming();
  }

  /**
   * Get data with advanced caching strategies
   */
  async get<T>(
    key: string,
    options: {
      tenantId?: string;
      fallbackLoader?: () => Promise<T>;
      ttl?: number;
      useDistributed?: boolean;
      warmOnMiss?: boolean;
    } = {}
  ): Promise<T | null> {
    const { tenantId, fallbackLoader, ttl = 300, useDistributed = false, warmOnMiss = true } = options;
    const startTime = Date.now();

    try {
      // Track key access
      this.trackKeyAccess(key);

      // Try intelligent cache first
      let result = await this.intelligentCache.get<T>(key, { tenantId });
      
      if (result !== null) {
        this.updateMetrics('hit', Date.now() - startTime);
        return result;
      }

      // Try distributed cache if enabled
      if (useDistributed) {
        result = await this.getFromDistributedCache<T>(key, tenantId);
        if (result !== null) {
          // Populate local cache
          await this.intelligentCache.set(key, result, { tenantId, ttl });
          this.updateMetrics('hit', Date.now() - startTime);
          return result;
        }
      }

      // Cache miss - use fallback loader if provided
      if (fallbackLoader) {
        result = await fallbackLoader();
        
        if (result !== null) {
          // Store in cache
          await this.set(key, result, { tenantId, ttl, useDistributed });
          
          // Schedule cache warming if enabled
          if (warmOnMiss) {
            this.scheduleWarmingForKey(key, fallbackLoader, ttl);
          }
        }
        
        this.updateMetrics('miss', Date.