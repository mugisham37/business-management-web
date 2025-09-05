// Health check types and interfaces

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  error?: string;
  details?: Record<string, any>;
  lastChecked: Date;
}

export interface DatabaseHealth extends ComponentHealth {
  name: 'database';
  connections: {
    active: number;
    idle: number;
    total: number;
    max: number;
  };
  queries: {
    slow: number;
    failed: number;
    total: number;
  };
  replication?: {
    lag: number;
    status: 'synced' | 'lagging' | 'disconnected';
  };
}

export interface CacheHealth extends ComponentHealth {
  name: 'cache';
  memory: {
    used: number;
    max: number;
    percentage: number;
  };
  hits: number;
  misses: number;
  hitRate: number;
}

export interface SystemHealth {
  overall: HealthStatus;
  components: {
    database: DatabaseHealth;
    cache?: CacheHealth;
    [key: string]: ComponentHealth | undefined;
  };
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network?: {
      in: number;
      out: number;
    };
  };
}

export interface HealthCheckOptions {
  timeout?: number;
  retries?: number;
  interval?: number;
  includeDetails?: boolean;
}

export interface HealthChecker {
  check(options?: HealthCheckOptions): Promise<ComponentHealth>;
  getName(): string;
  isRequired(): boolean;
}

export interface HealthMonitor {
  addChecker(checker: HealthChecker): void;
  removeChecker(name: string): void;
  checkAll(options?: HealthCheckOptions): Promise<SystemHealth>;
  checkComponent(name: string, options?: HealthCheckOptions): Promise<ComponentHealth>;
  getStatus(): Promise<HealthStatus>;
  startMonitoring(interval: number): void;
  stopMonitoring(): void;
}

// Health check result types
export type HealthCheckResult = {
  status: 'pass' | 'fail' | 'warn';
  componentId?: string;
  componentType?: string;
  observedValue?: any;
  observedUnit?: string;
  time?: string;
  output?: string;
  links?: Record<string, string>;
};

export type HealthCheckResponse = {
  status: 'pass' | 'fail' | 'warn';
  version?: string;
  releaseId?: string;
  notes?: string[];
  output?: string;
  serviceId?: string;
  description?: string;
  checks?: Record<string, HealthCheckResult[]>;
  links?: Record<string, string>;
};

// Metrics types
export interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    waiting: number;
    total: number;
  };
  queries: {
    select: number;
    insert: number;
    update: number;
    delete: number;
    total: number;
  };
  performance: {
    avgQueryTime: number;
    slowQueries: number;
    deadlocks: number;
  };
  storage: {
    size: number;
    growth: number;
    fragmentation: number;
  };
}

export interface CacheMetrics {
  memory: {
    used: number;
    available: number;
    peak: number;
  };
  operations: {
    gets: number;
    sets: number;
    deletes: number;
    hits: number;
    misses: number;
  };
  performance: {
    avgLatency: number;
    throughput: number;
  };
  connections: {
    active: number;
    total: number;
  };
}

export interface SystemMetrics {
  timestamp: Date;
  database: DatabaseMetrics;
  cache?: CacheMetrics;
  system: {
    cpu: {
      usage: number;
      load: number[];
    };
    memory: {
      used: number;
      free: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: number;
      free: number;
      total: number;
      percentage: number;
    };
    network: {
      bytesIn: number;
      bytesOut: number;
      packetsIn: number;
      packetsOut: number;
    };
  };
}
