import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  correlationId: string;
  details?: Record<string, any>;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Generate correlation ID for tracking
    const correlationId = uuidv4();

    // Determine status code and error details
    let statusCode: number;
    let errorMessage: string;
    let errorName: string;
    let details: Record<string, any> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorName = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        errorMessage = responseObj.message || exception.message;
        errorName = responseObj.error || exception.name;
        details = responseObj.details;
      } else {
        errorMessage = exception.message;
        errorName = exception.name;
      }
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Internal server error';
      errorName = 'InternalServerError';
      
      // Log the actual error for debugging but don't expose it
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
        'HttpExceptionFilter',
        {
          correlationId,
          path: request.url,
          method: request.method,
        },
      );
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Internal server error';
      errorName = 'InternalServerError';
      
      this.logger.error(
        'Unknown error type',
        undefined,
        'HttpExceptionFilter',
        {
          correlationId,
          path: request.url,
          method: request.method,
          exception: String(exception),
        },
      );
    }

    // Mask sensitive information in error messages
    errorMessage = this.maskSensitiveData(errorMessage);
    if (details) {
      details = this.maskSensitiveDataInObject(details);
    }

    // Build error response
    const errorResponse: ErrorResponse = {
      statusCode,
      error: errorName,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      ...(details && { details }),
    };

    // Log error with context
    const logContext = {
      correlationId,
      statusCode,
      path: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.id,
      organizationId: (request as any).user?.organizationId,
    };

    if (statusCode >= 500) {
      this.logger.error(
        `HTTP ${statusCode}: ${errorMessage}`,
        exception instanceof Error ? exception.stack : undefined,
        'HttpExceptionFilter',
        logContext,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `HTTP ${statusCode}: ${errorMessage}`,
        'HttpExceptionFilter',
        logContext,
      );
    }

    // Send response
    response.status(statusCode).send(errorResponse);
  }

  /**
   * Mask sensitive data in error messages
   */
  private maskSensitiveData(message: string): string {
    // Mask common sensitive patterns
    const patterns = [
      { regex: /password[:\s=]+[^\s,}]+/gi, replacement: 'password: [REDACTED]' },
      { regex: /token[:\s=]+[^\s,}]+/gi, replacement: 'token: [REDACTED]' },
      { regex: /secret[:\s=]+[^\s,}]+/gi, replacement: 'secret: [REDACTED]' },
      { regex: /api[_-]?key[:\s=]+[^\s,}]+/gi, replacement: 'api_key: [REDACTED]' },
      { regex: /authorization[:\s=]+[^\s,}]+/gi, replacement: 'authorization: [REDACTED]' },
      { regex: /bearer\s+[^\s,}]+/gi, replacement: 'bearer [REDACTED]' },
    ];

    let maskedMessage = message;
    for (const pattern of patterns) {
      maskedMessage = maskedMessage.replace(pattern.regex, pattern.replacement);
    }

    return maskedMessage;
  }

  /**
   * Mask sensitive data in error details object
   */
  private maskSensitiveDataInObject(obj: Record<string, any>): Record<string, any> {
    const sensitiveKeys = [
      'password',
      'passwordHash',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'mfaSecret',
      'apiKey',
      'authorization',
      'backupCode',
      'oauthToken',
    ];

    const masked = { ...obj };

    for (const key in masked) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        masked[key] = '[REDACTED]';
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        if (Array.isArray(masked[key])) {
          masked[key] = masked[key].map((item: any) =>
            typeof item === 'object' ? this.maskSensitiveDataInObject(item) : item,
          );
        } else {
          masked[key] = this.maskSensitiveDataInObject(masked[key]);
        }
      }
    }

    return masked;
  }
}
