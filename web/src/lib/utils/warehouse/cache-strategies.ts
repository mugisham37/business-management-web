/**
 * Warehouse Cache Strategies
 * Intelligent caching strategies for warehouse operations
 */

import { CACHE_KEYS, CACHE_TTL } from './constants';
import { MemoryCache } from './performance';

// ===== CACHE STRATEGY TYPES =====

export interface CacheStrategy {
  key: string;
  ttl: number;
  invalidateOn?: string[];
  refreshOn?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

// ===== WAREHOUSE CACHE STRATEGIES =====

export const WAREHOUSE_CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  // Warehouse data - changes infrequently
  WAREHOUSE_DETAILS: {
    key: CACHE_KEYS.WAREHOUSE,
    ttl: CACHE_TTL.LONG,
    invalidateOn: ['warehouse:updated', 'warehouse:deleted'],
    refreshOn: ['warehouse:capacity:updated'],
    priority: 'high',
  },

  // Warehouse list - moderate frequency changes
  WAREHOUSE_LIST: {
    key: CACHE_KEYS.WAREHOUSE_LIST,
    ttl: CACHE_TTL.MEDIUM,
    invalidateOn: ['warehouse:created', 'warehouse:deleted', 'warehouse:updated'],
    priority: 'medium',
  },

  // Capacity data - changes frequently
  WAREHOUSE_CAPACITY: {
    key: CACHE_KEYS.WAREHOUSE_CAPACITY,
    ttl: CACHE_TTL.SHORT,
    invalidateOn: ['warehouse:capacity:updated', 'inventory:moved'],
    refreshOn: ['picking:completed', 'receiving:completed'],
    priority: 'high',
  },

  // Zone data - changes infrequently
  WAREHOUSE_ZONES: {
    key: CACHE_KEYS.WAREHOUSE_ZONES,
    ttl: CACHE_TTL.LONG,
    invalidateOn: ['zone:created', 'zone:updated', 'zone:deleted'],
    priority: 'medium',
  },

  // Bin locations - moderate frequency changes
  BIN_LOCATIONS: {
    key: CACHE_KEYS.BIN_LOCATIONS,
    ttl: CACHE_TTL.MEDIUM,
    invalidateOn: ['bin:created', 'bin:updated', 'bin:deleted', 'bin:occupancy:updated'],
    refreshOn: ['inventory:moved', 'picking:completed'],
    priority: 'medium',
  },

  // Picking waves - changes frequently during operations
  PICKING_WAVES: {
    key: CACHE_KEYS.PICKING_WAVES,
    ttl: CACHE_TTL.SHORT,
    invalidateOn: ['wave:created', 'wave:updated', 'wave:status:changed'],
    refreshOn: ['wave:completed', 'picking:progress'],
    priority: 'high',
  },

  // Pick lists - changes very frequently
  PICK_LISTS: {
    key: CACHE_KEYS.PICK_LISTS,
    ttl: CACHE_TTL.SHORT,
    invalidateOn: ['picklist:created', 'picklist:updated', 'picklist:assigned', 'pick:recorded'],
    priority: 'high',
  },

  // Shipments - moderate frequency changes
  SHIPMENTS: {
    key: CACHE_KEYS.SHIPMENTS,
    ttl: CACHE_TTL.MEDIUM,
    invalidateOn: ['shipment:created', 'shipment:updated', 'shipment:status:changed'],
    refreshOn: ['tracking:updated', 'shipment:delivered'],
    priority: 'medium',
  },

  // Lot tracking - changes moderately
  LOTS: {
    key: CACHE_KEYS.LOTS,
    ttl: CACHE_TTL.MEDIUM,
    invalidateOn: ['lot:created', 'lot:updated', 'lot:moved', 'lot:consumed'],
    refreshOn: ['lot:expiry:checked'],
    priority: 'medium',
  },

  // Kit definitions - changes infrequently
  KIT_DEFINITIONS: {
    key: CACHE_KEYS.KIT_DEFINITIONS,
    ttl: CACHE_TTL.LONG,
    invalidateOn: ['kit:created', 'kit:updated', 'kit:activated', 'kit:deactivated'],
    priority: 'low',
  },

  // Assembly work orders - changes frequently
  ASSEMBLY_WORK_ORDERS: {
    key: CACHE_KEYS.ASSEMBLY_WORK_ORDERS,
    ttl: CACHE_TTL.SHORT,
    invalidateOn: ['workorder:created', 'workorder:updated', 'workorder:status:changed'],
    refreshOn: ['assembly:progress', 'components:allocated'],
    priority: 'medium',
  },
};

// ===== INTELLIGENT CACHE MANAGER =====

export class IntelligentCacheManager {
  private caches = new Map<string, MemoryCache<any>>();
  private strategies = new Map<string, CacheStrategy>();
  private eventListeners = new Map<string, Set<string>>();
  private accessPatterns = new Map<string, { hits: number; misses: number; lastAccessed: number }>();

  constructor() {
    // Initialize cache strategies
    Object.entries(WAREHOUSE_CACHE_STRATEGIES).forEach(([name, strategy]) => {
      this.addStrategy(name, strategy);
    });

    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  /**
   * Add cache strategy
   */
  addStrategy(name: string, strategy: CacheStrategy): void {
    this.strategies.set(name, strategy);
    this.caches.set(name, new MemoryCache(strategy.ttl));

    // Register event listeners for invalidation
    if (strategy.invalidateOn) {
      strategy.invalidateOn.forEach(event => {
        if (!this.eventListeners.has(event)) {
          this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(name);
      });
    }

    // Register event listeners for refresh
    if (strategy.refreshOn) {
      strategy.refreshOn.forEach(event => {
        if (!this.eventListeners.has(event)) {
          this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(name);
      });
    }
  }

  /**
   * Get data from cache
   */
  get<T>(strategyName: string, key: string): T | null {
    const cache = this.caches.get(strategyName);
    if (!cache) return null;

    const fullKey = `${strategyName}:${key}`;
    const data = cache.get(fullKey);

    // Track access patterns
    const pattern = this.accessPatterns.get(fullKey) || { hits: 0, misses: 0, lastAccessed: 0 };
    
    if (data !== null) {
      pattern.hits++;
    } else {
      pattern.misses++;
    }
    
    pattern.lastAccessed = Date.now();
    this.accessPatterns.set(fullKey, pattern);

    return data;
  }

  /**
   * Set data in cache
   */
  set<T>(strategyName: string, key: string, data: T, customTTL?: number): void {
    const cache = this.caches.get(strategyName);
    const strategy = this.strategies.get(strategyName);
    
    if (!cache || !strategy) return;

    const fullKey = `${strategyName}:${key}`;
    const ttl = customTTL || strategy.ttl;
    
    cache.set(fullKey, data, ttl);

    // Initialize access pattern if not exists
    if (!this.accessPatterns.has(fullKey)) {
      this.accessPatterns.set(fullKey, { hits: 0, misses: 0, lastAccessed: Date.now() });
    }
  }

  /**
   * Invalidate cache entries based on event
   */
  invalidateByEvent(event: string, metadata?: Record<string, any>): void {
    const affectedStrategies = this.eventListeners.get(event);
    if (!affectedStrategies) return;

    affectedStrategies.forEach(strategyName => {
      const strategy = this.strategies.get(strategyName);
      
      if (strategy?.invalidateOn?.includes(event)) {
        this.invalidateStrategy(strategyName, metadata);
      } else if (strategy?.refreshOn?.includes(event)) {
        // For refresh events, we might want to preload data
        this.scheduleRefresh(strategyName, metadata);
      }
    });
  }

  /**
   * Invalidate all entries for a strategy
   */
  invalidateStrategy(strategyName: string, metadata?: Record<string, any>): void {
    const cache = this.caches.get(strategyName);
    if (!cache) return;

    // If metadata contains specific keys to invalidate
    if (metadata?.keys) {
      metadata.keys.forEach((key: string) => {
        const fullKey = `${strategyName}:${key}`;
        cache.delete(fullKey);
      });
    } else {
      // Clear entire strategy cache
      cache.clear();
    }

    console.log(`Cache invalidated for strategy: ${strategyName}`, metadata);
  }

  /**
   * Schedule cache refresh
   */
  private scheduleRefresh(strategyName: string, metadata?: Record<string, any>): void {
    // This could trigger background refresh of cache data
    console.log(`Cache refresh scheduled for strategy: ${strategyName}`, metadata);
  }

  /**
   * Get cache statistics
   */
  getStatistics(): Record<string, any> {
    const stats: Record<string, any> = {};

    this.caches.forEach((cache, strategyName) => {
      const cacheStats = cache.getStats();
      const strategy = this.strategies.get(strategyName);
      
      // Calculate hit rate from access patterns
      const strategyPatterns = Array.from(this.accessPatterns.entries())
        .filter(([key]) => key.startsWith(`${strategyName}:`))
        .map(([, pattern]) => pattern);

      const totalHits = strategyPatterns.reduce((sum, pattern) => sum + pattern.hits, 0);
      const totalMisses = strategyPatterns.reduce((sum, pattern) => sum + pattern.misses, 0);
      const hitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0;

      stats[strategyName] = {
        ...cacheStats,
        hitRate: hitRate.toFixed(2) + '%',
        priority: strategy?.priority || 'medium',
        ttl: strategy?.ttl || 0,
        totalAccesses: totalHits + totalMisses,
      };
    });

    return stats;
  }

  /**
   * Cleanup expired entries and optimize cache
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean expired cache entries
    this.caches.forEach(cache => {
      cache.cleanExpired();
    });

    // Clean old access patterns
    for (const [key, pattern] of this.accessPatterns.entries()) {
      if (now - pattern.lastAccessed > maxAge) {
        this.accessPatterns.delete(key);
      }
    }

    // Optimize cache sizes based on usage patterns
    this.optimizeCacheSizes();
  }

  /**
   * Optimize cache sizes based on usage patterns
   */
  private optimizeCacheSizes(): void {
    const stats = this.getStatistics();
    
    Object.entries(stats).forEach(([strategyName, stat]) => {
      const strategy = this.strategies.get(strategyName);
      if (!strategy) return;

      // Adjust TTL based on hit rate and priority
      let newTTL = strategy.ttl;
      
      if (stat.hitRate > 80 && strategy.priority === 'high') {
        // High hit rate and high priority - increase TTL
        newTTL = Math.min(strategy.ttl * 1.5, CACHE_TTL.VERY_LONG);
      } else if (stat.hitRate < 20 && strategy.priority === 'low') {
        // Low hit rate and low priority - decrease TTL
        newTTL = Math.max(strategy.ttl * 0.5, CACHE_TTL.SHORT);
      }

      if (newTTL !== strategy.ttl) {
        strategy.ttl = newTTL;
        console.log(`Optimized TTL for ${strategyName}: ${newTTL}ms`);
      }
    });
  }

  /**
   * Preload cache with commonly accessed data
   */
  async preloadCache(strategyName: string, dataLoader: () => Promise<any[]>): Promise<void> {
    try {
      const data = await dataLoader();
      
      data.forEach((item, index) => {
        this.set(strategyName, item.id || index.toString(), item);
      });

      console.log(`Preloaded ${data.length} items for strategy: ${strategyName}`);
    } catch (error) {
      console.error(`Failed to preload cache for strategy: ${strategyName}`, error);
    }
  }

  /**
   * Get cache entry with metadata
   */
  getWithMetadata<T>(strategyName: string, key: string): {
    data: T | null;
    cached: boolean;
    age: number;
    hitRate: number;
  } {
    const data = this.get<T>(strategyName, key);
    const fullKey = `${strategyName}:${key}`;
    const pattern = this.accessPatterns.get(fullKey);
    
    const cached = data !== null;
    const age = pattern ? Date.now() - pattern.lastAccessed : 0;
    const hitRate = pattern && (pattern.hits + pattern.misses) > 0 
      ? (pattern.hits / (pattern.hits + pattern.misses)) * 100 
      : 0;

    return {
      data,
      cached,
      age,
      hitRate,
    };
  }

  /**
   * Warm up cache for specific keys
   */
  async warmUp(
    strategyName: string, 
    keys: string[], 
    dataLoader: (key: string) => Promise<any>
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        const data = await dataLoader(key);
        this.set(strategyName, key, data);
      } catch (error) {
        console.error(`Failed to warm up cache for key: ${key}`, error);
      }
    });

    await Promise.all(promises);
    console.log(`Warmed up cache for ${keys.length} keys in strategy: ${strategyName}`);
  }
}

// ===== CACHE DECORATORS =====

/**
 * Cache decorator for functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  strategyName: string,
  keyGenerator: (...args: Parameters<T>) => string,
  cacheManager: IntelligentCacheManager
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const cacheKey = keyGenerator(...args);
      
      // Try to get from cache first
      const cachedResult = cacheManager.get(strategyName, cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute original method
      const result = await method.apply(this, args);
      
      // Cache the result
      cacheManager.set(strategyName, cacheKey, result);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 */
export function invalidateCache(
  events: string[],
  cacheManager: IntelligentCacheManager
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      // Invalidate cache after successful operation
      events.forEach(event => {
        cacheManager.invalidateByEvent(event, { args, result });
      });
      
      return result;
    };

    return descriptor;
  };
}

// ===== GLOBAL CACHE MANAGER =====

export const warehouseCacheManager = new IntelligentCacheManager();

// ===== CACHE UTILITIES =====

/**
 * Generate cache key from object
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

/**
 * Cache key generators for common patterns
 */
export const cacheKeyGenerators = {
  warehouse: (id: string) => `warehouse:${id}`,
  warehouseList: (filter?: any, pagination?: any) => 
    generateCacheKey('warehouse_list', { filter, pagination }),
  warehouseCapacity: (warehouseId: string) => `capacity:${warehouseId}`,
  warehouseZones: (warehouseId: string) => `zones:${warehouseId}`,
  binLocations: (warehouseId: string, zoneId?: string) => 
    `bins:${warehouseId}:${zoneId || 'all'}`,
  pickingWaves: (warehouseId?: string, filter?: any) => 
    generateCacheKey('waves', { warehouseId, filter }),
  pickLists: (warehouseId?: string, waveId?: string, filter?: any) => 
    generateCacheKey('picklists', { warehouseId, waveId, filter }),
  shipments: (warehouseId?: string, filter?: any) => 
    generateCacheKey('shipments', { warehouseId, filter }),
  lots: (warehouseId?: string, productId?: string, filter?: any) => 
    generateCacheKey('lots', { warehouseId, productId, filter }),
  kitDefinitions: (filter?: any) => 
    generateCacheKey('kits', { filter }),
  assemblyWorkOrders: (warehouseId?: string, kitId?: string, filter?: any) => 
    generateCacheKey('workorders', { warehouseId, kitId, filter }),
};

/**
 * Batch cache operations
 */
export async function batchCacheSet<T>(
  cacheManager: IntelligentCacheManager,
  strategyName: string,
  items: Array<{ key: string; data: T }>,
  customTTL?: number
): Promise<void> {
  items.forEach(({ key, data }) => {
    cacheManager.set(strategyName, key, data, customTTL);
  });
}

/**
 * Batch cache get
 */
export function batchCacheGet<T>(
  cacheManager: IntelligentCacheManager,
  strategyName: string,
  keys: string[]
): Array<{ key: string; data: T | null; cached: boolean }> {
  return keys.map(key => {
    const data = cacheManager.get<T>(strategyName, key);
    return {
      key,
      data,
      cached: data !== null,
    };
  });
}