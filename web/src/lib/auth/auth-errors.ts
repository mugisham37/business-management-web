/**
 * Authentication Error Handling
 * Comprehensive error types and handling for authentication flows
 */

export enum AuthErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_LOST = 'CONNECTION_LOST',
  
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  
  // Social auth errors
  OAUTH_CANCELLED = 'OAUTH_CANCELLED',
  OAUTH_FAILED = 'OAUTH_FAILED',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',
  POPUP_BLOCKED = 'POPUP_BLOCKED',
  
  // Token errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_FAILED = 'REFRESH_FAILED',
  
  // Rate limiting
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  RATE_LIMITED = 'RATE_LIMITED',
  
  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  retryAfter?: number; // seconds
  userMessage: string;
  actionRequired?: 'VERIFY_EMAIL' | 'RESET_PASSWORD' | 'CONTACT_SUPPORT' | 'RETRY';
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
  retryableErrors: AuthErrorCode[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    AuthErrorCode.NETWORK_ERROR,
    AuthErrorCode.TIMEOUT_ERROR,
    AuthErrorCode.CONNECTION_LOST,
    AuthErrorCode.SERVER_ERROR,
    AuthErrorCode.SERVICE_UNAVAILABLE,
  ],
};

/**
 * Auth Error Handler
 * Provides error classification, user-friendly messages, and retry logic
 */
export class AuthErrorHandler {
  private retryConfig: RetryConfig;

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
  }

  /**
   * Classify and enhance error with user-friendly information
   */
  classifyError(error: unknown, context?: string): AuthError {
    // Type guard for error objects
    const err = error as { name?: string; message?: string; status?: number; headers?: Record<string, string>; extensions?: Record<string, unknown> };
    
    // Network errors
    if (err.name === 'TypeError' && err.message?.includes('fetch')) {
      return {
        code: AuthErrorCode.NETWORK_ERROR,
        message: 'Network request failed',
        retryable: true,
        userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
        actionRequired: 'RETRY',
      };
    }

    if (err.name === 'AbortError' || err.message?.includes('timeout')) {
      return {
        code: AuthErrorCode.TIMEOUT_ERROR,
        message: 'Request timed out',
        retryable: true,
        userMessage: 'The request took too long to complete. Please try again.',
        actionRequired: 'RETRY',
      };
    }

    // HTTP status-based errors
    if (err.status) {
      switch (err.status) {
        case 401:
          return this.handleUnauthorizedError(err);
        case 403:
          return this.handleForbiddenError(err);
        case 429:
          return this.handleRateLimitError(error);
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            code: AuthErrorCode.SERVER_ERROR,
            message: `Server error: ${err.status}`,
            retryable: true,
            retryAfter: 5,
            userMessage: 'Our servers are experiencing issues. Please try again in a few moments.',
            actionRequired: 'RETRY',
          };
      }
    }

    // Social auth specific errors
    if (context === 'social_auth') {
      return this.handleSocialAuthError(error);
    }

    // GraphQL errors
    const graphQLErr = err as { graphQLErrors?: unknown[] };
    if (graphQLErr.graphQLErrors && graphQLErr.graphQLErrors.length > 0) {
      return this.handleGraphQLError(graphQLErr.graphQLErrors[0]);
    }

    // Default unknown error
    return {
      code: AuthErrorCode.UNKNOWN_ERROR,
      message: err.message || 'Unknown error occurred',
      retryable: false,
      userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      actionRequired: 'CONTACT_SUPPORT',
    };
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private handleUnauthorizedError(error: unknown): AuthError {
    const err = error as { body?: { code?: string }; code?: string };
    const errorCode = err.body?.code || err.code;
    
    switch (errorCode) {
      case 'INVALID_CREDENTIALS':
        return {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
          retryable: false,
          userMessage: 'The email or password you entered is incorrect. Please try again.',
        };
      
      case 'ACCOUNT_LOCKED':
        return {
          code: AuthErrorCode.ACCOUNT_LOCKED,
          message: 'Account is locked',
          retryable: false,
          userMessage: 'Your account has been locked due to too many failed login attempts. Please contact support.',
          actionRequired: 'CONTACT_SUPPORT',
        };
      
      case 'EMAIL_NOT_VERIFIED':
        return {
          code: AuthErrorCode.EMAIL_NOT_VERIFIED,
          message: 'Email not verified',
          retryable: false,
          userMessage: 'Please verify your email address before signing in.',
          actionRequired: 'VERIFY_EMAIL',
        };
      
      default:
        return {
          code: AuthErrorCode.INVALID_CREDENTIALS,
          message: 'Authentication failed',
          retryable: false,
          userMessage: 'Authentication failed. Please check your credentials and try again.',
        };
    }
  }

  /**
   * Handle 403 Forbidden errors
   */
  private handleForbiddenError(error: unknown): AuthError {
    return {
      code: AuthErrorCode.ACCOUNT_DISABLED,
      message: 'Account access denied',
      retryable: false,
      userMessage: 'Your account has been disabled. Please contact support for assistance.',
      actionRequired: 'CONTACT_SUPPORT',
    };
  }

  /**
   * Handle 429 Rate Limit errors
   */
  private handleRateLimitError(error: unknown): AuthError {
    const err = error as { headers?: Record<string, string> };
    const retryAfter = parseInt(err.headers?.['retry-after'] || '60') || 60;
    
    return {
      code: AuthErrorCode.TOO_MANY_ATTEMPTS,
      message: 'Too many attempts',
      retryable: true,
      retryAfter,
      userMessage: `Too many login attempts. Please wait ${retryAfter} seconds before trying again.`,
      actionRequired: 'RETRY',
    };
  }

  /**
   * Handle social authentication errors
   */
  private handleSocialAuthError(error: unknown): AuthError {
    const err = error as { message?: string };
    
    if (err.message?.includes('popup')) {
      return {
        code: AuthErrorCode.POPUP_BLOCKED,
        message: 'Popup blocked',
        retryable: true,
        userMessage: 'Please allow popups for this site and try again.',
        actionRequired: 'RETRY',
      };
    }

    if (err.message?.includes('cancelled')) {
      return {
        code: AuthErrorCode.OAUTH_CANCELLED,
        message: 'OAuth cancelled',
        retryable: true,
        userMessage: 'Sign-in was cancelled. Please try again if you want to continue.',
        actionRequired: 'RETRY',
      };
    }

    return {
      code: AuthErrorCode.OAUTH_FAILED,
      message: err.message || 'Social authentication failed',
      retryable: true,
      userMessage: 'Social sign-in failed. Please try again or use email/password instead.',
      actionRequired: 'RETRY',
    };
  }

  /**
   * Handle GraphQL errors
   */
  private handleGraphQLError(error: unknown): AuthError {
    const err = error as { extensions?: { code?: string }; message?: string };
    const code = err.extensions?.code;
    
    switch (code) {
      case 'UNAUTHENTICATED':
        return {
          code: AuthErrorCode.TOKEN_EXPIRED,
          message: 'Session expired',
          retryable: false,
          userMessage: 'Your session has expired. Please sign in again.',
        };
      
      case 'FORBIDDEN':
        return {
          code: AuthErrorCode.ACCOUNT_DISABLED,
          message: 'Access forbidden',
          retryable: false,
          userMessage: 'You do not have permission to access this resource.',
        };
      
      default:
        return {
          code: AuthErrorCode.SERVER_ERROR,
          message: err.message || 'Unknown error',
          retryable: true,
          userMessage: 'A server error occurred. Please try again.',
          actionRequired: 'RETRY',
        };
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: AuthError): boolean {
    return error.retryable && this.retryConfig.retryableErrors.includes(error.code);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attemptNumber: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attemptNumber - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Execute function with retry logic
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    context?: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    let lastError: AuthError;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this.classifyError(error, context);

        // If not retryable or last attempt, throw the error
        if (!this.isRetryable(lastError) || attempt === config.maxAttempts) {
          throw lastError;
        }

        // Wait before retrying
        const delay = this.calculateRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Get user-friendly error message with action suggestions
   */
  getErrorMessage(error: AuthError): { message: string; action?: string } {
    const result: { message: string; action?: string } = {
      message: error.userMessage,
    };

    switch (error.actionRequired) {
      case 'RETRY':
        result.action = 'Try Again';
        break;
      case 'VERIFY_EMAIL':
        result.action = 'Verify Email';
        break;
      case 'RESET_PASSWORD':
        result.action = 'Reset Password';
        break;
      case 'CONTACT_SUPPORT':
        result.action = 'Contact Support';
        break;
    }

    return result;
  }
}

// Export singleton instance
export const authErrorHandler = new AuthErrorHandler();

/**
 * Network connectivity checker
 */
export class NetworkChecker {
  private isOnline: boolean = true;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners(true);
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners(false);
  };

  private notifyListeners(online: boolean) {
    this.listeners.forEach(listener => listener(online));
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  addListener(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async checkConnectivity(): Promise<boolean> {
    if (!this.isOnline) {
      return false;
    }

    try {
      // Try to fetch a small resource to verify connectivity
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const networkChecker = new NetworkChecker();