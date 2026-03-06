/**
 * Structured Error Builder
 * 
 * Builds comprehensive structured errors from various error sources
 * (GraphQL, Network, Application errors) with full context for troubleshooting.
 */

import { GraphQLError } from 'graphql';
import {
  StructuredError,
  ErrorCategory,
  ErrorSeverity,
  ErrorTechnicalDetails,
  ErrorUserInfo,
} from './structured-error.types';
import {
  mapErrorToUserInfo,
  extractFieldErrors,
  generateContextualSuggestions,
  generateContextualDescription,
  generateContextualTitle,
  extractServerContext,
  enhanceWithServerContext,
} from './error-message-mapper';

interface GraphQLErrorResponse {
  graphQLErrors?: readonly GraphQLError[];
  networkError?: Error | null;
  message?: string;
}

interface OperationContext {
  operationName?: string;
  operationType?: 'query' | 'mutation' | 'subscription';
  variables?: Record<string, unknown>;
  startTime?: number;
  correlationId?: string;
}

/**
 * Build structured error from GraphQL error response
 */
export function buildStructuredErrorFromGraphQL(
  error: GraphQLErrorResponse,
  context?: OperationContext,
): StructuredError {
  const timestamp = new Date().toISOString();
  const duration = context?.startTime
    ? Date.now() - context.startTime
    : undefined;

  // Handle network errors
  if (error.networkError) {
    return buildNetworkError(error.networkError, context, timestamp, duration);
  }

  // Handle GraphQL errors
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const gqlError = error.graphQLErrors[0];
    return buildGraphQLError(gqlError, error.graphQLErrors, context, timestamp, duration);
  }

  // Fallback for unknown errors
  return buildUnknownError(error, context, timestamp, duration);
}

/**
 * Build structured error from network error
 */
function buildNetworkError(
  networkError: Error,
  context?: OperationContext,
  timestamp?: string,
  duration?: number,
): StructuredError {
  const userInfo = mapErrorToUserInfo(networkError.message, 'NETWORK_ERROR');

  const technicalDetails: ErrorTechnicalDetails = {
    originalMessage: networkError.message,
    errorCode: 'NETWORK_ERROR',
    errorType: networkError.name,
    stackTrace: networkError.stack,
    operationName: context?.operationName,
    operationType: context?.operationType,
    variables: context?.variables,
    timestamp: timestamp || new Date().toISOString(),
    duration,
    correlationId: context?.correlationId,
  };

  return {
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.ERROR,
    userInfo,
    technicalDetails,
    isRetryable: true,
    isDismissible: true,
    autoHideDuration: undefined, // Don't auto-hide network errors
  };
}

/**
 * Build structured error from GraphQL error
 */
function buildGraphQLError(
  primaryError: GraphQLError,
  allErrors: readonly GraphQLError[],
  context?: OperationContext,
  timestamp?: string,
  duration?: number,
): StructuredError {
  const errorCode = primaryError.extensions?.code as string | undefined;
  const statusCode = primaryError.extensions?.statusCode as number | undefined;
  const correlationId = primaryError.extensions?.correlationId as string | undefined;

  // Determine category and severity
  const category = categorizeGraphQLError(errorCode);
  const severity = determineSeverity(category, statusCode);

  // Extract server-provided context
  const serverContext = extractServerContext(primaryError);

  // Extract field information from Prisma errors
  const { fieldName, fieldValue } = extractFieldInfo(primaryError, context);

  // Map to user-friendly message with context
  let userInfo: ErrorUserInfo;
  
  if (fieldName) {
    // Generate contextual, actionable feedback
    userInfo = {
      title: generateContextualTitle(fieldName, context?.operationName),
      description: generateContextualDescription(fieldName, fieldValue, context?.operationName),
      suggestions: generateContextualSuggestions(fieldName, fieldValue, context?.operationName),
      supportMessage: 'If you believe this is an error, please contact support with the details below.',
    };
  } else {
    // Fallback to pattern matching
    userInfo = mapErrorToUserInfo(primaryError.message, errorCode);
  }

  // Enhance with server-provided context
  userInfo = enhanceWithServerContext(userInfo, serverContext);

  // Add field-specific errors if available
  const fieldErrors = extractFieldErrors(primaryError);
  if (fieldErrors && !fieldName) {
    userInfo.description = buildFieldErrorDescription(fieldErrors);
  }

  // Build technical details
  const technicalDetails: ErrorTechnicalDetails = {
    originalMessage: primaryError.message,
    errorCode,
    errorType: 'GraphQLError',
    stackTrace: primaryError.stack,
    operationName: context?.operationName,
    operationType: context?.operationType,
    variables: sanitizeVariables(context?.variables),
    statusCode,
    graphQLErrors: allErrors.map((err) => ({
      message: err.message,
      path: err.path as string[] | undefined,
      extensions: err.extensions,
    })),
    timestamp: timestamp || new Date().toISOString(),
    duration,
    correlationId: correlationId || context?.correlationId,
    metadata: primaryError.extensions,
  };

  return {
    category,
    severity,
    userInfo,
    technicalDetails,
    isRetryable: isRetryableError(category, errorCode),
    isDismissible: true,
    autoHideDuration: getAutoHideDuration(severity),
  };
}

/**
 * Extract field name and value from Prisma error and operation variables
 */
function extractFieldInfo(
  error: GraphQLError,
  context?: OperationContext,
): { fieldName?: string; fieldValue?: string } {
  let fieldName: string | undefined;
  let fieldValue: string | undefined;

  // Try to extract from Prisma error message
  const uniqueConstraintMatch = error.message.match(/Unique constraint failed on the fields: \(`(\w+)`\)/);
  if (uniqueConstraintMatch) {
    fieldName = uniqueConstraintMatch[1];
  }

  // Try to extract from error extensions (Prisma meta)
  const prismaMeta = error.extensions?.prismaMeta as { target?: string[] } | undefined;
  if (prismaMeta?.target && prismaMeta.target.length > 0) {
    fieldName = prismaMeta.target[0];
  }

  // Try to extract field value from operation variables
  if (fieldName && context?.variables) {
    // Direct field match
    if (fieldName in context.variables) {
      fieldValue = String(context.variables[fieldName]);
    }
    
    // Try common variations
    const variations = [
      fieldName,
      `${fieldName}Name`,
      `organization${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
    ];
    
    for (const variation of variations) {
      if (variation in context.variables) {
        fieldValue = String(context.variables[variation]);
        break;
      }
    }
  }

  return { fieldName, fieldValue };
}

/**
 * Build structured error for unknown errors
 */
function buildUnknownError(
  error: unknown,
  context?: OperationContext,
  timestamp?: string,
  duration?: number,
): StructuredError {
  const errorMessage =
    error instanceof Error ? error.message : String(error);

  const userInfo: ErrorUserInfo = {
    title: 'Unexpected Error',
    description: 'An unexpected error occurred.',
    suggestions: [
      'Try refreshing the page',
      'Contact support if the problem persists',
    ],
    supportMessage: 'Please provide the error details below when contacting support.',
  };

  const technicalDetails: ErrorTechnicalDetails = {
    originalMessage: errorMessage,
    errorCode: 'UNKNOWN_ERROR',
    errorType: error instanceof Error ? error.constructor.name : typeof error,
    stackTrace: error instanceof Error ? error.stack : undefined,
    operationName: context?.operationName,
    operationType: context?.operationType,
    variables: sanitizeVariables(context?.variables),
    timestamp: timestamp || new Date().toISOString(),
    duration,
    correlationId: context?.correlationId,
  };

  return {
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.ERROR,
    userInfo,
    technicalDetails,
    isRetryable: false,
    isDismissible: true,
    autoHideDuration: undefined,
  };
}

/**
 * Categorize GraphQL error based on error code
 */
function categorizeGraphQLError(errorCode?: string): ErrorCategory {
  if (!errorCode) return ErrorCategory.UNKNOWN;

  const categoryMap: Record<string, ErrorCategory> = {
    UNAUTHENTICATED: ErrorCategory.AUTHENTICATION,
    FORBIDDEN: ErrorCategory.AUTHORIZATION,
    BAD_USER_INPUT: ErrorCategory.VALIDATION,
    VALIDATION_ERROR: ErrorCategory.VALIDATION,
    INTERNAL_SERVER_ERROR: ErrorCategory.SERVER,
    SERVICE_UNAVAILABLE: ErrorCategory.SERVER,
    NETWORK_ERROR: ErrorCategory.NETWORK,
    CONFLICT: ErrorCategory.BUSINESS_LOGIC,
  };

  return categoryMap[errorCode] || ErrorCategory.UNKNOWN;
}

/**
 * Determine error severity
 */
function determineSeverity(
  category: ErrorCategory,
  statusCode?: number,
): ErrorSeverity {
  // Critical errors
  if (statusCode && statusCode >= 500) {
    return ErrorSeverity.CRITICAL;
  }

  // Category-based severity
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return ErrorSeverity.WARNING;
    
    case ErrorCategory.VALIDATION:
    case ErrorCategory.BUSINESS_LOGIC:
      return ErrorSeverity.INFO;
    
    case ErrorCategory.SERVER:
    case ErrorCategory.NETWORK:
      return ErrorSeverity.ERROR;
    
    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(
  category: ErrorCategory,
  errorCode?: string,
): boolean {
  // Network errors are always retryable
  if (category === ErrorCategory.NETWORK) return true;

  // Server errors are retryable
  if (category === ErrorCategory.SERVER) return true;

  // Specific retryable codes
  const retryableCodes = ['TIMEOUT', 'SERVICE_UNAVAILABLE', 'RATE_LIMITED'];
  if (errorCode && retryableCodes.includes(errorCode)) return true;

  return false;
}

/**
 * Get auto-hide duration based on severity
 */
function getAutoHideDuration(severity: ErrorSeverity): number | undefined {
  switch (severity) {
    case ErrorSeverity.INFO:
      return 4000; // 4 seconds
    case ErrorSeverity.WARNING:
      return 6000; // 6 seconds
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      return undefined; // Don't auto-hide errors
    default:
      return 5000;
  }
}

/**
 * Build description from field errors
 */
function buildFieldErrorDescription(
  fieldErrors: Record<string, string[]>,
): string {
  const errorMessages = Object.entries(fieldErrors)
    .map(([field, messages]) => {
      const friendlyField = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      return `${friendlyField}: ${messages.join(', ')}`;
    })
    .join('; ');

  return `Please correct the following: ${errorMessages}`;
}

/**
 * Sanitize variables to remove sensitive data
 */
function sanitizeVariables(
  variables?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!variables) return undefined;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
  const sanitized = { ...variables };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}
