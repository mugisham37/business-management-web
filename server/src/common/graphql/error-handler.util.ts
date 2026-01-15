import { GraphQLError } from 'graphql';
import { GraphQLErrorCode } from './error-codes.enum';

/**
 * Custom error classes for different error scenarios
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string,
    public readonly resource?: string,
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class TenantIsolationError extends Error {
  constructor(message: string = 'Cross-tenant access not allowed') {
    super(message);
    this.name = 'TenantIsolationError';
  }
}

export class BusinessRuleViolationError extends Error {
  constructor(
    message: string,
    public readonly rule?: string,
  ) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}

export class QueryComplexityError extends Error {
  constructor(
    message: string,
    public readonly complexity?: number,
    public readonly maxComplexity?: number,
  ) {
    super(message);
    this.name = 'QueryComplexityError';
  }
}

export class QueryDepthError extends Error {
  constructor(
    message: string,
    public readonly depth?: number,
    public readonly maxDepth?: number,
  ) {
    super(message);
    this.name = 'QueryDepthError';
  }
}

/**
 * GraphQL error handler utility for consistent error formatting
 */
export class GraphQLErrorHandler {
  /**
   * Handle and format errors consistently
   */
  static handleError(error: any, context?: string): GraphQLError {
    // Log error for debugging (in production, use proper logging service)
    if (process.env.NODE_ENV !== 'production') {
      console.error(`GraphQL Error in ${context || 'unknown context'}:`, error);
    }

    // Handle validation errors
    if (error instanceof ValidationError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.VALIDATION_ERROR,
          validationErrors: error.errors,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle authentication errors
    if (error instanceof UnauthorizedError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.UNAUTHENTICATED,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle authorization errors
    if (error instanceof ForbiddenError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.FORBIDDEN,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle not found errors
    if (error instanceof NotFoundError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.NOT_FOUND,
          resource: error.resource,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle tenant isolation errors
    if (error instanceof TenantIsolationError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.CROSS_TENANT_ACCESS,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle business rule violations
    if (error instanceof BusinessRuleViolationError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.BUSINESS_RULE_VIOLATION,
          rule: error.rule,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle query complexity errors
    if (error instanceof QueryComplexityError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.QUERY_TOO_COMPLEX,
          complexity: error.complexity,
          maxComplexity: error.maxComplexity,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle query depth errors
    if (error instanceof QueryDepthError) {
      return new GraphQLError(error.message, {
        extensions: {
          code: GraphQLErrorCode.QUERY_TOO_DEEP,
          depth: error.depth,
          maxDepth: error.maxDepth,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle database errors
    if (error.code === 'DATABASE_ERROR' || error.name === 'QueryFailedError') {
      return new GraphQLError('Database operation failed', {
        extensions: {
          code: GraphQLErrorCode.DATABASE_ERROR,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle cache errors
    if (error.code === 'CACHE_ERROR') {
      return new GraphQLError('Cache operation failed', {
        extensions: {
          code: GraphQLErrorCode.CACHE_ERROR,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Default to internal server error
    return new GraphQLError('An unexpected error occurred', {
      extensions: {
        code: GraphQLErrorCode.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a validation error
   */
  static validationError(
    message: string,
    errors: Array<{ field: string; message: string }>,
  ): GraphQLError {
    return new GraphQLError(message, {
      extensions: {
        code: GraphQLErrorCode.VALIDATION_ERROR,
        validationErrors: errors,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create an authentication error
   */
  static authenticationError(message: string = 'Authentication required'): GraphQLError {
    return new GraphQLError(message, {
      extensions: {
        code: GraphQLErrorCode.UNAUTHENTICATED,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create an authorization error
   */
  static authorizationError(message: string = 'Insufficient permissions'): GraphQLError {
    return new GraphQLError(message, {
      extensions: {
        code: GraphQLErrorCode.FORBIDDEN,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a not found error
   */
  static notFoundError(message: string, resource?: string): GraphQLError {
    return new GraphQLError(message, {
      extensions: {
        code: GraphQLErrorCode.NOT_FOUND,
        resource,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a tenant isolation error
   */
  static tenantIsolationError(message: string = 'Cross-tenant access not allowed'): GraphQLError {
    return new GraphQLError(message, {
      extensions: {
        code: GraphQLErrorCode.CROSS_TENANT_ACCESS,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Create a business rule violation error
   */
  static businessRuleError(message: string, rule?: string): GraphQLError {
    return new GraphQLError(message, {
      extensions: {
        code: GraphQLErrorCode.BUSINESS_RULE_VIOLATION,
        rule,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
