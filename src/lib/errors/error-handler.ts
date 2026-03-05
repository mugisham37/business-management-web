import { GraphQLError } from 'graphql';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NetworkError,
  ServerError,
  UnknownError,
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
   * Main error handling method that routes to specific handlers
   * @param error - Any error object (GraphQL, gRPC, or generic)
   * @returns AppError with user-friendly message
   */
  handle(error: unknown): AppError {
    // Handle GraphQL errors
    if (error && typeof error === 'object' && ('graphQLErrors' in error || 'networkError' in error)) {
      return this.handleGraphQLError(error as GraphQLErrorResponse);
    }

    // Handle gRPC errors (identified by numeric code property)
    if (error && typeof error === 'object' && 'code' in error && typeof (error as { code: unknown }).code === 'number') {
      return this.handleGRPCError(error as { code: number; message?: string; details?: string });
    }

    // Handle generic errors
    if (error instanceof Error) {
      return new UnknownError(
        error.message,
        'An unexpected error occurred. Please try again.',
        error
      );
    }

    // Handle unknown error types
    return new UnknownError(
      'Unknown error',
      'An unexpected error occurred. Please try again.',
      error
    );
  }

  /**
   * Handle Apollo GraphQL errors and convert to AppError
   */
  handleGraphQLError(error: GraphQLErrorResponse): AppError {
    const correlationId = this.extractCorrelationId(error);

    // Handle network errors first
    if (error.networkError) {
      return new NetworkError(
        error.networkError.message,
        'Unable to connect to the server. Please check your internet connection.',
        error.networkError,
        { correlationId }
      );
    }

    // Handle GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const gqlError = error.graphQLErrors[0];
      const code = gqlError.extensions?.code as string;

      switch (code) {
        case 'UNAUTHENTICATED':
          return new AuthenticationError(
            gqlError.message,
            'Your session has expired. Please log in again.',
            gqlError,
            { correlationId }
          );

        case 'FORBIDDEN':
          return new AuthorizationError(
            gqlError.message,
            'You do not have permission to perform this action.',
            gqlError,
            { correlationId }
          );

        case 'BAD_USER_INPUT':
          const fieldErrors = this.extractFieldErrors(gqlError);
          return new ValidationError(
            gqlError.message,
            'Please check your input and try again.',
            fieldErrors,
            gqlError,
            { correlationId }
          );

        case 'INTERNAL_SERVER_ERROR':
          return new ServerError(
            gqlError.message,
            'Something went wrong on our end. Please try again later.',
            gqlError,
            { correlationId }
          );

        default:
          return new UnknownError(
            gqlError.message,
            'An unexpected error occurred. Please try again.',
            gqlError,
            { correlationId }
          );
      }
    }

    return new UnknownError(
      error.message || 'Unknown error',
      'An unexpected error occurred. Please try again.',
      error,
      { correlationId }
    );
  }

  /**
   * Handle gRPC errors and convert to AppError
   * Maps gRPC status codes to user-friendly error messages
   */
  handleGRPCError(error: { code: number; message?: string; details?: string }): AppError {
    // gRPC status codes mapping
    const grpcStatusCodes = {
      OK: 0,
      CANCELLED: 1,
      UNKNOWN: 2,
      INVALID_ARGUMENT: 3,
      DEADLINE_EXCEEDED: 4,
      NOT_FOUND: 5,
      ALREADY_EXISTS: 6,
      PERMISSION_DENIED: 7,
      RESOURCE_EXHAUSTED: 8,
      FAILED_PRECONDITION: 9,
      ABORTED: 10,
      OUT_OF_RANGE: 11,
      UNIMPLEMENTED: 12,
      INTERNAL: 13,
      UNAVAILABLE: 14,
      DATA_LOSS: 15,
      UNAUTHENTICATED: 16,
    };

    const code = error.code || 0;

    // Map gRPC codes to AppError types
    switch (code) {
      case grpcStatusCodes.UNAUTHENTICATED:
        return new AuthenticationError(
          error.message || 'Authentication required',
          'Please log in to continue.',
          error,
          { grpcCode: code }
        );

      case grpcStatusCodes.PERMISSION_DENIED:
        return new AuthorizationError(
          error.message || 'Permission denied',
          'You do not have permission to perform this action.',
          error,
          { grpcCode: code }
        );

      case grpcStatusCodes.INVALID_ARGUMENT:
      case grpcStatusCodes.OUT_OF_RANGE:
      case grpcStatusCodes.FAILED_PRECONDITION:
        return new ValidationError(
          error.message || 'Invalid request',
          'Please check your input and try again.',
          undefined,
          error,
          { grpcCode: code }
        );

      case grpcStatusCodes.UNAVAILABLE:
      case grpcStatusCodes.DEADLINE_EXCEEDED:
        return new NetworkError(
          error.message || 'Service unavailable',
          'Service temporarily unavailable. Please try again.',
          error,
          { grpcCode: code }
        );

      case grpcStatusCodes.INTERNAL:
      case grpcStatusCodes.DATA_LOSS:
        return new ServerError(
          error.message || 'Internal server error',
          'Something went wrong on our end. Please try again later.',
          error,
          { grpcCode: code }
        );

      case grpcStatusCodes.NOT_FOUND:
        return new UnknownError(
          error.message || 'Resource not found',
          'The requested resource was not found.',
          error,
          { grpcCode: code }
        );

      case grpcStatusCodes.CANCELLED:
        return new UnknownError(
          error.message || 'Operation cancelled',
          'The operation was cancelled.',
          error,
          { grpcCode: code }
        );

      default:
        return new UnknownError(
          error.message || 'Unknown gRPC error',
          'An unexpected error occurred. Please try again.',
          error,
          { grpcCode: code }
        );
    }
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
   * Log error with context for debugging and monitoring
   */
  logError(error: AppError): void {
    console.error('[Error]', {
      category: error.category,
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
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
