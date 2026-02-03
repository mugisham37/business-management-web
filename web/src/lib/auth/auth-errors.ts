/**
 * Authentication Error Handling
 * 
 * Comprehensive error handling system for authentication operations.
 * Provides error categorization, user-friendly messages, and recovery actions.
 */

export enum AuthErrorCode {
  // Network & Connection Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_LOST = 'CONNECTION_LOST',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',

  // Token Errors
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',

  // MFA Errors
  MFA_REQUIRED = 'MFA_REQUIRED',
  MFA_INVALID_TOKEN = 'MFA_INVALID_TOKEN',
  MFA_TOKEN_EXPIRED = 'MFA_TOKEN_EXPIRED',
  MFA_SETUP_REQUIRED = 'MFA_SETUP_REQUIRED',
  MFA_BACKUP_CODE_INVALID = 'MFA_BACKUP_CODE_INVALID',

  // OAuth Errors
  OAUTH_CANCELLED = 'OAUTH_CANCELLED',
  OAUTH_FAILED = 'OAUTH_FAILED',
  OAUTH_STATE_MISMATCH = 'OAUTH_STATE_MISMATCH',
  POPUP_BLOCKED = 'POPUP_BLOCKED',
  PROVIDER_ERROR = 'PROVIDER_ERROR',

  // Permission Errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED = 'ROLE_REQUIRED',
  TIER_UPGRADE_REQUIRED = 'TIER_UPGRADE_REQUIRED',

  // Validation Errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_INPUT = 'INVALID_INPUT',

  // Registration Errors
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  REGISTRATION_DISABLED = 'REGISTRATION_DISABLED',
  INVITATION_REQUIRED = 'INVITATION_REQUIRED',
  DOMAIN_NOT_ALLOWED = 'DOMAIN_NOT_ALLOWED',

  // Session Errors
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  CONCURRENT_SESSION_LIMIT = 'CONCURRENT_SESSION_LIMIT',

  // Security Errors
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DEVICE_NOT_TRUSTED = 'DEVICE_NOT_TRUSTED',
  LOCATION_BLOCKED = 'LOCATION_BLOCKED',
  SECURITY_POLICY_VIOLATION = 'SECURITY_POLICY_VIOLATION',

  // Generic Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  RATE_LIMITED = 'RATE_LIMITED',
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: string | undefined;
  retryable: boolean;
  retryAfter?: number | undefined; // seconds
  actionRequired?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  timestamp?: Date | undefined;
}

export interface ErrorMessageResult {
  message: string;
  action?: string | undefined;
  severity: 'error' | 'warning' | 'info';
  canRetry: boolean;
  retryAfter?: number | undefined;
}

/**
 * Authentication Error Handler
 * 
 * Provides centralized error handling with user-friendly messages
 * and appropriate recovery actions.
 */
class AuthErrorHandler {
  private errorMessages: Record<AuthErrorCode, ErrorMessageResult> = {
    // Network & Connection Errors
    [AuthErrorCode.NETWORK_ERROR]: {
      message: 'Network connection failed. Please check your internet connection.',
      action: 'retry',
      severity: 'error',
      canRetry: true,
      retryAfter: 3,
    },
    [AuthErrorCode.CONNECTION_LOST]: {
      message: 'Connection lost. Attempting to reconnect...',
      action: 'retry',
      severity: 'warning',
      canRetry: true,
      retryAfter: 5,
    },
    [AuthErrorCode.TIMEOUT_ERROR]: {
      message: 'Request timed out. Please try again.',
      action: 'retry',
      severity: 'error',
      canRetry: true,
      retryAfter: 3,
    },
    [AuthErrorCode.SERVER_ERROR]: {
      message: 'Server error occurred. Please try again later.',
      action: 'retry',
      severity: 'error',
      canRetry: true,
      retryAfter: 10,
    },
    [AuthErrorCode.SERVICE_UNAVAILABLE]: {
      message: 'Service is temporarily unavailable. Please try again later.',
      action: 'retry',
      severity: 'error',
      canRetry: true,
      retryAfter: 30,
    },

    // Authentication Errors
    [AuthErrorCode.INVALID_CREDENTIALS]: {
      message: 'Invalid email or password. Please check your credentials.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.EMAIL_NOT_VERIFIED]: {
      message: 'Please verify your email address before signing in.',
      action: 'verify_email',
      severity: 'warning',
      canRetry: false,
    },
    [AuthErrorCode.ACCOUNT_LOCKED]: {
      message: 'Your account has been locked due to security reasons.',
      action: 'contact_support',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.ACCOUNT_DISABLED]: {
      message: 'Your account has been disabled. Please contact support.',
      action: 'contact_support',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.ACCOUNT_NOT_FOUND]: {
      message: 'No account found with this email address.',
      action: 'register',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.PASSWORD_EXPIRED]: {
      message: 'Your password has expired. Please reset your password.',
      action: 'reset_password',
      severity: 'warning',
      canRetry: false,
    },
    [AuthErrorCode.TOO_MANY_ATTEMPTS]: {
      message: 'Too many failed attempts. Please try again later.',
      severity: 'error',
      canRetry: true,
      retryAfter: 300, // 5 minutes
    },

    // Token Errors
    [AuthErrorCode.TOKEN_EXPIRED]: {
      message: 'Your session has expired. Please sign in again.',
      action: 'login',
      severity: 'warning',
      canRetry: false,
    },
    [AuthErrorCode.TOKEN_INVALID]: {
      message: 'Invalid session. Please sign in again.',
      action: 'login',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.TOKEN_REFRESH_FAILED]: {
      message: 'Failed to refresh session. Please sign in again.',
      action: 'login',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.TOKEN_REVOKED]: {
      message: 'Your session has been revoked. Please sign in again.',
      action: 'login',
      severity: 'warning',
      canRetry: false,
    },

    // MFA Errors
    [AuthErrorCode.MFA_REQUIRED]: {
      message: 'Multi-factor authentication is required.',
      action: 'mfa_verify',
      severity: 'info',
      canRetry: false,
    },
    [AuthErrorCode.MFA_INVALID_TOKEN]: {
      message: 'Invalid verification code. Please try again.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.MFA_TOKEN_EXPIRED]: {
      message: 'Verification code has expired. Please request a new one.',
      action: 'mfa_resend',
      severity: 'warning',
      canRetry: false,
    },
    [AuthErrorCode.MFA_SETUP_REQUIRED]: {
      message: 'Multi-factor authentication setup is required.',
      action: 'mfa_setup',
      severity: 'info',
      canRetry: false,
    },
    [AuthErrorCode.MFA_BACKUP_CODE_INVALID]: {
      message: 'Invalid backup code. Please try again.',
      severity: 'error',
      canRetry: true,
    },

    // OAuth Errors
    [AuthErrorCode.OAUTH_CANCELLED]: {
      message: 'Social login was cancelled.',
      severity: 'info',
      canRetry: true,
    },
    [AuthErrorCode.OAUTH_FAILED]: {
      message: 'Social login failed. Please try again.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.OAUTH_STATE_MISMATCH]: {
      message: 'Security error during social login. Please try again.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.POPUP_BLOCKED]: {
      message: 'Popup was blocked. Please allow popups and try again.',
      action: 'allow_popups',
      severity: 'warning',
      canRetry: true,
    },
    [AuthErrorCode.PROVIDER_ERROR]: {
      message: 'Social login provider error. Please try again.',
      severity: 'error',
      canRetry: true,
    },

    // Permission Errors
    [AuthErrorCode.PERMISSION_DENIED]: {
      message: 'You do not have permission to perform this action.',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: {
      message: 'Insufficient permissions for this operation.',
      action: 'contact_admin',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.ROLE_REQUIRED]: {
      message: 'A specific role is required for this action.',
      action: 'contact_admin',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.TIER_UPGRADE_REQUIRED]: {
      message: 'Please upgrade your plan to access this feature.',
      action: 'upgrade_plan',
      severity: 'info',
      canRetry: false,
    },

    // Validation Errors
    [AuthErrorCode.INVALID_EMAIL]: {
      message: 'Please enter a valid email address.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.WEAK_PASSWORD]: {
      message: 'Password is too weak. Please choose a stronger password.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.PASSWORD_MISMATCH]: {
      message: 'Passwords do not match.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.REQUIRED_FIELD_MISSING]: {
      message: 'Please fill in all required fields.',
      severity: 'error',
      canRetry: true,
    },
    [AuthErrorCode.INVALID_INPUT]: {
      message: 'Invalid input. Please check your information.',
      severity: 'error',
      canRetry: true,
    },

    // Registration Errors
    [AuthErrorCode.EMAIL_ALREADY_EXISTS]: {
      message: 'An account with this email already exists.',
      action: 'login',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.REGISTRATION_DISABLED]: {
      message: 'Registration is currently disabled.',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.INVITATION_REQUIRED]: {
      message: 'An invitation is required to register.',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.DOMAIN_NOT_ALLOWED]: {
      message: 'Email domain is not allowed for registration.',
      severity: 'error',
      canRetry: false,
    },

    // Session Errors
    [AuthErrorCode.SESSION_EXPIRED]: {
      message: 'Your session has expired. Please sign in again.',
      action: 'login',
      severity: 'warning',
      canRetry: false,
    },
    [AuthErrorCode.SESSION_INVALID]: {
      message: 'Invalid session. Please sign in again.',
      action: 'login',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.CONCURRENT_SESSION_LIMIT]: {
      message: 'Maximum number of concurrent sessions reached.',
      action: 'manage_sessions',
      severity: 'warning',
      canRetry: false,
    },

    // Security Errors
    [AuthErrorCode.SUSPICIOUS_ACTIVITY]: {
      message: 'Suspicious activity detected. Please verify your identity.',
      action: 'verify_identity',
      severity: 'warning',
      canRetry: false,
    },
    [AuthErrorCode.DEVICE_NOT_TRUSTED]: {
      message: 'Device not trusted. Please verify your identity.',
      action: 'verify_device',
      severity: 'warning',
      canRetry: false,
    },
    [AuthErrorCode.LOCATION_BLOCKED]: {
      message: 'Access from this location is blocked.',
      action: 'contact_support',
      severity: 'error',
      canRetry: false,
    },
    [AuthErrorCode.SECURITY_POLICY_VIOLATION]: {
      message: 'Security policy violation detected.',
      action: 'contact_support',
      severity: 'error',
      canRetry: false,
    },

    // Generic Errors
    [AuthErrorCode.UNKNOWN_ERROR]: {
      message: 'An unexpected error occurred. Please try again.',
      action: 'retry',
      severity: 'error',
      canRetry: true,
      retryAfter: 5,
    },
    [AuthErrorCode.MAINTENANCE_MODE]: {
      message: 'System is under maintenance. Please try again later.',
      severity: 'info',
      canRetry: true,
      retryAfter: 300,
    },
    [AuthErrorCode.RATE_LIMITED]: {
      message: 'Too many requests. Please slow down.',
      severity: 'warning',
      canRetry: true,
      retryAfter: 60,
    },
  };

  /**
   * Get user-friendly error message and action for an auth error
   */
  getErrorMessage(error: AuthError): ErrorMessageResult {
    const defaultMessage = this.errorMessages[AuthErrorCode.UNKNOWN_ERROR];
    const errorMessage = this.errorMessages[error.code] || defaultMessage;

    const result: ErrorMessageResult = {
      message: errorMessage.message,
      severity: errorMessage.severity,
      canRetry: errorMessage.canRetry,
    };
    
    if (errorMessage.action !== undefined) {
      result.action = errorMessage.action;
    }
    
    const retryAfter = error.retryAfter ?? errorMessage.retryAfter;
    if (retryAfter !== undefined) {
      result.retryAfter = retryAfter;
    }
    
    return result;
  }

  /**
   * Create an AuthError from various error sources
   */
  createError(
    code: AuthErrorCode,
    message?: string,
    details?: string,
    metadata?: Record<string, unknown>
  ): AuthError {
    const defaultMessage = this.errorMessages[code];
    
    const error: AuthError = {
      code,
      message: message || defaultMessage.message,
      retryable: defaultMessage.canRetry,
      timestamp: new Date(),
    };
    
    if (details !== undefined) {
      error.details = details;
    }
    if (defaultMessage.retryAfter !== undefined) {
      error.retryAfter = defaultMessage.retryAfter;
    }
    if (defaultMessage.action !== undefined) {
      error.actionRequired = defaultMessage.action;
    }
    if (metadata !== undefined) {
      error.metadata = metadata;
    }
    
    return error;
  }

  /**
   * Parse GraphQL errors into AuthError
   */
  parseGraphQLError(error: unknown): AuthError {
    const gqlError = error as { 
      graphQLErrors?: Array<{ 
        message: string; 
        extensions?: { code?: string; details?: string; [key: string]: unknown } 
      }>; 
      networkError?: { message: string }; 
      message?: string 
    };
    
    if (gqlError.graphQLErrors && gqlError.graphQLErrors.length > 0) {
      const firstError = gqlError.graphQLErrors[0];
      if (firstError) {
        const code = this.mapGraphQLErrorCode(firstError.extensions?.code);
        
        return this.createError(
          code,
          firstError.message,
          firstError.extensions?.details,
          firstError.extensions as Record<string, unknown> | undefined
        );
      }
    }

    if (gqlError.networkError) {
      return this.createError(
        AuthErrorCode.NETWORK_ERROR,
        gqlError.networkError.message,
        undefined,
        { networkError: gqlError.networkError }
      );
    }

    return this.createError(
      AuthErrorCode.UNKNOWN_ERROR,
      gqlError.message || 'An unexpected error occurred'
    );
  }

  /**
   * Map GraphQL error codes to AuthErrorCode
   */
  private mapGraphQLErrorCode(code?: string): AuthErrorCode {
    const mapping: Record<string, AuthErrorCode> = {
      'INVALID_CREDENTIALS': AuthErrorCode.INVALID_CREDENTIALS,
      'EMAIL_NOT_VERIFIED': AuthErrorCode.EMAIL_NOT_VERIFIED,
      'ACCOUNT_LOCKED': AuthErrorCode.ACCOUNT_LOCKED,
      'ACCOUNT_DISABLED': AuthErrorCode.ACCOUNT_DISABLED,
      'TOO_MANY_ATTEMPTS': AuthErrorCode.TOO_MANY_ATTEMPTS,
      'MFA_REQUIRED': AuthErrorCode.MFA_REQUIRED,
      'MFA_INVALID_TOKEN': AuthErrorCode.MFA_INVALID_TOKEN,
      'TOKEN_EXPIRED': AuthErrorCode.TOKEN_EXPIRED,
      'TOKEN_INVALID': AuthErrorCode.TOKEN_INVALID,
      'PERMISSION_DENIED': AuthErrorCode.PERMISSION_DENIED,
      'EMAIL_ALREADY_EXISTS': AuthErrorCode.EMAIL_ALREADY_EXISTS,
      'WEAK_PASSWORD': AuthErrorCode.WEAK_PASSWORD,
      'RATE_LIMITED': AuthErrorCode.RATE_LIMITED,
    };

    return mapping[code || ''] || AuthErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: AuthError): boolean {
    return error.retryable;
  }

  /**
   * Get retry delay in seconds
   */
  getRetryDelay(error: AuthError): number {
    return error.retryAfter || 5;
  }
}

// Export singleton instance
export const authErrorHandler = new AuthErrorHandler();

/**
 * Utility functions for error handling
 */
export function isAuthError(error: unknown): error is AuthError {
  return error !== null && typeof error === 'object' && 'code' in error && 'message' in error;
}

export function createAuthError(
  code: AuthErrorCode,
  message?: string,
  details?: string,
  metadata?: Record<string, unknown>
): AuthError {
  return authErrorHandler.createError(code, message, details, metadata);
}

export function parseError(error: unknown): AuthError {
  if (isAuthError(error)) {
    return error;
  }

  return authErrorHandler.parseGraphQLError(error);
}