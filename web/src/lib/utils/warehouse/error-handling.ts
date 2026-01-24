/**
 * Warehouse Error Handling Utilities
 * Centralized error handling for warehouse operations
 */

import React from 'react';
import { ERROR_CODES } from './constants';

// ===== ERROR TYPES =====

export interface WarehouseError extends Error {
  code: string;
  field?: string | undefined;
  details?: Record<string, unknown> | undefined;
  timestamp: Date;
  operation?: string | undefined;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
}

export interface ErrorContext {
  operation: string;
  warehouseId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ===== ERROR CLASSES =====

export class WarehouseValidationError extends Error implements WarehouseError {
  code: string;
  field?: string | undefined;
  details?: Record<string, unknown> | undefined;
  timestamp: Date;
  operation?: string | undefined;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  retryable: boolean = false;

  constructor(
    message: string,
    field?: string,
    code: string = ERROR_CODES.VALIDATION.INVALID_FORMAT,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WarehouseValidationError';
    this.code = code;
    this.field = field;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class BusinessRuleError extends Error implements WarehouseError {
  code: string;
  field?: string | undefined;
  details?: Record<string, unknown> | undefined;
  timestamp: Date;
  operation?: string | undefined;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'high';
  retryable: boolean = false;

  constructor(
    message: string,
    code: string = ERROR_CODES.BUSINESS_RULE.OPERATION_NOT_ALLOWED,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BusinessRuleError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class SystemError extends Error implements WarehouseError {
  code: string;
  field?: string | undefined;
  details?: Record<string, unknown> | undefined;
  timestamp: Date;
  operation?: string | undefined;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'critical';
  retryable: boolean = true;

  constructor(
    message: string,
    code: string = ERROR_CODES.SYSTEM.SERVER_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SystemError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class NetworkError extends Error implements WarehouseError {
  code: string = ERROR_CODES.SYSTEM.NETWORK_ERROR;
  field?: string | undefined;
  details?: Record<string, unknown> | undefined;
  timestamp: Date;
  operation?: string | undefined;
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  retryable: boolean = true;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'NetworkError';
    this.details = details;
    this.timestamp = new Date();
  }
}

export class CapacityError extends BusinessRuleError {
  constructor(
    requiredCapacity: number,
    availableCapacity: number,
    warehouseId?: string
  ) {
    super(
      `Insufficient capacity. Required: ${requiredCapacity}, Available: ${availableCapacity}`,
      ERROR_CODES.BUSINESS_RULE.INSUFFICIENT_CAPACITY,
      { requiredCapacity, availableCapacity, warehouseId }
    );
    this.name = 'CapacityError';
  }
}

export class StatusTransitionError extends BusinessRuleError {
  constructor(currentStatus: string, targetStatus: string, entityType: string) {
    super(
      `Invalid status transition from ${currentStatus} to ${targetStatus} for ${entityType}`,
      ERROR_CODES.BUSINESS_RULE.INVALID_STATUS_TRANSITION,
      { currentStatus, targetStatus, entityType }
    );
    this.name = 'StatusTransitionError';
  }
}

// ===== ERROR HANDLER CLASS =====

export class WarehouseErrorHandler {
  private errorLog: WarehouseError[] = [];
  private maxLogSize: number = 1000;
  private errorCallbacks = new Map<string, Array<(error: WarehouseError) => void>>();

  /**
   * Handle error with context
   */
  handleError(error: Error, context?: ErrorContext): WarehouseError {
    const warehouseError = this.normalizeError(error, context);
    
    // Log error
    this.logError(warehouseError);
    
    // Trigger callbacks
    this.triggerCallbacks(warehouseError);
    
    // Report to monitoring service (if configured)
    this.reportError(warehouseError);
    
    return warehouseError;
  }

  /**
   * Normalize error to WarehouseError
   */
  private normalizeError(error: Error, context?: ErrorContext): WarehouseError {
    if (this.isWarehouseError(error)) {
      if (context) {
        error.operation = context.operation;
        error.details = { ...error.details, ...context.metadata };
      }
      return error;
    }

    // Convert generic error to WarehouseError
    const warehouseError = new SystemError(
      error.message,
      ERROR_CODES.SYSTEM.SERVER_ERROR,
      { originalError: error.name, stack: error.stack }
    );

    if (context) {
      warehouseError.operation = context.operation;
      warehouseError.details = { ...warehouseError.details, ...context.metadata };
    }

    return warehouseError;
  }

  /**
   * Check if error is a WarehouseError
   */
  private isWarehouseError(error: unknown): error is WarehouseError {
    if (!error || typeof error !== 'object') return false;
    const obj = error as Record<string, unknown>;
    return (
      'code' in obj &&
      typeof obj.code === 'string' && 
      'timestamp' in obj &&
      obj.timestamp instanceof Date
    );
  }

  /**
   * Log error to internal log
   */
  private logError(error: WarehouseError): void {
    this.errorLog.push(error);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging based on severity
    const logMethod = this.getLogMethod(error.severity);
    logMethod(`[${error.code}] ${error.message}`, {
      operation: error.operation,
      field: error.field,
      details: error.details,
      timestamp: error.timestamp,
    });
  }

  /**
   * Get appropriate console log method based on severity
   */
  private getLogMethod(severity: string): typeof console.log {
    switch (severity) {
      case 'critical':
      case 'high':
        return console.error;
      case 'medium':
        return console.warn;
      case 'low':
      default:
        return console.log;
    }
  }

  /**
   * Trigger error callbacks
   */
  private triggerCallbacks(error: WarehouseError): void {
    const callbacks = this.errorCallbacks.get(error.code) || [];
    const globalCallbacks = this.errorCallbacks.get('*') || [];
    
    [...callbacks, ...globalCallbacks].forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  /**
   * Report error to external monitoring service
   */
  private reportError(error: WarehouseError): void {
    // This would integrate with external error reporting services
    // like Sentry, Bugsnag, etc.
    if (error.severity === 'critical' || error.severity === 'high') {
      // Report critical errors immediately
      console.error('Critical error reported:', error);
    }
  }

  /**
   * Register error callback
   */
  onError(errorCode: string, callback: (error: WarehouseError) => void): void {
    if (!this.errorCallbacks.has(errorCode)) {
      this.errorCallbacks.set(errorCode, []);
    }
    this.errorCallbacks.get(errorCode)!.push(callback);
  }

  /**
   * Remove error callback
   */
  offError(errorCode: string, callback: (error: WarehouseError) => void): void {
    const callbacks = this.errorCallbacks.get(errorCode);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsBySeverity: Record<string, number>;
    errorsByCode: Record<string, number>;
    recentErrors: WarehouseError[];
  } {
    const errorsBySeverity: Record<string, number> = {};
    const errorsByCode: Record<string, number> = {};

    this.errorLog.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
    });

    const recentErrors = this.errorLog
      .filter(error => Date.now() - error.timestamp.getTime() < 3600000) // Last hour
      .slice(-10); // Last 10 errors

    return {
      totalErrors: this.errorLog.length,
      errorsBySeverity,
      errorsByCode,
      recentErrors,
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get errors by criteria
   */
  getErrors(criteria?: {
    severity?: string;
    code?: string;
    operation?: string;
    since?: Date;
  }): WarehouseError[] {
    let filteredErrors = [...this.errorLog];

    if (criteria) {
      if (criteria.severity) {
        filteredErrors = filteredErrors.filter(error => error.severity === criteria.severity);
      }
      
      if (criteria.code) {
        filteredErrors = filteredErrors.filter(error => error.code === criteria.code);
      }
      
      if (criteria.operation) {
        filteredErrors = filteredErrors.filter(error => error.operation === criteria.operation);
      }
      
      if (criteria.since) {
        filteredErrors = filteredErrors.filter(error => error.timestamp >= criteria.since!);
      }
    }

    return filteredErrors;
  }
}

// ===== RETRY UTILITIES =====

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: Error) => boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: (error: Error) => {
    if (error instanceof WarehouseValidationError || error instanceof BusinessRuleError || error instanceof SystemError || error instanceof NetworkError) {
      return error.retryable;
    }
    return error instanceof NetworkError || error.name === 'TimeoutError';
  },
};

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.retryCondition!(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// ===== ERROR RECOVERY UTILITIES =====

/**
 * Circuit breaker for preventing cascading failures
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new SystemError('Circuit breaker is open', ERROR_CODES.SYSTEM.SERVER_ERROR);
      }
    }

    try {
      const result = await fn();
      
      if (this.state === 'half-open') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }

  getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// ===== ERROR FORMATTERS =====

/**
 * Format error for user display
 */
export function formatErrorForUser(error: WarehouseError): string {
  const userFriendlyMessages: Record<string, string> = {
    [ERROR_CODES.VALIDATION.REQUIRED_FIELD]: 'This field is required.',
    [ERROR_CODES.VALIDATION.INVALID_FORMAT]: 'Please check the format of your input.',
    [ERROR_CODES.BUSINESS_RULE.INSUFFICIENT_CAPACITY]: 'Not enough capacity available for this operation.',
    [ERROR_CODES.BUSINESS_RULE.INVALID_STATUS_TRANSITION]: 'This action is not allowed in the current state.',
    [ERROR_CODES.SYSTEM.NETWORK_ERROR]: 'Network connection error. Please try again.',
    [ERROR_CODES.SYSTEM.SERVER_ERROR]: 'A server error occurred. Please try again later.',
    [ERROR_CODES.SYSTEM.TIMEOUT]: 'The operation timed out. Please try again.',
    [ERROR_CODES.SYSTEM.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  };

  return userFriendlyMessages[error.code] || error.message;
}

/**
 * Format error for developer display
 */
export function formatErrorForDeveloper(error: WarehouseError): string {
  return `[${error.code}] ${error.message}${error.field ? ` (Field: ${error.field})` : ''}${
    error.operation ? ` (Operation: ${error.operation})` : ''
  }`;
}

/**
 * Extract validation errors from error
 */
export function extractValidationErrors(error: WarehouseError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (error instanceof WarehouseValidationError && error.field) {
    errors[error.field] = formatErrorForUser(error);
  } else if (error.details?.validationErrors) {
    Object.assign(errors, error.details.validationErrors);
  }
  
  return errors;
}

// ===== GLOBAL ERROR HANDLER =====

export const warehouseErrorHandler = new WarehouseErrorHandler();

// ===== ERROR UTILITIES =====

/**
 * Create error from GraphQL error
 */
export function createErrorFromGraphQL(graphqlError: Record<string, unknown>): WarehouseError {
  const extensions = (graphqlError.extensions as Record<string, unknown>) || {};
  const code = (extensions.code as string) || ERROR_CODES.SYSTEM.SERVER_ERROR;
  
  if (code.startsWith('VALIDATION_')) {
    return new WarehouseValidationError(
      graphqlError.message as string,
      extensions.field as string,
      code,
      extensions
    );
  }
  
  if (code.startsWith('BUSINESS_')) {
    return new BusinessRuleError(
      graphqlError.message as string,
      code,
      extensions
    );
  }
  
  return new SystemError(
    graphqlError.message as string,
    code,
    extensions
  );
}

/**
 * Handle Apollo Client errors
 */
export function handleApolloError(error: Record<string, unknown>): WarehouseError {
  if (error.networkError) {
    return new NetworkError(
      'Network error occurred',
      { originalError: error.networkError as Record<string, unknown> }
    );
  }
  
  if (error.graphQLErrors && Array.isArray(error.graphQLErrors) && error.graphQLErrors.length > 0) {
    return createErrorFromGraphQL(error.graphQLErrors[0] as Record<string, unknown>);
  }
  
  return new SystemError(
    (error.message as string) || 'Unknown error occurred',
    ERROR_CODES.SYSTEM.SERVER_ERROR,
    { originalError: error }
  );
}

/**
 * Error boundary helper for React components
 */
export function createErrorBoundary(
  fallbackComponent: React.ComponentType<{ error: WarehouseError }>,
  onError?: (error: WarehouseError) => void
) {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { error: WarehouseError | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): { error: WarehouseError } {
      const warehouseError = warehouseErrorHandler.handleError(error, {
        operation: 'component_render',
      });
      
      return { error: warehouseError };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const warehouseError = warehouseErrorHandler.handleError(error, {
        operation: 'component_render',
        metadata: errorInfo as Record<string, unknown>,
      });
      
      if (onError) {
        onError(warehouseError);
      }
    }

    render() {
      if (this.state.error) {
        return React.createElement(fallbackComponent, { error: this.state.error });
      }

      return this.props.children;
    }
  };
}