/**
 * Apollo Logging Link
 * 
 * Comprehensive logging for all GraphQL operations with:
 * - Structured error handling
 * - User-friendly toast notifications
 * - Expandable technical details
 * - Operation timing and context
 * - Correlation ID tracking
 * 
 * Requirements: 2.1, 6.1
 */

import { ApolloLink, Operation, FetchResult } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { logger } from '@/lib/logging/logger.service';
import { generateCorrelationId } from '@/lib/utils/correlation';
import { buildStructuredErrorFromGraphQL } from '@/lib/errors/structured-error-builder';
import { StructuredError, ErrorSeverity } from '@/lib/errors/structured-error.types';

/**
 * Get operation type from operation
 */
function getOperationType(operation: Operation): 'query' | 'mutation' | 'subscription' {
  const definition = operation.query.definitions.find(
    (def) => def.kind === 'OperationDefinition'
  );
  return ((definition as any)?.operation || 'query') as 'query' | 'mutation' | 'subscription';
}

/**
 * Get operation name from operation
 */
function getOperationName(operation: Operation): string {
  return operation.operationName || 'anonymous';
}

/**
 * Check if operation should show toast
 */
function shouldShowToast(operationType: string, operationName: string): boolean {
  // Don't show toast for health checks
  if (logger.isHealthCheck(operationName)) {
    return false;
  }

  // Show toast for mutations (create, update, delete operations)
  if (operationType === 'mutation') {
    return true;
  }

  // Don't show toast for queries (only log to console)
  return false;
}

/**
 * Get user-friendly operation message for success
 */
function getSuccessMessage(operationName: string, operationType: string): { title: string; description: string } {
  // Sign up / Sign in operations
  if (operationName.toLowerCase().includes('signup') || operationName.toLowerCase().includes('register')) {
    return {
      title: 'Account Created Successfully',
      description: 'Welcome! Your account has been created.',
    };
  }

  if (operationName.toLowerCase().includes('signin') || operationName.toLowerCase().includes('login')) {
    return {
      title: 'Welcome Back',
      description: 'You have been logged in successfully.',
    };
  }

  if (operationName.toLowerCase().includes('logout') || operationName.toLowerCase().includes('signout')) {
    return {
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    };
  }

  // CRUD operations
  if (operationName.toLowerCase().includes('create')) {
    return {
      title: 'Created Successfully',
      description: 'The item has been created.',
    };
  }

  if (operationName.toLowerCase().includes('update')) {
    return {
      title: 'Updated Successfully',
      description: 'The item has been updated.',
    };
  }

  if (operationName.toLowerCase().includes('delete') || operationName.toLowerCase().includes('remove')) {
    return {
      title: 'Deleted Successfully',
      description: 'The item has been deleted.',
    };
  }

  // Generic success message
  return {
    title: 'Success',
    description: 'Operation completed successfully.',
  };
}

/**
 * Map error severity to toast variant
 */
function severityToVariant(severity: ErrorSeverity): 'error' | 'warning' | 'info' {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.ERROR:
      return 'error';
    case ErrorSeverity.WARNING:
      return 'warning';
    case ErrorSeverity.INFO:
      return 'info';
    default:
      return 'error';
  }
}

/**
 * Apollo Logging Link
 */
export const apolloLoggingLink = new ApolloLink((operation, forward) => {
  const operationType = getOperationType(operation);
  const operationName = getOperationName(operation);
  const correlationId = generateCorrelationId();
  const startTime = Date.now();

  // Add correlation ID to operation context
  operation.setContext({
    headers: {
      'X-Correlation-Id': correlationId,
    },
  });

  // Skip logging for health checks
  if (logger.isHealthCheck(operationName)) {
    return forward(operation);
  }

  // Log operation start
  logger.debug(
    `🔵 GraphQL ${operationType.toUpperCase()}: ${operationName} - Started`,
    {
      operationType,
      operationName,
      variables: operation.variables,
      correlationId,
    },
    'ApolloLoggingLink'
  );

  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result: FetchResult) => {
        const duration = Date.now() - startTime;
        const hasErrors = result.errors && result.errors.length > 0;

        if (hasErrors) {
          // Handle errors
          handleOperationError(
            result.errors!,
            operationType,
            operationName,
            operation.variables,
            startTime,
            correlationId,
            duration
          );
        } else {
          // Handle success
          handleOperationSuccess(
            result,
            operationType,
            operationName,
            operation.variables,
            correlationId,
            duration
          );
        }

        observer.next(result);
      },
      error: (error: Error) => {
        const duration = Date.now() - startTime;
        
        // Handle network or unexpected errors
        handleNetworkError(
          error,
          operationType,
          operationName,
          operation.variables,
          startTime,
          correlationId,
          duration
        );

        observer.error(error);
      },
      complete: () => {
        observer.complete();
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  });
});

/**
 * Handle successful operation
 */
function handleOperationSuccess(
  result: FetchResult,
  operationType: string,
  operationName: string,
  variables: Record<string, unknown>,
  correlationId: string,
  duration: number
): void {
  // Log to console
  logger.info(
    `✅ GraphQL ${operationType.toUpperCase()}: ${operationName} - Success (${duration}ms)`,
    {
      operationType,
      operationName,
      duration,
      correlationId,
      hasData: !!result.data,
    },
    'ApolloLoggingLink'
  );

  // Show toast for mutations
  if (shouldShowToast(operationType, operationName)) {
    const { title, description } = getSuccessMessage(operationName, operationType);
    
    logger.success(
      `Operation ${operationName} completed successfully`,
      title,
      description,
      {
        operationType,
        operationName,
        duration,
        correlationId,
      },
      'ApolloLoggingLink'
    );
  }
}

/**
 * Handle operation error (GraphQL errors)
 */
function handleOperationError(
  errors: readonly any[],
  operationType: string,
  operationName: string,
  variables: Record<string, unknown>,
  startTime: number,
  correlationId: string,
  duration: number
): void {
  // Build structured error
  const structuredError = buildStructuredErrorFromGraphQL(
    { graphQLErrors: errors },
    {
      operationName,
      operationType: operationType as 'query' | 'mutation' | 'subscription',
      variables,
      startTime,
      correlationId,
    }
  );

  // Log to console with full details
  logger.error(
    `❌ GraphQL ${operationType.toUpperCase()}: ${operationName} - Failed (${duration}ms)`,
    {
      operationType,
      operationName,
      duration,
      correlationId,
      errorCategory: structuredError.category,
      errorCode: structuredError.technicalDetails.errorCode,
      errorMessage: structuredError.technicalDetails.originalMessage,
    },
    'ApolloLoggingLink'
  );

  // Show toast for mutations or critical errors
  if (shouldShowToast(operationType, operationName) || structuredError.severity === ErrorSeverity.CRITICAL) {
    showErrorToast(structuredError);
  }
}

/**
 * Handle network error
 */
function handleNetworkError(
  error: Error,
  operationType: string,
  operationName: string,
  variables: Record<string, unknown>,
  startTime: number,
  correlationId: string,
  duration: number
): void {
  // Build structured error
  const structuredError = buildStructuredErrorFromGraphQL(
    { networkError: error },
    {
      operationName,
      operationType: operationType as 'query' | 'mutation' | 'subscription',
      variables,
      startTime,
      correlationId,
    }
  );

  // Log to console
  logger.error(
    `❌ GraphQL ${operationType.toUpperCase()}: ${operationName} - Network Error (${duration}ms)`,
    {
      operationType,
      operationName,
      duration,
      correlationId,
      errorMessage: error.message,
    },
    'ApolloLoggingLink'
  );

  // Always show toast for network errors
  showErrorToast(structuredError);
}

/**
 * Show error toast with structured error details
 */
function showErrorToast(structuredError: StructuredError): void {
  const variant = severityToVariant(structuredError.severity);

  // Use the toast handler from logger service
  if (logger['toastHandler']) {
    logger['toastHandler']({
      title: structuredError.userInfo.title,
      description: structuredError.userInfo.description,
      variant,
      duration: structuredError.autoHideDuration,
      // @ts-ignore - Enhanced toast props
      structuredError,
    });
  }
}
