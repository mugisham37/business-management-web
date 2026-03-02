import { z } from 'zod';

/**
 * Environment configuration schema with validation
 */
const envSchema = z.object({
  graphql: z.object({
    httpUrl: z.string().url(),
    wsUrl: z.string().url(),
  }),
  grpc: z.object({
    url: z.string().min(1),
    maxConnections: z.number().int().positive(),
    connectionTimeout: z.number().int().positive(),
    requestTimeout: z.number().int().positive(),
  }),
  api: z.object({
    url: z.string().url(),
    appUrl: z.string().url(),
  }),
  auth: z.object({
    tokenRefreshThreshold: z.number().int().positive(),
    sessionTimeout: z.number().int().positive(),
  }),
  retry: z.object({
    maxAttempts: z.number().int().positive(),
    initialDelay: z.number().int().positive(),
    maxDelay: z.number().int().positive(),
  }),
  dev: z.object({
    enableDevtools: z.boolean(),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  }),
});

/**
 * Parse and validate environment variables
 */
function parseEnvironment() {
  const rawConfig = {
    graphql: {
      httpUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
      wsUrl: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:3001/graphql',
    },
    grpc: {
      url: process.env.NEXT_PUBLIC_GRPC_URL || 'localhost:5000',
      maxConnections: 10,
      connectionTimeout: 5000,
      requestTimeout: 10000,
    },
    api: {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    auth: {
      tokenRefreshThreshold: parseInt(process.env.NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD || '300000', 10),
      sessionTimeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '900000', 10),
    },
    retry: {
      maxAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS || '3', 10),
      initialDelay: 300,
      maxDelay: 1200,
    },
    dev: {
      enableDevtools: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true',
      logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL || 'debug') as 'debug' | 'info' | 'warn' | 'error',
    },
  };

  try {
    return envSchema.parse(rawConfig);
  } catch (error) {
    console.error('Environment configuration validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

/**
 * Validated environment configuration
 * Exported as a constant to ensure single validation at module load
 */
export const config = parseEnvironment();

/**
 * Type-safe environment configuration
 */
export type Config = z.infer<typeof envSchema>;
