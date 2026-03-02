export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  correlationId?: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

export class AuthenticationError extends Error implements AppError {
  category = ErrorCategory.AUTHENTICATION;
  code = 'AUTH_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, context?: Record<string, any>) {
    super(message);
    this.name = 'AuthenticationError';
    this.userMessage = userMessage;
    this.context = context;
  }
}

export class AuthorizationError extends Error implements AppError {
  category = ErrorCategory.AUTHORIZATION;
  code = 'AUTHZ_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, context?: Record<string, any>) {
    super(message);
    this.name = 'AuthorizationError';
    this.userMessage = userMessage;
    this.context = context;
  }
}

export class ValidationError extends Error implements AppError {
  category = ErrorCategory.VALIDATION;
  code = 'VALIDATION_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    userMessage: string,
    fieldErrors?: Record<string, string[]>,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ValidationError';
    this.userMessage = userMessage;
    this.fieldErrors = fieldErrors;
    this.context = context;
  }
}

export class NetworkError extends Error implements AppError {
  category = ErrorCategory.NETWORK;
  code = 'NETWORK_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, context?: Record<string, any>) {
    super(message);
    this.name = 'NetworkError';
    this.userMessage = userMessage;
    this.context = context;
  }
}
