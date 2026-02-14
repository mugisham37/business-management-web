/**
 * Error Handling Utilities
 * 
 * Provides consistent error handling with user-friendly messages and proper logging.
 * Handles GraphQL errors, network errors, and application-specific errors.
 */

/**
 * Error codes for different types of errors
 */
export enum ErrorCode {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Application error interface with code, message, and optional details
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  originalError?: Error;
}

/**
 * Get user-friendly error message based on error code
 * 
 * @param code - Error code
 * @param originalMessage - Original error message from backend
 * @returns User-friendly error message
 */
function getUserFriendlyMessage(code: ErrorCode, originalMessage: string): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHENTICATED]: 'Your session has expired. Please log in again.',
    [ErrorCode.UNAUTHORIZED]: 'You do not have permission to perform this action.',
    [ErrorCode.VALIDATION_ERROR]: originalMessage,
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCode.RATE_LIMIT]: 'Too many requests. Please try again later.',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  };

  return messages[code] || originalMessage;
}

/**
 * Format error from GraphQL/network error to AppError
 * 
 * Handles:
 * - GraphQL errors with extensions
 * - Network errors
 * - Unknown errors
 * 
 * @param error - Error from Apollo Client or other sources
 * @returns Formatted AppError with user-friendly message
 */
export function formatError(error: any): AppError {
  // GraphQL error
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const gqlError = error.graphQLErrors[0];
    const code = gqlError.extensions?.code as ErrorCode;

    return {
      code: code || ErrorCode.UNKNOWN_ERROR,
      message: getUserFriendlyMessage(code, gqlError.message),
      details: gqlError.extensions,
      originalError: error,
    };
  }

  // Network error
  if (error.networkError) {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: 'Network error. Please check your connection and try again.',
      originalError: error,
    };
  }

  // Unknown error
  return {
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'An unexpected error occurred. Please try again.',
    originalError: error,
  };
}
