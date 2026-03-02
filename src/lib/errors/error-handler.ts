import { GraphQLError } from 'graphql';
import {
  AppError,
  ErrorCategory,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
} from './error-types';

/**
 * GraphQL error structure from Apollo Client
 */
interface GraphQLErrorResponse {
  graphQLErrors?: readonly GraphQLError[];
  networkError?: Error | null;
  message?: string;
}

/**
 * Centralized error handler for GraphQL and gRPC errors
 */
class ErrorHandler {
  /**
   * Handle Apollo GraphQL errors and convert to AppError
   */
  handleGraphQLError(error: GraphQLErrorResponse): AppError {
    const correlationId = this.extractCorrelationId(error);

    // Handle GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const gqlError = error.graphQLErrors[0];
      const code = gqlError.extensions?.code as string;

      switch (code) {
        case 'UNAUTHENTICATED':
          return new AuthenticationError(
            gqlError.message,
            'Your session has expired. Please log in again.',
            { correlationId }
          );

        case 'FORBIDDEN':
          return new AuthorizationError(
            gqlError.message,
            'You do not have permission to perform this action.',
            { correlationId }
          );

        case 'BAD_USER_INPUT':
          const fieldErrors = this.extractFieldErrors(gqlError);
          return new ValidationError(
            gqlError.message,
            'Please check your input and try again.',
            fieldErrors,
            { correlationId }
          );

        default:
          return this.createGenericError(gqlError.message, correlationId);
      }
    }

    // Handle network errors
    if (error.networkError) {
      return new NetworkError(
        error.networkError.message,
        'Unable to connect to the server. Please check your internet connection.',
        { correlationId }
      );
    }

    return this.createGenericError(error.message || 'Unknown error', correlationId);
  }

  /**
   * Handle gRPC errors and convert to AppError
   */
  handleGRPCError(error: any): AppError {
    // gRPC status codes mapping
    const grpcStatusCodes = {
      UNAUTHENTICATED: 16,
      PERMISSION_DENIED: 7,
      INVALID_ARGUMENT: 3,
      NOT_FOUND: 5,
      UNAVAILABLE: 14,
      DEADLINE_EXCEEDED: 4,
    };

    const errorMap: Record<number, { message: string; category: ErrorCategory }> = {
      [grpcStatusCodes.UNAUTHENTICATED]: {
        message: 'Authentication required. Please log in.',
        category: ErrorCategory.AUTHENTICATION,
      },
      [grpcStatusCodes.PERMISSION_DENIED]: {
        message: 'You do not have permission to perform this action.',
        category: ErrorCategory.AUTHORIZATION,
      },
      [grpcStatusCodes.INVALID_ARGUMENT]: {
        message: 'Invalid request. Please check your input.',
        category: ErrorCategory.VALIDATION,
      },
      [grpcStatusCodes.NOT_FOUND]: {
        message: 'The requested resource was not found.',
        category: ErrorCategory.CLIENT,
      },
      [grpcStatusCodes.UNAVAILABLE]: {
        message: 'Service temporarily unavailable. Please try again.',
        category: ErrorCategory.NETWORK,
      },
      [grpcStatusCodes.DEADLINE_EXCEEDED]: {
        message: 'Request timed out. Please try again.',
        category: ErrorCategory.NETWORK,
      },
    };

    const code = error.code || 0;
    const mapped = errorMap[code] || {
      message: 'An unexpected error occurred.',
      category: ErrorCategory.UNKNOWN,
    };

    return {
      category: mapped.category,
      code: `GRPC_${code}`,
      message: error.message || 'Unknown gRPC error',
      userMessage: mapped.message,
      timestamp: new Date(),
      context: { grpcCode: code },
    };
  }

  /**
   * Extract correlation ID from GraphQL error
   */
  extractCorrelationId(error: GraphQLErrorResponse): string | undefined {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0]?.extensions?.correlationId as string | undefined;
    }
    return undefined;
  }

  /**
   * Extract field-level validation errors from GraphQL error
   */
  extractFieldErrors(error: GraphQLError): Record<string, string[]> | undefined {
    const validationErrors = error.extensions?.validationErrors;
    if (!validationErrors) return undefined;

    const fieldErrors: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(validationErrors)) {
      fieldErrors[field] = Array.isArray(messages) ? messages : [messages as string];
    }
    return fieldErrors;
  }

  /**
   * Create a generic error when specific categorization fails
   */
  private createGenericError(message: string, correlationId?: string): AppError {
    return {
      category: ErrorCategory.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message,
      userMessage: 'An unexpected error occurred. Please try again.',
      correlationId,
      timestamp: new Date(),
    };
  }

  /**
   * Log error with context for debugging and monitoring
   */
  logError(error: AppError): void {
    console.error('[Error]', {
      category: error.category,
      code: error.code,
      message: error.message,
      correlationId: error.correlationId,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack,
    });

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service (e.g., Sentry, DataDog)
      // this.sendToMonitoring(error);
    }
  }
}

export const errorHandler = new ErrorHandler();
