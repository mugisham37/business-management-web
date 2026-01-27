import { z } from 'zod';

// Environment variable validation schema with defaults for development
// All variables are optional with sensible defaults to reduce friction during development
const envSchema = z.object({
  // GraphQL Configuration
  NEXT_PUBLIC_GRAPHQL_URI: z.string().url().default('http://localhost:3001/graphql'),
  NEXT_PUBLIC_GRAPHQL_WS_URI: z.string().default('ws://localhost:3001/graphql'),

  // Authentication Configuration
  NEXT_PUBLIC_JWT_SECRET: z.string().default('dev_jwt_secret_key_must_be_at_least_32_chars_long_0123456789'),
  NEXT_PUBLIC_REFRESH_TOKEN_SECRET: z.string().default('dev_refresh_token_secret_must_be_32_chars_long_0123456789'),

  // Multi-Tenant Configuration
  NEXT_PUBLIC_DEFAULT_TENANT: z.string().default('default-tenant'),
  NEXT_PUBLIC_TENANT_DOMAIN_STRATEGY: z.enum(['subdomain', 'path', 'header']).default('subdomain'),

  // Cache Configuration
  NEXT_PUBLIC_CACHE_TTL: z.string().default('300000').transform((val: string) => Number(val)),
  NEXT_PUBLIC_ENABLE_CACHE_PERSISTENCE: z.string().default('true').transform((val: string) => val === 'true'),

  // Development Configuration
  NEXT_PUBLIC_ENABLE_DEVTOOLS: z.string().default('true').transform((val: string) => val === 'true'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),

  // Security Configuration
  NEXT_PUBLIC_CSP_ENABLED: z.string().default('false').transform((val: string) => val === 'true'),
  NEXT_PUBLIC_SECURE_COOKIES: z.string().default('false').transform((val: string) => val === 'true'),

  // Performance Configuration
  NEXT_PUBLIC_ENABLE_SW: z.string().default('false').transform((val: string) => val === 'true'),
  NEXT_PUBLIC_BUNDLE_ANALYZER: z.string().default('false').transform((val: string) => val === 'true'),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('false').transform((val: string) => val === 'true'),
  NEXT_PUBLIC_ENABLE_REAL_TIME: z.string().default('true').transform((val: string) => val === 'true'),
  NEXT_PUBLIC_ENABLE_OFFLINE_MODE: z.string().default('false').transform((val: string) => val === 'true'),

  // Monitoring Configuration (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
});

// Validate and export environment variables with graceful fallback
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.warn('⚠️ Environment validation warning, using defaults:', error);
    // Return defaults if validation fails (for development convenience)
    return envSchema.parse({});
  }
}

export const env = validateEnv();

// Type-safe environment configuration
export const config = {
  graphql: {
    uri: env.NEXT_PUBLIC_GRAPHQL_URI,
    wsUri: env.NEXT_PUBLIC_GRAPHQL_WS_URI,
  },
  auth: {
    jwtSecret: env.NEXT_PUBLIC_JWT_SECRET,
    refreshTokenSecret: env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET,
  },
  tenant: {
    defaultTenant: env.NEXT_PUBLIC_DEFAULT_TENANT,
    domainStrategy: env.NEXT_PUBLIC_TENANT_DOMAIN_STRATEGY,
  },
  cache: {
    ttl: env.NEXT_PUBLIC_CACHE_TTL,
    enablePersistence: env.NEXT_PUBLIC_ENABLE_CACHE_PERSISTENCE,
  },
  development: {
    enableDevtools: env.NEXT_PUBLIC_ENABLE_DEVTOOLS,
    logLevel: env.NEXT_PUBLIC_LOG_LEVEL,
  },
  security: {
    cspEnabled: env.NEXT_PUBLIC_CSP_ENABLED,
    secureCookies: env.NEXT_PUBLIC_SECURE_COOKIES,
  },
  performance: {
    enableServiceWorker: env.NEXT_PUBLIC_ENABLE_SW,
    bundleAnalyzer: env.NEXT_PUBLIC_BUNDLE_ANALYZER,
  },
  features: {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    realTime: env.NEXT_PUBLIC_ENABLE_REAL_TIME,
    offlineMode: env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE,
  },
  monitoring: {
    sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
    analyticsId: env.NEXT_PUBLIC_ANALYTICS_ID,
  },
} as const;

export type Config = typeof config;