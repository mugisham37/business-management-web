import { LoggerService, LogLevel } from './logger.service';

describe('LoggerService', () => {
  let logger: LoggerService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new LoggerService('TestContext');
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    // Reset log level to default
    LoggerService.setLogLevel(LogLevel.LOG);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Basic Logging', () => {
    it('should log a message at LOG level', () => {
      logger.log('Test message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('Test message');
      expect(logOutput).toContain('TestContext');
    });

    it('should log an error message', () => {
      logger.error('Error message', 'Stack trace');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('Error message');
      expect(logOutput).toContain('Stack trace');
    });

    it('should log a warning message', () => {
      logger.warn('Warning message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('Warning message');
    });

    it('should log a debug message', () => {
      LoggerService.setLogLevel(LogLevel.DEBUG);
      logger.debug('Debug message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('Debug message');
    });

    it('should log a verbose message', () => {
      LoggerService.setLogLevel(LogLevel.VERBOSE);
      logger.verbose('Verbose message');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('Verbose message');
    });
  });

  describe('Context Management', () => {
    it('should use the context provided in constructor', () => {
      logger.log('Test message');
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('TestContext');
    });

    it('should allow setting context after construction', () => {
      logger.setContext('NewContext');
      logger.log('Test message');
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('NewContext');
    });

    it('should allow overriding context per log call', () => {
      logger.log('Test message', 'OverrideContext');
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('OverrideContext');
    });
  });

  describe('Correlation ID', () => {
    it('should include correlation ID when set in context', () => {
      const correlationId = 'test-correlation-id-123';
      
      LoggerService.runWithContext({ correlationId }, () => {
        logger.log('Test message');
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain(correlationId);
    });

    it('should maintain correlation ID across multiple log calls', () => {
      const correlationId = 'test-correlation-id-456';
      
      LoggerService.runWithContext({ correlationId }, () => {
        logger.log('First message');
        logger.log('Second message');
      });
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy.mock.calls[0][0]).toContain(correlationId);
      expect(consoleLogSpy.mock.calls[1][0]).toContain(correlationId);
    });

    it('should allow setting context directly', () => {
      const correlationId = 'direct-correlation-id';
      LoggerService.setContext({ correlationId });
      
      logger.log('Test message');
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain(correlationId);
    });

    it('should return current context', () => {
      const context = { correlationId: 'test-id', userId: 'user-123' };
      LoggerService.setContext(context);
      
      const retrievedContext = LoggerService.getContext();
      expect(retrievedContext).toEqual(context);
    });
  });

  describe('Sensitive Data Masking', () => {
    it('should mask password fields', () => {
      logger.log('User login', 'Auth', { 
        username: 'john@example.com',
        password: 'secret123',
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('john@example.com');
      expect(logOutput).not.toContain('secret123');
      expect(logOutput).toContain('[REDACTED]');
    });

    it('should mask token fields', () => {
      logger.log('Token generated', 'Auth', {
        userId: 'user-123',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
        refreshToken: 'refresh-token-value',
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('user-123');
      expect(logOutput).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(logOutput).not.toContain('refresh-token-value');
      expect(logOutput).toContain('[REDACTED]');
    });

    it('should mask secret fields', () => {
      logger.log('MFA setup', 'MFA', {
        userId: 'user-123',
        mfaSecret: 'JBSWY3DPEHPK3PXP',
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('user-123');
      expect(logOutput).not.toContain('JBSWY3DPEHPK3PXP');
      expect(logOutput).toContain('[REDACTED]');
    });

    it('should mask authorization headers', () => {
      logger.log('Request received', 'HTTP', {
        method: 'POST',
        authorization: 'Bearer token123',
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('POST');
      expect(logOutput).not.toContain('Bearer token123');
      expect(logOutput).toContain('[REDACTED]');
    });

    it('should mask API keys', () => {
      logger.log('External API call', 'Integration', {
        endpoint: '/api/users',
        apiKey: 'sk_live_123456789',
        api_key: 'another_key',
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('/api/users');
      expect(logOutput).not.toContain('sk_live_123456789');
      expect(logOutput).not.toContain('another_key');
    });

    it('should mask nested sensitive fields', () => {
      logger.log('User data', 'Users', {
        user: {
          id: 'user-123',
          email: 'john@example.com',
          credentials: {
            password: 'secret123',
            mfaSecret: 'JBSWY3DPEHPK3PXP',
          },
        },
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('user-123');
      expect(logOutput).toContain('john@example.com');
      expect(logOutput).not.toContain('secret123');
      expect(logOutput).not.toContain('JBSWY3DPEHPK3PXP');
    });

    it('should mask sensitive fields in arrays', () => {
      logger.log('Batch operation', 'Users', {
        users: [
          { id: '1', password: 'pass1' },
          { id: '2', password: 'pass2' },
        ],
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).not.toContain('pass1');
      expect(logOutput).not.toContain('pass2');
    });

    it('should handle null and undefined values', () => {
      logger.log('Test message', 'Test', {
        nullValue: null,
        undefinedValue: undefined,
        password: 'secret',
      });
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).not.toContain('secret');
    });
  });

  describe('Log Levels', () => {
    it('should respect log level filtering', () => {
      LoggerService.setLogLevel(LogLevel.WARN);
      
      logger.debug('Debug message');
      logger.log('Log message');
      logger.warn('Warn message');
      logger.error('Error message');
      
      // Only warn and error should be logged
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    it('should log all levels when set to VERBOSE', () => {
      LoggerService.setLogLevel(LogLevel.VERBOSE);
      
      logger.error('Error');
      logger.warn('Warn');
      logger.log('Log');
      logger.debug('Debug');
      logger.verbose('Verbose');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(5);
    });

    it('should only log errors when set to ERROR', () => {
      LoggerService.setLogLevel(LogLevel.ERROR);
      
      logger.error('Error');
      logger.warn('Warn');
      logger.log('Log');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should get current log level', () => {
      LoggerService.setLogLevel(LogLevel.DEBUG);
      expect(LoggerService.getLogLevel()).toBe(LogLevel.DEBUG);
    });
  });

  describe('Structured Logging', () => {
    it('should include metadata in logs', () => {
      logger.log('Operation completed', 'Service', {
        userId: 'user-123',
        duration: 150,
        success: true,
      });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('user-123');
      expect(logOutput).toContain('150');
      expect(logOutput).toContain('true');
    });

    it('should include timestamp in logs', () => {
      logger.log('Test message');
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      // Check for ISO timestamp format
      expect(logOutput).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should format logs as JSON in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      logger.log('Test message', 'TestContext', { key: 'value' });
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('level', 'log');
      expect(parsed).toHaveProperty('message', 'Test message');
      expect(parsed).toHaveProperty('context', 'TestContext');
      expect(parsed.metadata).toHaveProperty('key', 'value');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Logging', () => {
    it('should include stack trace in error logs', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error.stack, 'ErrorContext');
      
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('Error occurred');
      expect(logOutput).toContain('Test error');
    });

    it('should handle errors without stack traces', () => {
      logger.error('Error occurred', undefined, 'ErrorContext');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      const logOutput = consoleLogSpy.mock.calls[0][0];
      expect(logOutput).toContain('Error occurred');
    });
  });
});
