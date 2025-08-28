// Base error classes
export abstract class DomainError<TCode extends string = string> extends Error {
  abstract readonly code: TCode;
  abstract readonly statusCode: number;
  public readonly timestamp: string;
  public readonly requestId: string | undefined;

  constructor(message: string, requestId?: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      requestId: this.requestId,
      stack: this.stack,
    };
  }
}

// Authentication errors
export class AuthenticationError extends DomainError<'AUTHENTICATION_FAILED'> {
  readonly code = 'AUTHENTICATION_FAILED' as const;
  readonly statusCode = 401;
}

export class AuthorizationError extends DomainError<'AUTHORIZATION_FAILED'> {
  readonly code = 'AUTHORIZATION_FAILED' as const;
  readonly statusCode = 403;
}

export class InvalidCredentialsError extends DomainError<'INVALID_CREDENTIALS'> {
  readonly code = 'INVALID_CREDENTIALS' as const;
  readonly statusCode = 401;
}

export class TokenExpiredError extends DomainError<'TOKEN_EXPIRED'> {
  readonly code = 'TOKEN_EXPIRED' as const;
  readonly statusCode = 401;
}

export class InvalidTokenError extends DomainError<'INVALID_TOKEN'> {
  readonly code = 'INVALID_TOKEN' as const;
  readonly statusCode = 401;
}

// Validation errors
export class ValidationError extends DomainError<'VALIDATION_FAILED'> {
  readonly code = 'VALIDATION_FAILED' as const;
  readonly statusCode = 400;
  public readonly field: string | undefined;
  public readonly details: Record<string, any> | undefined;

  constructor(message: string, field?: string, details?: Record<string, any>, requestId?: string) {
    super(message, requestId);
    this.field = field;
    this.details = details;
  }
}

// Resource errors
export class NotFoundError extends DomainError<'RESOURCE_NOT_FOUND'> {
  readonly code = 'RESOURCE_NOT_FOUND' as const;
  readonly statusCode = 404;
}

export class ConflictError extends DomainError<'RESOURCE_CONFLICT'> {
  readonly code = 'RESOURCE_CONFLICT' as const;
  readonly statusCode = 409;
}

export class DuplicateResourceError extends DomainError<'DUPLICATE_RESOURCE'> {
  readonly code = 'DUPLICATE_RESOURCE' as const;
  readonly statusCode = 409;
}

// Business logic errors
export class BusinessLogicError extends DomainError<'BUSINESS_LOGIC_ERROR'> {
  readonly code = 'BUSINESS_LOGIC_ERROR' as const;
  readonly statusCode = 422;
}

export class InsufficientPermissionsError extends DomainError<'INSUFFICIENT_PERMISSIONS'> {
  readonly code = 'INSUFFICIENT_PERMISSIONS' as const;
  readonly statusCode = 403;
}

// System errors
export class InternalServerError extends DomainError<'INTERNAL_SERVER_ERROR'> {
  readonly code = 'INTERNAL_SERVER_ERROR' as const;
  readonly statusCode = 500;
}

export class ServiceUnavailableError extends DomainError<'SERVICE_UNAVAILABLE'> {
  readonly code = 'SERVICE_UNAVAILABLE' as const;
  readonly statusCode = 503;
}

// Rate limiting errors
export class RateLimitError extends DomainError<'RATE_LIMIT_EXCEEDED'> {
  readonly code = 'RATE_LIMIT_EXCEEDED' as const;
  readonly statusCode = 429;
}

// Error factory
export class ErrorFactory {
  static authentication(message: string, requestId?: string): AuthenticationError {
    return new AuthenticationError(message, requestId);
  }

  static authorization(message: string, requestId?: string): AuthorizationError {
    return new AuthorizationError(message, requestId);
  }

  static validation(
    message: string,
    field?: string,
    details?: Record<string, any>,
    requestId?: string
  ): ValidationError {
    return new ValidationError(message, field, details, requestId);
  }

  static notFound(message: string, requestId?: string): NotFoundError {
    return new NotFoundError(message, requestId);
  }

  static conflict(message: string, requestId?: string): ConflictError {
    return new ConflictError(message, requestId);
  }

  static businessLogic(message: string, requestId?: string): BusinessLogicError {
    return new BusinessLogicError(message, requestId);
  }

  static internal(message: string, requestId?: string): InternalServerError {
    return new InternalServerError(message, requestId);
  }
}
