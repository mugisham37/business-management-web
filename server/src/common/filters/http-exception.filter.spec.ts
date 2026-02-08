import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { LoggerService } from '../logger/logger.service';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let loggerService: LoggerService;

  const mockLoggerService = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  const mockRequest = {
    url: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'test-agent',
    },
  };

  const mockHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    loggerService = module.get<LoggerService>(LoggerService);
    filter = new HttpExceptionFilter(loggerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost as any);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'HttpException',
          message: 'Test error',
          timestamp: expect.any(String),
          path: '/test',
          correlationId: expect.any(String),
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const exception = new BadRequestException({
        error: 'ValidationError',
        message: 'Validation failed',
        details: { field: 'email' },
      });

      filter.catch(exception, mockHost as any);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'ValidationError',
          message: 'Validation failed',
          details: { field: 'email' },
        }),
      );
    });

    it('should handle generic Error', () => {
      const exception = new Error('Generic error');

      filter.catch(exception, mockHost as any);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'InternalServerError',
          message: 'Internal server error',
        }),
      );
      expect(mockLoggerService.error).toHaveBeenCalled();
    });

    it('should mask sensitive data in error messages', () => {
      const exception = new HttpException(
        'Error with password: secret123',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost as any);

      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('[REDACTED]'),
        }),
      );
    });

    it('should mask sensitive data in error details', () => {
      const exception = new BadRequestException({
        error: 'ValidationError',
        message: 'Validation failed',
        details: {
          password: 'secret123',
          token: 'abc123',
          email: 'test@example.com',
        },
      });

      filter.catch(exception, mockHost as any);

      const sendCall = mockResponse.send.mock.calls[0][0];
      expect(sendCall.details.password).toBe('[REDACTED]');
      expect(sendCall.details.token).toBe('[REDACTED]');
      expect(sendCall.details.email).toBe('test@example.com');
    });

    it('should log errors with correlation ID', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost as any);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        expect.stringContaining('HTTP 400'),
        'HttpExceptionFilter',
        expect.objectContaining({
          correlationId: expect.any(String),
          statusCode: HttpStatus.BAD_REQUEST,
          path: '/test',
          method: 'GET',
        }),
      );
    });

    it('should log 5xx errors with error level', () => {
      const exception = new HttpException(
        'Server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockHost as any);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('HTTP 500'),
        expect.any(String),
        'HttpExceptionFilter',
        expect.any(Object),
      );
    });

    it('should log 4xx errors with warn level', () => {
      const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost as any);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        expect.stringContaining('HTTP 400'),
        'HttpExceptionFilter',
        expect.any(Object),
      );
    });

    it('should include user context in logs when available', () => {
      const mockRequestWithUser = {
        ...mockRequest,
        user: {
          id: 'user-123',
          organizationId: 'org-456',
        },
      };

      const mockHostWithUser = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
          getRequest: () => mockRequestWithUser,
        }),
      };

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHostWithUser as any);

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        expect.any(String),
        'HttpExceptionFilter',
        expect.objectContaining({
          userId: 'user-123',
          organizationId: 'org-456',
        }),
      );
    });
  });
});
