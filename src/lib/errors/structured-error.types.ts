/**
 * Structured Error Types
 * 
 * Comprehensive error structure for user-friendly display and troubleshooting.
 * Every error contains both user-facing and technical information.
 */

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Technical details about the error for debugging
 */
export interface ErrorTechnicalDetails {
  // Original error information
  originalMessage: string;
  errorCode?: string;
  errorType?: string;
  
  // Stack trace and debugging info
  stackTrace?: string;
  
  // Request context
  operationName?: string;
  operationType?: 'query' | 'mutation' | 'subscription';
  variables?: Record<string, unknown>;
  
  // Response context
  statusCode?: number;
  graphQLErrors?: Array<{
    message: string;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
  
  // Timing information
  timestamp: string;
  duration?: number;
  
  // Tracing
  correlationId?: string;
  requestId?: string;
  
  // Additional context
  metadata?: Record<string, unknown>;
}

/**
 * User-friendly error information
 */
export interface ErrorUserInfo {
  // Short, clear message for the user
  title: string;
  
  // Detailed explanation (optional)
  description?: string;
  
  // Suggested actions
  suggestions?: string[];
  
  // Support information
  supportMessage?: string;
}

/**
 * Complete structured error
 */
export interface StructuredError {
  // Categorization
  category: ErrorCategory;
  severity: ErrorSeverity;
  
  // User-facing information
  userInfo: ErrorUserInfo;
  
  // Technical details for debugging
  technicalDetails: ErrorTechnicalDetails;
  
  // UI hints
  isRetryable: boolean;
  isDismissible: boolean;
  autoHideDuration?: number; // milliseconds, undefined = no auto-hide
}

/**
 * Operation result with success/error information
 */
export interface OperationResult {
  success: boolean;
  operationName: string;
  operationType: 'query' | 'mutation' | 'subscription';
  duration: number;
  timestamp: string;
  correlationId?: string;
  
  // For successful operations
  data?: unknown;
  
  // For failed operations
  error?: StructuredError;
}
