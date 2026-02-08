/**
 * Logger Module Usage Examples
 * 
 * This file demonstrates various ways to use the Logger Module.
 * These examples are for documentation purposes only.
 */

import { Injectable } from '@nestjs/common';
import { LoggerService, LogLevel } from './logger.service';

@Injectable()
export class ExampleService {
  constructor(private readonly logger: LoggerService) {
    // Set context for this service
    this.logger.setContext('ExampleService');
  }

  /**
   * Example 1: Basic logging
   */
  basicLogging() {
    this.logger.log('Service initialized');
    this.logger.debug('Debug information');
    this.logger.warn('Warning message');
    this.logger.error('Error occurred', new Error('Test error').stack);
  }

  /**
   * Example 2: Logging with metadata
   */
  loggingWithMetadata() {
    this.logger.log('User action', 'ExampleService', {
      userId: 'user-123',
      action: 'login',
      timestamp: new Date().toISOString(),
      success: true,
    });
  }

  /**
   * Example 3: Sensitive data masking
   */
  sensitiveDataMasking() {
    // Password will be automatically masked
    this.logger.log('User registration', 'ExampleService', {
      email: 'user@example.com',
      password: 'secret123', // Will be [REDACTED]
      username: 'john_doe',
    });

    // Tokens will be automatically masked
    this.logger.log('Authentication', 'ExampleService', {
      userId: 'user-123',
      accessToken: 'jwt-token-here', // Will be [REDACTED]
      refreshToken: 'refresh-token-here', // Will be [REDACTED]
    });
  }

  /**
   * Example 4: Error logging with stack trace
   */
  errorLogging() {
    try {
      throw new Error('Something went wrong');
    } catch (error) {
      this.logger.error(
        'Operation failed',
        error instanceof Error ? error.stack : undefined,
        'ExampleService',
        {
          operation: 'processData',
          userId: 'user-123',
        }
      );
    }
  }

  /**
   * Example 5: Context override
   */
  contextOverride() {
    // Use default context
    this.logger.log('Default context message');

    // Override context for specific log
    this.logger.log('Custom context message', 'CustomContext');
  }

  /**
   * Example 6: Manual correlation context
   */
  manualCorrelationContext() {
    // Set correlation context manually (useful for background jobs)
    LoggerService.setContext({
      correlationId: 'batch-job-123',
      userId: 'system',
      organizationId: 'org-456',
    });

    this.logger.log('Batch job started');
    this.logger.log('Processing items');
    this.logger.log('Batch job completed');
  }

  /**
   * Example 7: Running with specific context
   */
  runWithContext() {
    LoggerService.runWithContext(
      {
        correlationId: 'task-789',
        userId: 'user-123',
      },
      () => {
        this.logger.log('Task started');
        this.processTask();
        this.logger.log('Task completed');
      }
    );
  }

  private processTask() {
    // Correlation context is maintained here
    this.logger.debug('Processing task details');
  }

  /**
   * Example 8: Log level configuration
   */
  logLevelConfiguration() {
    // Set to DEBUG to see debug messages
    LoggerService.setLogLevel(LogLevel.DEBUG);
    this.logger.debug('This will be visible');

    // Set to WARN to only see warnings and errors
    LoggerService.setLogLevel(LogLevel.WARN);
    this.logger.log('This will NOT be visible');
    this.logger.warn('This will be visible');
    this.logger.error('This will be visible');

    // Reset to default
    LoggerService.setLogLevel(LogLevel.LOG);
  }

  /**
   * Example 9: Nested object logging
   */
  nestedObjectLogging() {
    this.logger.log('Complex data structure', 'ExampleService', {
      user: {
        id: 'user-123',
        email: 'user@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
        credentials: {
          password: 'secret', // Will be [REDACTED]
          mfaSecret: 'TOTP-SECRET', // Will be [REDACTED]
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'api',
      },
    });
  }

  /**
   * Example 10: Array logging
   */
  arrayLogging() {
    this.logger.log('Batch operation', 'ExampleService', {
      users: [
        { id: '1', email: 'user1@example.com', password: 'pass1' }, // password masked
        { id: '2', email: 'user2@example.com', password: 'pass2' }, // password masked
      ],
      totalProcessed: 2,
    });
  }
}

/**
 * Example: Using logger in a controller
 */
// @Controller('example')
// export class ExampleController {
//   constructor(private readonly logger: LoggerService) {
//     this.logger.setContext('ExampleController');
//   }
//
//   @Get()
//   async getExample() {
//     // Correlation ID is automatically available from CorrelationIdInterceptor
//     this.logger.log('GET /example endpoint called');
//     
//     return { message: 'Success' };
//   }
// }

/**
 * Example: Configuring log level from environment
 */
export function configureLogLevel() {
  const logLevel = process.env.LOG_LEVEL || 'log';
  
  const levelMap: Record<string, LogLevel> = {
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    log: LogLevel.LOG,
    debug: LogLevel.DEBUG,
    verbose: LogLevel.VERBOSE,
  };

  LoggerService.setLogLevel(levelMap[logLevel] || LogLevel.LOG);
}

/**
 * Example: Production vs Development output
 * 
 * Development (NODE_ENV !== 'production'):
 * [2024-02-08T10:30:00.000Z] [LOG] [ExampleService] [correlation-id-123] User logged in
 * {
 *   "userId": "user-123",
 *   "success": true
 * }
 * 
 * Production (NODE_ENV === 'production'):
 * {"timestamp":"2024-02-08T10:30:00.000Z","level":"log","message":"User logged in","context":"ExampleService","correlationId":"correlation-id-123","metadata":{"userId":"user-123","success":true}}
 */
