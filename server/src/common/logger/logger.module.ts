import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Logger Module - Global module providing structured logging capabilities
 * 
 * Features:
 * - Structured JSON logging for production
 * - Correlation ID tracking
 * - Context-aware logging
 * - Sensitive data masking
 * - Configurable log levels
 * 
 * Usage:
 * 1. Import LoggerModule in AppModule (already global)
 * 2. Inject LoggerService in any service/controller
 * 3. Use logger methods: log(), error(), warn(), debug(), verbose()
 * 
 * Example:
 * ```typescript
 * constructor(private readonly logger: LoggerService) {
 *   this.logger.setContext('MyService');
 * }
 * 
 * someMethod() {
 *   this.logger.log('Operation completed', 'MyService', { userId: '123' });
 * }
 * ```
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
