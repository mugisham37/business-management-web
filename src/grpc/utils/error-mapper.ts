/**
 * gRPC Error Mapper
 * 
 * Maps gRPC status codes to application errors
 */

import * as grpc from '@grpc/grpc-js';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
  ErrorCategory,
  type AppError,
} from '@/lib/errors/error-types';

/**
 * Map gRPC error to application error
 */
export function mapGRPCError(error: grpc.ServiceError, correlationId?: string): AppError {
  const errorMap: Record<
    number,
    { category: ErrorCategory; userMessage: string; code: string }
  > = {
    [grpc.status.UNAUTHENTICATED]: {
      category: ErrorCategory.AUTHENTICATION,
      userMessage: 'Authentication required. Please log in.',
      code: 'GRPC_UNAUTHENTICATED',
    },
    [grpc.status.PERMISSION_DENIED]: {
      category: ErrorCategory.AUTHORIZATION,
      userMessage: 'You do not have permission to perform this action.',
      code: 'GRPC_PERMISSION_DENIED',
    },
    [grpc.status.INVALID_ARGUMENT]: {
      category: ErrorCategory.VALIDATION,
      userMessage: 'Invalid request. Please check your input.',
      code: 'GRPC_INVALID_ARGUMENT',
    },
    [grpc.status.NOT_FOUND]: {
      category: ErrorCategory.CLIENT,
      userMessage: 'The requested resource was not found.',
      code: 'GRPC_NOT_FOUND',
    },
    [grpc.status.UNAVAILABLE]: {
      category: ErrorCategory.NETWORK,
      userMessage: 'Service temporarily unavailable. Please try again.',
      code: 'GRPC_UNAVAILABLE',
    },
    [grpc.status.DEADLINE_EXCEEDED]: {
      category: ErrorCategory.NETWORK,
      userMessage: 'Request timed out. Please try again.',
      code: 'GRPC_DEADLINE_EXCEEDED',
    },
    [grpc.status.ALREADY_EXISTS]: {
      category: ErrorCategory.VALIDATION,
      userMessage: 'Resource already exists.',
      code: 'GRPC_ALREADY_EXISTS',
    },
    [grpc.status.RESOURCE_EXHAUSTED]: {
      category: ErrorCategory.SERVER,
      userMessage: 'Service is overloaded. Please try again later.',
      code: 'GRPC_RESOURCE_EXHAUSTED',
    },
    [grpc.status.FAILED_PRECONDITION]: {
      category: ErrorCategory.VALIDATION,
      userMessage: 'Operation cannot be performed in current state.',
      code: 'GRPC_FAILED_PRECONDITION',
    },
    [grpc.status.ABORTED]: {
      category: ErrorCategory.SERVER,
      userMessage: 'Operation was aborted. Please try again.',
      code: 'GRPC_ABORTED',
    },
    [grpc.status.OUT_OF_RANGE]: {
      category: ErrorCategory.VALIDATION,
      userMessage: 'Value is out of valid range.',
      code: 'GRPC_OUT_OF_RANGE',
    },
    [grpc.status.UNIMPLEMENTED]: {
      category: ErrorCategory.SERVER,
      userMessage: 'This feature is not yet implemented.',
      code: 'GRPC_UNIMPLEMENTED',
    },
    [grpc.status.INTERNAL]: {
      category: ErrorCategory.SERVER,
      userMessage: 'An internal server error occurred.',
      code: 'GRPC_INTERNAL',
    },
    [grpc.status.DATA_LOSS]: {
      category: ErrorCategory.SERVER,
      userMessage: 'Data loss or corruption detected.',
      code: 'GRPC_DATA_LOSS',
    },
  };

  const mapped = errorMap[error.code] || {
    category: ErrorCategory.UNKNOWN,
    userMessage: 'An unexpected error occurred.',
    code: 'GRPC_UNKNOWN',
  };

  // Create appropriate error type based on category
  const context = {
    grpcCode: error.code,
    grpcMessage: error.message,
    grpcDetails: error.details,
    correlationId,
  };

  switch (mapped.category) {
    case ErrorCategory.AUTHENTICATION:
      return new AuthenticationError(error.message, mapped.userMessage, context);
    
    case ErrorCategory.AUTHORIZATION:
      return new AuthorizationError(error.message, mapped.userMessage, context);
    
    case ErrorCategory.VALIDATION:
      return new ValidationError(error.message, mapped.userMessage, undefined, context);
    
    case ErrorCategory.NETWORK:
      return new NetworkError(error.message, mapped.userMessage, context);
    
    default:
      return {
        category: mapped.category,
        code: mapped.code,
        message: error.message,
        userMessage: mapped.userMessage,
        correlationId,
        timestamp: new Date(),
        context,
      };
  }
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
