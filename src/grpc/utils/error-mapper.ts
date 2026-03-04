/**
 * gRPC Error Mapper
 * 
 * Maps gRPC status codes to application errors
 * This module provides utilities for transforming gRPC errors into
 * user-friendly AppError instances with proper categorization.
 */

import * as grpc from '@grpc/grpc-js';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
  ServerError,
  UnknownError,
  ErrorCategory,
  type AppError,
} from '@/lib/errors/error-types';
import { errorHandler } from '@/lib/errors/error-handler';

/**
 * Map gRPC error to application error using centralized ErrorHandler
 * This ensures consistent error handling across GraphQL and gRPC
 */
export function mapGRPCError(error: grpc.ServiceError, correlationId?: string): AppError {
  // Use centralized error handler for consistency
  const appError = errorHandler.handle(error);
  
  // Add correlation ID if provided
  if (correlationId && !appError.correlationId) {
    appError.correlationId = correlationId;
  }
  
  // Log the error for debugging
  errorHandler.logError(appError);
  
  return appError;
}

/**
 * Check if error is retryable
 */
export function isRetryableGRPCError(error: grpc.ServiceError): boolean {
  const retryableCodes = [
    grpc.status.UNAVAILABLE,
    grpc.status.DEADLINE_EXCEEDED,
    grpc.status.RESOURCE_EXHAUSTED,
    grpc.status.ABORTED,
    grpc.status.INTERNAL,
  ];

  return retryableCodes.includes(error.code);
}

/**
 * Get retry delay for error (exponential backoff)
 */
export function getRetryDelay(attempt: number, maxDelay = 30000): number {
  const baseDelay = 1000; // 1 second
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.floor(delay + jitter);
}
