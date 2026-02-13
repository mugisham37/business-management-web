import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { ErrorCode } from './error-codes.enum';
import { ErrorResponse } from './error-response.interface';
import { AuditService } from '../../audit/audit.service';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly auditService: AuditService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType<GqlContextType>();

    if (contextType === 'graphql') {
      return this.handleGraphQLException(exception, host);
    } else {
      return this.handleHttpException(exception, host);
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorResponse = {
        code: this.mapHttpStatusToErrorCode(status, exceptionResponse),
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || exception.message,
        details:
          typeof exceptionResponse === 'object'
            ? (exceptionResponse as any).details
            : undefined,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else {
      // Unexpected error - log with full context
      this.logError(exception, request);

      errorResponse = {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    // Sanitize sensitive data from error response
    errorResponse = this.sanitizeErrorResponse(errorResponse);

    response.status(status).json(errorResponse);
  }

  private handleGraphQLException(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();
    const request = context.req;

    if (!(exception instanceof HttpException)) {
      // Log unexpected errors
      this.logError(exception, request);
    }

    // GraphQL will handle the exception formatting
    // We just need to log it
    return exception;
  }

  private logError(exception: unknown, request: any) {
    const user = request?.user;
    const errorDetails = {
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      userId: user?.userId,
      organizationId: user?.organizationId,
      path: request?.url || request?.path,
      method: request?.method,
      body: this.sanitizeRequestBody(request?.body),
      query: request?.query,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Unexpected error occurred', errorDetails);

    // Log to audit service if user context is available
    if (user?.userId && user?.organizationId) {
      this.auditService
        .logAuthFailure(
          user.email || 'unknown',
          'SYSTEM_ERROR',
          {
            ipAddress: request?.ip || 'unknown',
            userAgent: request?.headers?.['user-agent'] || 'unknown',
            timestamp: new Date(),
          },
          user.organizationId,
        )
        .catch((err) => {
          this.logger.error('Failed to log error to audit service', err);
        });
    }
  }

  private sanitizeErrorResponse(error: ErrorResponse): ErrorResponse {
    // Remove any sensitive data from error details
    if (error.details) {
      const sanitized = { ...error.details };
      delete sanitized.password;
      delete sanitized.token;
      delete sanitized.secret;
      delete sanitized.refreshToken;
      delete sanitized.accessToken;
      delete sanitized.mfaSecret;
      delete sanitized.backupCodes;
      error.details = sanitized;
    }
    return error;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.refreshToken;
    delete sanitized.accessToken;
    delete sanitized.mfaSecret;
    delete sanitized.currentPassword;
    delete sanitized.newPassword;

    return sanitized;
  }

  private mapHttpStatusToErrorCode(
    status: number,
    exceptionResponse: any,
  ): ErrorCode {
    // Try to extract error code from exception response
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse.code &&
      Object.values(ErrorCode).includes(exceptionResponse.code)
    ) {
      return exceptionResponse.code;
    }

    // Map HTTP status to default error code
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.INVALID_CREDENTIALS;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.INSUFFICIENT_PERMISSIONS;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.USER_NOT_FOUND;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMIT_EXCEEDED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.DATABASE_UNAVAILABLE;
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
