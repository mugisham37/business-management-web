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
 * 
 * Note: This module provides logging utilities that can be used
 * to wrap gRPC client calls for comprehensive logging.
 */

import { generateCorrelationId } from '@/lib/utils/correlation';

export interface LoggingConfig {
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  logTiming: boolean;
  sanitizeFields?: string[]; // Fields to redact from logs
}

export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  logRequests: true,
  logResponses: true,
  logErrors: true,
  logTiming: true,
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

  if (loggingConfig.logRequests) {
    const sanitizedRequest = sanitizeData(request, loggingConfig.sanitizeFields);
    console.log('[gRPC Request]', {
      service,
      method,
      correlationId,
      request: sanitizedRequest,
      timestamp: new Date().toISOString(),
    });
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

  if (loggingConfig.logResponses) {
    const sanitizedResponse = sanitizeData(response, loggingConfig.sanitizeFields);
    console.log('[gRPC Response]', {
      service,
      method,
      correlationId,
      response: sanitizedResponse,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }

  if (loggingConfig.logTiming) {
    console.log('[gRPC Success]', {
      service,
      method,
      correlationId,
      duration: `${duration}ms`,
      status: 'OK',
    });
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

  if (loggingConfig.logErrors) {
    console.error('[gRPC Error]', {
      service,
      method,
      correlationId,
      duration: `${duration}ms`,
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
    });
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
 */
export const PRODUCTION_LOGGING_CONFIG: LoggingConfig = {
  logRequests: false,
  logResponses: false,
  logErrors: true,
  logTiming: true,
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


