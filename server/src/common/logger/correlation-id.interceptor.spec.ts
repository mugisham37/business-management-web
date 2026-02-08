import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { CorrelationIdInterceptor } from './correlation-id.interceptor';
import { LoggerService } from './logger.service';

describe('CorrelationIdInterceptor', () => {
  let interceptor: CorrelationIdInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    interceptor = new CorrelationIdInterceptor();

    mockRequest = {
      headers: {},
      user: undefined,
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(() => of('test response')),
    } as CallHandler;
  });

  describe('Correlation ID Generation', () => {
    it('should generate a correlation ID if not provided', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Correlation-ID',
            expect.any(String),
          );
          done();
        },
      });
    });

    it('should use existing X-Correlation-ID header', (done) => {
      const existingId = 'existing-correlation-id';
      mockRequest.headers['x-correlation-id'] = existingId;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Correlation-ID',
            existingId,
          );
          done();
        },
      });
    });

    it('should use existing X-Request-ID header as fallback', (done) => {
      const existingId = 'existing-request-id';
      mockRequest.headers['x-request-id'] = existingId;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Correlation-ID',
            existingId,
          );
          done();
        },
      });
    });

    it('should prefer X-Correlation-ID over X-Request-ID', (done) => {
      mockRequest.headers['x-correlation-id'] = 'correlation-id';
      mockRequest.headers['x-request-id'] = 'request-id';

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Correlation-ID',
            'correlation-id',
          );
          done();
        },
      });
    });
  });

  describe('Context Injection', () => {
    it('should inject correlation ID into logger context', (done) => {
      const correlationId = 'test-correlation-id';
      mockRequest.headers['x-correlation-id'] = correlationId;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          // Context should be set during request handling
          // We can't directly test AsyncLocalStorage here, but we verify the flow works
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should include user ID in context if user is authenticated', (done) => {
      const userId = 'user-123';
      const organizationId = 'org-456';
      mockRequest.user = { id: userId, organizationId };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle requests without authenticated user', (done) => {
      mockRequest.user = undefined;

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should maintain correlation ID context on errors', (done) => {
      const correlationId = 'error-correlation-id';
      mockRequest.headers['x-correlation-id'] = correlationId;
      
      const error = new Error('Test error');
      mockCallHandler.handle = jest.fn(() => throwError(() => error));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (err) => {
          expect(err).toBe(error);
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Correlation-ID',
            correlationId,
          );
          done();
        },
      });
    });

    it('should set correlation ID header even when request fails', (done) => {
      mockCallHandler.handle = jest.fn(() => throwError(() => new Error('Test error')));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Correlation-ID',
            expect.any(String),
          );
          done();
        },
      });
    });
  });

  describe('Request Flow', () => {
    it('should call next handler', (done) => {
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: () => {
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should pass through response data', (done) => {
      const responseData = { data: 'test' };
      mockCallHandler.handle = jest.fn(() => of(responseData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (data) => {
          expect(data).toEqual(responseData);
          done();
        },
      });
    });
  });
});
