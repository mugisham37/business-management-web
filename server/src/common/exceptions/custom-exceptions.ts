import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base class for custom exceptions with additional details
 */
export class CustomException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    error: string,
    details?: Record<string, any>,
  ) {
    super(
      {
        error,
        message,
        details,
      },
      statusCode,
    );
  }
}

// ============================================================================
// Validation Errors (400)
// ============================================================================

export class ValidationException extends CustomException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, 'ValidationError', details);
  }
}

export class InvalidInputException extends CustomException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, 'InvalidInput', details);
  }
}

export class PasswordStrengthException extends CustomException {
  constructor(message: string = 'Password does not meet strength requirements', details?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, 'PasswordStrengthError', details);
  }
}

export class EmailFormatException extends CustomException {
  constructor(message: string = 'Invalid email format', details?: Record<string, any>) {
    super(message, HttpStatus.BAD_REQUEST, 'EmailFormatError', details);
  }
}

// ============================================================================
// Authentication Errors (401)
// ============================================================================

export class AuthenticationException extends CustomException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'AuthenticationError', details);
  }
}

export class InvalidCredentialsException extends CustomException {
  constructor(message: string = 'Invalid credentials', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'InvalidCredentials', details);
  }
}

export class ExpiredTokenException extends CustomException {
  constructor(message: string = 'Token has expired', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'ExpiredToken', details);
  }
}

export class RevokedSessionException extends CustomException {
  constructor(message: string = 'Session has been revoked', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'RevokedSession', details);
  }
}

export class UnverifiedEmailException extends CustomException {
  constructor(message: string = 'Email address is not verified', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'UnverifiedEmail', details);
  }
}

export class MFARequiredException extends CustomException {
  constructor(message: string = 'Multi-factor authentication is required', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'MFARequired', details);
  }
}

export class InvalidMFACodeException extends CustomException {
  constructor(message: string = 'Invalid MFA code', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'InvalidMFACode', details);
  }
}

export class InvalidTokenException extends CustomException {
  constructor(message: string = 'Invalid token', details?: Record<string, any>) {
    super(message, HttpStatus.UNAUTHORIZED, 'InvalidToken', details);
  }
}

// ============================================================================
// Authorization Errors (403)
// ============================================================================

export class AuthorizationException extends CustomException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'AuthorizationError', details);
  }
}

export class InsufficientPermissionsException extends CustomException {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'InsufficientPermissions', details);
  }
}

export class CrossTenantAccessException extends CustomException {
  constructor(message: string = 'Cross-tenant access is not allowed', details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'CrossTenantAccess', details);
  }
}

export class DelegationValidationException extends CustomException {
  constructor(message: string = 'Delegation validation failed', details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'DelegationValidationError', details);
  }
}

export class LocationAccessException extends CustomException {
  constructor(message: string = 'Location access denied', details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'LocationAccessDenied', details);
  }
}

export class AccountSuspendedException extends CustomException {
  constructor(message: string = 'Account has been suspended', details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'AccountSuspended', details);
  }
}

export class AccountDeactivatedException extends CustomException {
  constructor(message: string = 'Account has been deactivated', details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'AccountDeactivated', details);
  }
}

export class AccountLockedException extends CustomException {
  constructor(message: string = 'Account is locked', details?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, 'AccountLocked', details);
  }
}

// ============================================================================
// Resource Errors (404)
// ============================================================================

export class ResourceNotFoundException extends CustomException {
  constructor(resource: string, identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, 'ResourceNotFound', details);
  }
}

export class UserNotFoundException extends CustomException {
  constructor(identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `User with identifier '${identifier}' not found`
      : 'User not found';
    super(message, HttpStatus.NOT_FOUND, 'UserNotFound', details);
  }
}

export class OrganizationNotFoundException extends CustomException {
  constructor(identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `Organization with identifier '${identifier}' not found`
      : 'Organization not found';
    super(message, HttpStatus.NOT_FOUND, 'OrganizationNotFound', details);
  }
}

export class RoleNotFoundException extends CustomException {
  constructor(identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `Role with identifier '${identifier}' not found`
      : 'Role not found';
    super(message, HttpStatus.NOT_FOUND, 'RoleNotFound', details);
  }
}

export class SessionNotFoundException extends CustomException {
  constructor(identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `Session with identifier '${identifier}' not found`
      : 'Session not found';
    super(message, HttpStatus.NOT_FOUND, 'SessionNotFound', details);
  }
}

export class LocationNotFoundException extends CustomException {
  constructor(identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `Location with identifier '${identifier}' not found`
      : 'Location not found';
    super(message, HttpStatus.NOT_FOUND, 'LocationNotFound', details);
  }
}

export class DepartmentNotFoundException extends CustomException {
  constructor(identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `Department with identifier '${identifier}' not found`
      : 'Department not found';
    super(message, HttpStatus.NOT_FOUND, 'DepartmentNotFound', details);
  }
}

export class InvitationNotFoundException extends CustomException {
  constructor(identifier?: string, details?: Record<string, any>) {
    const message = identifier
      ? `Invitation with identifier '${identifier}' not found`
      : 'Invitation not found';
    super(message, HttpStatus.NOT_FOUND, 'InvitationNotFound', details);
  }
}

// ============================================================================
// Conflict Errors (409)
// ============================================================================

export class ConflictException extends CustomException {
  constructor(message: string, details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, 'ConflictError', details);
  }
}

export class DuplicateEmailException extends CustomException {
  constructor(email?: string, details?: Record<string, any>) {
    const message = email
      ? `Email '${email}' is already in use`
      : 'Email is already in use';
    super(message, HttpStatus.CONFLICT, 'DuplicateEmail', details);
  }
}

export class DuplicateUsernameException extends CustomException {
  constructor(username?: string, details?: Record<string, any>) {
    const message = username
      ? `Username '${username}' is already in use`
      : 'Username is already in use';
    super(message, HttpStatus.CONFLICT, 'DuplicateUsername', details);
  }
}

export class OrganizationLimitReachedException extends CustomException {
  constructor(limitType: string, details?: Record<string, any>) {
    super(
      `Organization limit reached for ${limitType}`,
      HttpStatus.CONFLICT,
      'OrganizationLimitReached',
      details,
    );
  }
}

export class RoleInUseException extends CustomException {
  constructor(message: string = 'Role is currently assigned to users and cannot be deleted', details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, 'RoleInUse', details);
  }
}

export class DepartmentInUseException extends CustomException {
  constructor(message: string = 'Department has assigned users and cannot be deleted', details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, 'DepartmentInUse', details);
  }
}

export class PasswordHistoryException extends CustomException {
  constructor(message: string = 'Password has been used recently', details?: Record<string, any>) {
    super(message, HttpStatus.CONFLICT, 'PasswordHistory', details);
  }
}

// ============================================================================
// Rate Limit Errors (429)
// ============================================================================

export class RateLimitException extends CustomException {
  constructor(message: string = 'Too many requests', details?: Record<string, any>) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'RateLimitExceeded', details);
  }
}

export class BruteForceProtectionException extends CustomException {
  constructor(message: string = 'Too many failed attempts', details?: Record<string, any>) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'BruteForceProtection', details);
  }
}

// ============================================================================
// Server Errors (500)
// ============================================================================

export class InternalServerException extends CustomException {
  constructor(message: string = 'Internal server error', details?: Record<string, any>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'InternalServerError', details);
  }
}

export class DatabaseException extends CustomException {
  constructor(message: string = 'Database error occurred', details?: Record<string, any>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'DatabaseError', details);
  }
}

export class CacheException extends CustomException {
  constructor(message: string = 'Cache error occurred', details?: Record<string, any>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'CacheError', details);
  }
}

export class EncryptionException extends CustomException {
  constructor(message: string = 'Encryption error occurred', details?: Record<string, any>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'EncryptionError', details);
  }
}

export class ExternalServiceException extends CustomException {
  constructor(service: string, message?: string, details?: Record<string, any>) {
    super(
      message || `External service '${service}' error`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'ExternalServiceError',
      details,
    );
  }
}

// ============================================================================
// Service Unavailable (503)
// ============================================================================

export class ServiceUnavailableException extends CustomException {
  constructor(message: string = 'Service temporarily unavailable', details?: Record<string, any>) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, 'ServiceUnavailable', details);
  }
}

export class DatabaseConnectionException extends CustomException {
  constructor(message: string = 'Database connection failed', details?: Record<string, any>) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, 'DatabaseConnectionError', details);
  }
}
