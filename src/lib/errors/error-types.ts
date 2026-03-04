export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error code constants for consistent error identification
 */
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TIMEOUT: 'TIMEOUT',
  
  // Authentication errors
  AUTH_ERROR: 'AUTH_ERROR',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Authorization errors
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // GraphQL errors
  GRAPHQL_ERROR: 'GRAPHQL_ERROR',
  
  // gRPC errors
  GRPC_ERROR: 'GRPC_ERROR',
  
  // Client errors
  CLIENT_ERROR: 'CLIENT_ERROR',
  REACT_ERROR: 'REACT_ERROR',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Base AppError interface with all required properties
 */
export interface AppError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  originalError?: any;
  correlationId?: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

export class AuthenticationError extends Error implements AppError {
  category = ErrorCategory.AUTHENTICATION;
  code = ERROR_CODES.AUTH_ERROR;
  userMessage: string;
  originalError?: any;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, originalError?: any, context?: Record<string, any>) {
    super(message);
    this.name = 'AuthenticationError';
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.context = context;
    if (context?.correlationId) {
      this.correlationId = context.correlationId;
    }
  }
}

export class AuthorizationError extends Error implements AppError {
  category = ErrorCategory.AUTHORIZATION;
  code = ERROR_CODES.PERMISSION_ERROR;
  userMessage: string;
  originalError?: any;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, originalError?: any, context?: Record<string, any>) {
    super(message);
    this.name = 'AuthorizationError';
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.context = context;
    if (context?.correlationId) {
      this.correlationId = context.correlationId;
    }
  }
}

export class ValidationError extends Error implements AppError {
  category = ErrorCategory.VALIDATION;
  code = ERROR_CODES.VALIDATION_ERROR;
  userMessage: string;
  originalError?: any;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    userMessage: string,
    fieldErrors?: Record<string, string[]>,
    originalError?: any,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ValidationError';
    this.userMessage = userMessage;
    this.fieldErrors = fieldErrors;
    this.originalError = originalError;
    this.context = context;
    if (context?.correlationId) {
      this.correlationId = context.correlationId;
    }
  }
}

export class NetworkError extends Error implements AppError {
  category = ErrorCategory.NETWORK;
  code = ERROR_CODES.NETWORK_ERROR;
  userMessage: string;
  originalError?: any;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, originalError?: any, context?: Record<string, any>) {
    super(message);
    this.name = 'NetworkError';
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.context = context;
    if (context?.correlationId) {
      this.correlationId = context.correlationId;
    }
  }
}

export class ServerError extends Error implements AppError {
  category = ErrorCategory.SERVER;
  code = ERROR_CODES.SERVER_ERROR;
  userMessage: string;
  originalError?: any;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, originalError?: any, context?: Record<string, any>) {
    super(message);
    this.name = 'ServerError';
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.context = context;
    if (context?.correlationId) {
      this.correlationId = context.correlationId;
    }
  }
}

export class UnknownError extends Error implements AppError {
  category = ErrorCategory.UNKNOWN;
  code = ERROR_CODES.UNKNOWN_ERROR;
  userMessage: string;
  originalError?: any;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, originalError?: any, context?: Record<string, any>) {
    super(message);
    this.name = 'UnknownError';
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.context = context;
    if (context?.correlationId) {
      this.correlationId = context.correlationId;
    }
  }
}
