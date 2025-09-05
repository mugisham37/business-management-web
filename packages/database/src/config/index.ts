import { z } from 'zod';

// Database configuration schema
const DatabaseConfigSchema = z.object({
  // Prisma configuration
  prisma: z.object({
    databaseUrl: z.string().url(),
    shadowDatabaseUrl: z.string().url().optional(),
    directUrl: z.string().url().optional(),
    logLevel: z.enum(['info', 'query', 'warn', 'error']).default('info'),
    errorFormat: z.enum(['pretty', 'colorless', 'minimal']).default('pretty'),
  }),

  // Drizzle configuration
  drizzle: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(5432),
    database: z.string(),
    username: z.string(),
    password: z.string(),
    ssl: z.boolean().default(false),
    poolSize: z.number().default(10),
    connectionTimeoutMillis: z.number().default(5000),
    idleTimeoutMillis: z.number().default(30000),
    maxUses: z.number().default(7500),
  }),

  // Redis configuration for caching
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(6379),
    password: z.string().optional(),
    db: z.number().default(0),
    keyPrefix: z.string().default('app:'),
    ttl: z.number().default(3600), // 1 hour default TTL
  }),

  // Migration configuration
  migrations: z.object({
    enabled: z.boolean().default(true),
    autoRun: z.boolean().default(false),
    tableName: z.string().default('_migrations'),
  }),

  // Seeding configuration
  seeding: z.object({
    enabled: z.boolean().default(true),
    environment: z.enum(['development', 'staging', 'production']).default('development'),
  }),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

// Default configuration
const defaultConfig: DatabaseConfig = {
  prisma: {
    databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydb',
    logLevel: 'info',
    errorFormat: 'pretty',
  },
  drizzle: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mydb',
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    maxUses: 7500,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'app:',
    ttl: parseInt(process.env.REDIS_TTL || '3600'),
  },
  migrations: {
    enabled: process.env.MIGRATIONS_ENABLED !== 'false',
    autoRun: process.env.MIGRATIONS_AUTO_RUN === 'true',
    tableName: process.env.MIGRATIONS_TABLE_NAME || '_migrations',
  },
  seeding: {
    enabled: process.env.SEEDING_ENABLED !== 'false',
    environment: (process.env.NODE_ENV as any) || 'development',
  },
};

// Configuration loader
export function loadDatabaseConfig(): DatabaseConfig {
  try {
    return DatabaseConfigSchema.parse(defaultConfig);
  } catch (error) {
    console.error('Invalid database configuration:', error);
    throw new Error('Failed to load database configuration');
  }
}

// Export individual config sections
export const getDatabaseConfig = () => loadDatabaseConfig();
export const getPrismaConfig = () => loadDatabaseConfig().prisma;
export const getDrizzleConfig = () => loadDatabaseConfig().drizzle;
export const getRedisConfig = () => loadDatabaseConfig().redis;
export const getMigrationConfig = () => loadDatabaseConfig().migrations;
export const getSeedingConfig = () => loadDatabaseConfig().seeding;

// Export schema for validation
export { DatabaseConfigSchema };
