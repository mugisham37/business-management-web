/**
 * gRPC Retry Interceptor
 * 
 * Provides configurable retry logic for gRPC calls with:
 * - Exponential backoff
 * - Jitter to prevent thundering herd
 * - Configurable max retries
 * - Retryable error detection
 * 
 * Note: This module provides retry utilities that are already integrated
 * into the gRPC clients. The retry logic is implemented in each client's
 * executeWithRetry method.
 */

import * as grpc from '@grpc/grpc-js';
import { isRetryableGRPCError, getRetryDelay } from '../utils/error-mapper';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  jitterFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  jitterFactor: 0.25, // ±25%
};

/**
 * Execute a gRPC operation with retry logic
 * 
 * @param operation - The gRPC operation to execute
 * @param config - Retry configuration
 * @param correlationId - Correlation ID for logging
 * @returns Promise with operation result
 * 
 * @example
 * ```typescript
 * const result = await executeWithRetry(
 *   () => client.getUser({ id: 'user-id' }),
 *   { maxRetries: 5 },
 *   'correlation-id'
 * );
 * ```
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  correlationId?: string,
  attempt = 0
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  try {
    return await operation();
  } catch (error) {
    const grpcError = error as grpc.ServiceError;

    // Check if error is retryable and we haven't exceeded max retries
    if (isRetryableGRPCError(grpcError) && attempt < retryConfig.maxRetries) {
      const delay = calculateRetryDelay(attempt, retryConfig);
      
      console.warn(
        `[gRPC Retry] Attempt ${attempt + 1}/${retryConfig.maxRetries} after ${delay}ms`,
        {
          correlationId,
          code: grpcError.code,
          message: grpcError.message,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return executeWithRetry(operation, config, correlationId, attempt + 1);
    }

    // No retry, throw error
    throw error;
  }
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = Math.min(
    config.baseDelay * Math.pow(2, attempt),
    config.maxDelay
  );

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * config.jitterFactor * (Math.random() * 2 - 1);

  return Math.floor(exponentialDelay + jitter);
}

/**
 * Create a retry wrapper function with custom configuration
 * 
 * @example
 * ```typescript
 * const retryableOperation = withRetry(
 *   () => client.getUser({ id: 'user-id' }),
 *   { maxRetries: 5, baseDelay: 2000 }
 * );
 * 
 * const result = await retryableOperation();
 * ```
 */
export function withRetry<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>
): () => Promise<T> {
  return () => executeWithRetry(operation, config);
}


