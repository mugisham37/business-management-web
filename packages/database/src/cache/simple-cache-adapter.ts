import type { CacheAdapter, CacheStats } from '../types/cache';

// Simple in-memory cache adapter for development/testing
export class SimpleCacheAdapter implements CacheAdapter {
  private cache = new Map<string, { value: any; expires?: number }>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(private defaultTtl: number = 3600) {}

  async get<T = any>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expirationTime = ttl || this.defaultTtl;
    const expires = expirationTime > 0 ? Date.now() + expirationTime * 1000 : undefined;

    if (expires !== undefined) {
      this.cache.set(key, { value, expires });
    } else {
      this.cache.set(key, { value });
    }
    this.stats.sets++;
  }

  async delete(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());

    if (!pattern) {
      return allKeys;
    }

    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  async ttl(key: string): Promise<number> {
    const item = this.cache.get(key);

    if (!item || !item.expires) {
      return -1; // No expiration
    }

    const remaining = Math.max(0, item.expires - Date.now());
    return Math.floor(remaining / 1000);
  }

  async expire(key: string, ttl: number): Promise<void> {
    const item = this.cache.get(key);

    if (item) {
      const expires = ttl > 0 ? Date.now() + ttl * 1000 : undefined;
      if (expires !== undefined) {
        this.cache.set(key, { ...item, expires });
      } else {
        const { expires: _, ...itemWithoutExpires } = item;
        this.cache.set(key, itemWithoutExpires);
      }
    }
  }

  // Additional utility methods
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      keys: this.cache.size,
      memory: this.getMemoryUsage(),
      uptime: process.uptime(),
    };
  }

  private getMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(item.value).length * 2;
      size += 16; // Overhead for expires timestamp
    }
    return size;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires && now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Start automatic cleanup
  startCleanup(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => this.cleanup(), intervalMs);
  }
}
