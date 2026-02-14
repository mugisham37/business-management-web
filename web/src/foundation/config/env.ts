import { z } from 'zod';

/**
 * Environment variable schema with validation
 */
const envSchema = z.object({
  // GraphQL Configuration
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: z
    .string()
    .url()
    .default('http://localhost:3001/graphql'),

  // Token Configuration
  NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY: z
    .string()
    .default('900')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY: z
    .string()
    .default('604800')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // Token Refresh Configuration
  NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL: z
    .string()
    .default('60')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD: z
    .string()
    .default('60')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // Cache Configuration
  NEXT_PUBLIC_CACHE_POLICY: z
    .enum(['cache-first', 'cache-and-network', 'network-only', 'cache-only', 'no-cache'])
    .default('cache-first'),

  // Retry Configuration
  NEXT_PUBLIC_MAX_RETRY_ATTEMPTS: z
    .string()
    .default('3')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(0).max(10)),

  NEXT_PUBLIC_RETRY_DELAY_BASE: z
    .string()
    .default('1000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // Request Deduplication
  NEXT_PUBLIC_DEDUPLICATION_ENABLED: z
    .string()
    .default('true')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  // Development/Debug Configuration
  NEXT_PUBLIC_ENABLE_GRAPHQL_LOGGING: z
    .string()
    .default('false')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  NEXT_PUBLIC_ENABLE_CACHE_LOGGING: z
    .string()
    .default('false')
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  // Application Configuration
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Validated environment configuration
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): EnvConfig {
  const env = {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY: process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY,
    NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY: process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY,
    NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL: process.env.NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL,
    NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD: process.env.NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD,
    NEXT_PUBLIC_CACHE_POLICY: process.env.NEXT_PUBLIC_CACHE_POLICY,
    NEXT_PUBLIC_MAX_RETRY_ATTEMPTS: process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS,
    NEXT_PUBLIC_RETRY_DELAY_BASE: process.env.NEXT_PUBLIC_RETRY_DELAY_BASE,
    NEXT_PUBLIC_DEDUPLICATION_ENABLED: process.env.NEXT_PUBLIC_DEDUPLICATION_ENABLED,
    NEXT_PUBLIC_ENABLE_GRAPHQL_LOGGING: process.env.NEXT_PUBLIC_ENABLE_GRAPHQL_LOGGING,
    NEXT_PUBLIC_ENABLE_CACHE_LOGGING: process.env.NEXT_PUBLIC_ENABLE_CACHE_LOGGING,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      throw new Error(
        `Environment variable validation failed:\n${missingVars}\n\nPlease check your .env.local file.`
      );
    }
    throw error;
  }
}

/**
 * Validated and type-safe environment configuration
 * 
 * @example
 * ```ts
 * import { env } from '@/foundation/config/env';
 * 
 * const endpoint = env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
 * const maxRetries = env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS;
 * ```
 */
export const env = parseEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in test mode
 */
export const isTest = env.NODE_ENV === 'test';
