import { logger } from '../logging/winston-logger';

// Base error class for database operations
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string = 'DATABASE_ERROR', details?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

// Connection error
export class ConnectionError extends DatabaseError {
  constructor(message: string, details?: any) {
    super(message, 'CONNECTION_ERROR', details);
    this.name = 'ConnectionError';
  }
}

// Query error
export class QueryError extends DatabaseError {
  constructor(message: string, details?: any) {
    super(message, 'QUERY_ERROR', details);
    this.name = 'QueryError';
  }
}

// Migration error
export class MigrationError extends DatabaseError {
  constructor(message: string, details?: any) {
    super(message, 'MIGRATION_ERROR', details);
    this.name = 'MigrationError';
  }
}

// Validation error
export class ValidationError extends DatabaseError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Transaction error
export class TransactionError extends DatabaseError {
  constructor(message: string, details?: any) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'TransactionError';
  }
}

// Error handler utility
export function handleDatabaseError(error: any, context?: string): never {
  const contextMsg = context ? `[${context}] ` : '';

  if (error instanceof DatabaseError) {
    logger.error(`${contextMsg}Database error: ${error.message}`, {
      code: error.code,
      details: error.details,
      stack: error.stack,
    });
    throw error;
  }

  // Handle Prisma errors
  if (error.code && error.code.startsWith('P')) {
    const prismaError = new QueryError(`Prisma error: ${error.message}`, error);
    logger.error(`${contextMsg}Prisma error: ${error.message}`, {
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    throw prismaError;
  }

  // Handle generic errors
  const genericError = new DatabaseError(
    `${contextMsg}Unexpected database error: ${error.message}`,
    'UNKNOWN_ERROR',
    error
  );
  logger.error(`${contextMsg}Unexpected database error: ${error.message}`, {
    error: error.toString(),
    stack: error.stack,
  });
  throw genericError;
}

// Async error wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleDatabaseError(error, context);
    }
  };
}

// Sync error wrapper
export function withSyncErrorHandling<T extends any[], R>(fn: (...args: T) => R, context?: string) {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      return handleDatabaseError(error, context);
    }
  };
}
