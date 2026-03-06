/**
 * gRPC Logging Interceptor
 * 
 * Logs all gRPC calls with:
 * - Service name
 * - Method name
 * - Request parameters
 * - Response data
 * - Execution time
 * - Correlation ID
 * - Toast notifications for errors
 * - Health check filtering
 * 
 * Note: This module provides logging utilities that can be used
 * to wrap gRPC client calls for comprehensive logging.
 * 
 * Requirements: 2.1, 6.1
 */

import { generateCorrelationId } from '@/lib/utils/correlation';
import { logger } from '@/lib/logging/logger.service';

export interface LoggingConfig {
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  logTiming: boolean;
  showToasts: boolean;
  sanitizeFields?: string[]; // Fields to redact from logs
}

export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  logRequests: true,
  logResponses: true,
  logErrors: true,
  logTiming: true,
  showToasts: true,
  sanitizeFields: ['password', 'token', 'access_token', 'refresh_token', 'secret'],
};

/**
 * Log a gRPC request
 */
export function logGRPCRequest(
  service: string,
  method: string,
  request: any,
  config: Partial<LoggingConfig> = {}
): string {
  const loggingConfig = { ...DEFAULT_LOGGING_CONFIG, ...config };
  const correlationId = generateCorrelationId();

  // Create child logger for gRPC
  const grpcLogger = logger.createChildLogger('gRPC');
  grpcLogger.setCorrelationId(correlationId);

  // Check if this is a health check
  const isHealthCheck = grpcLogger.isHealthCheck(method);

  if (loggingConfig.logRequests && !isHealthCheck) {
    const sanitizedRequest = sanitizeData(request, loggingConfig.sanitizeFields);
    grpcLogger.info(
      `→ gRPC ${service}.${method}`,
      {
        service,
        method,
        request: sanitizedRequest,
      },
    );
  }

  return correlationId;
}

/**
 * Log a gRPC response
 */
export function logGRPCResponse(
  service: string,
  method: string,
  response: any,
  correlationId: string,
  startTime: number,
  config: Partial<LoggingConfig> = {}
): void {
  const loggingConfig = { ...DEFAULT_LOGGING_CONFIG, ...config };
  const duration = Date.now() - startTime;

  // Create child logger for gRPC
  const grpcLogger = logger.createChildLogger('gRPC');
  grpcLogger.setCorrelationId(correlationId);

  // Check if this is a health check
  const isHealthCheck = grpcLogger.isHealthCheck(method);

  if (loggingConfig.logResponses && !isHealthCheck) {
    const sanitizedResponse = sanitizeData(response, loggingConfig.sanitizeFields);
    grpcLogger.info(
      `← gRPC ${service}.${method} - Success (${duration}ms)`,
      {
        service,
        method,
        response: sanitizedResponse,
        duration: `${duration}ms`,
      },
    );
  }
}

/**
 * Log a gRPC error
 */
export function logGRPCError(
  service: string,
  method: string,
  error: any,
  correlationId: string,
  startTime: number,
  config: Partial<LoggingConfig> = {}
): void {
  const loggingConfig = { ...DEFAULT_LOGGING_CONFIG, ...config };
  const duration = Date.now() - startTime;

  // Create child logger for gRPC
  const grpcLogger = logger.createChildLogger('gRPC');
  grpcLogger.setCorrelationId(correlationId);

  // Check if this is a health check
  const isHealthCheck = grpcLogger.isHealthCheck(method);

  if (loggingConfig.logErrors) {
    if (isHealthCheck) {
      // Just log health check errors, no toast
      grpcLogger.error(
        `✗ gRPC ${service}.${method} - Failed (${duration}ms)`,
        error,
      );
    } else {
      // Log and show toast for non-health-check errors
      if (loggingConfig.showToasts) {
        grpcLogger.errorWithToast(
          `✗ gRPC ${service}.${method} - Failed (${duration}ms)`,
          'gRPC Error',
          error.message || 'gRPC call failed',
          error,
        );
      } else {
        grpcLogger.error(
          `✗ gRPC ${service}.${method} - Failed (${duration}ms)`,
          error,
        );
      }
    }
  }
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: any, fieldsToSanitize: string[] = []): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, fieldsToSanitize));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (fieldsToSanitize.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeData(value, fieldsToSanitize);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Wrap a gRPC operation with logging
 * 
 * @example
 * ```typescript
 * const result = await withLogging(
 *   'UserService',
 *   'getUser',
 *   () => client.getUser({ id: 'user-id' }),
 *   { id: 'user-id' }
 * );
 * ```
 */
export async function withLogging<T>(
  service: string,
  method: string,
  operation: () => Promise<T>,
  request?: any,
  config?: Partial<LoggingConfig>
): Promise<T> {
  const correlationId = logGRPCRequest(service, method, request, config);
  const startTime = Date.now();

  try {
    const response = await operation();
    logGRPCResponse(service, method, response, correlationId, startTime, config);
    return response;
  } catch (error) {
    logGRPCError(service, method, error, correlationId, startTime, config);
    throw error;
  }
}

/**
 * Production-safe logging configuration
 * Only logs errors and timing, not request/response data
 * Disables toasts in production
 */
export const PRODUCTION_LOGGING_CONFIG: LoggingConfig = {
  logRequests: false,
  logResponses: false,
  logErrors: true,
  logTiming: true,
  showToasts: false,
  sanitizeFields: ['password', 'token', 'access_token', 'refresh_token', 'secret'],
};

/**
 * Get logging configuration based on environment
 */
export function getLoggingConfig(): LoggingConfig {
  return process.env.NODE_ENV === 'production'
    ? PRODUCTION_LOGGING_CONFIG
    : DEFAULT_LOGGING_CONFIG;
}
