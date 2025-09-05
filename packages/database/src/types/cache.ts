// Cache-related types and interfaces

export interface CacheAdapter {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
  expire(key: string, ttl: number): Promise<void>;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
  serialize?: boolean; // Whether to serialize values
  compress?: boolean; // Whether to compress values
}

export interface CacheConfig {
  enabled: boolean;
  defaultTtl: number;
  keyPrefix: string;
  maxMemory?: string;
  evictionPolicy?:
    | 'allkeys-lru'
    | 'volatile-lru'
    | 'allkeys-random'
    | 'volatile-random'
    | 'volatile-ttl'
    | 'noeviction';
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  keys: number;
  memory: number;
  uptime: number;
}

export interface CacheKey {
  namespace: string;
  identifier: string;
  version?: string;
}

export class CacheKeyBuilder {
  private parts: string[] = [];

  constructor(private prefix: string = '') {
    if (prefix) {
      this.parts.push(prefix);
    }
  }

  namespace(ns: string): this {
    this.parts.push(ns);
    return this;
  }

  entity(entity: string): this {
    this.parts.push(entity);
    return this;
  }

  id(id: string | number): this {
    this.parts.push(String(id));
    return this;
  }

  operation(op: string): this {
    this.parts.push(op);
    return this;
  }

  version(v: string | number): this {
    this.parts.push(`v${v}`);
    return this;
  }

  build(): string {
    return this.parts.join(':');
  }

  static create(prefix?: string): CacheKeyBuilder {
    return new CacheKeyBuilder(prefix);
  }
}

// Common cache key patterns
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userRoles: (userId: string) => `user:${userId}:roles`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,
  session: (id: string) => `session:${id}`,
  sessionByToken: (token: string) => `session:token:${token}`,
  role: (id: string) => `role:${id}`,
  rolePermissions: (roleId: string) => `role:${roleId}:permissions`,
  permission: (id: string) => `permission:${id}`,
  webhook: (id: string) => `webhook:${id}`,
  webhookByUrl: (url: string) => `webhook:url:${url}`,
  oauthState: (state: string) => `oauth:state:${state}`,
  oauthCode: (code: string) => `oauth:code:${code}`,
} as const;

// Cache decorators and utilities
export interface Cacheable {
  cacheKey: string;
  ttl?: number;
}

export interface CacheInvalidation {
  keys: string[];
  patterns?: string[];
}

export type CacheStrategy = 'cache-first' | 'cache-only' | 'network-first' | 'network-only';

export interface CacheableOptions {
  key?: string | ((args: any[]) => string);
  ttl?: number;
  strategy?: CacheStrategy;
  invalidateOn?: string[];
}

// Health check types
export interface CacheHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  memory: {
    used: number;
    max: number;
    percentage: number;
  };
  connections: {
    active: number;
    total: number;
  };
  stats: CacheStats;
  errors?: string[];
}
