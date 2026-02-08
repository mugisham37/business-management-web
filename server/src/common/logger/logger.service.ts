import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  LOG = 'log',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogContext {
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  trace?: string;
}

/**
 * Custom Logger Service with structured logging, correlation ID injection,
 * context-aware logging, and sensitive data masking.
 * 
 * Features:
 * - Structured JSON logging for production
 * - Correlation ID tracking across requests
 * - Context-aware logging with user/org information
 * - Automatic sensitive data masking
 * - Multiple log levels with filtering
 * - Configurable transports (console, file, external services)
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private static logLevel: LogLevel = LogLevel.LOG;
  private static asyncLocalStorage = new AsyncLocalStorage<LogContext>();

  // Sensitive field patterns to mask
  private static readonly SENSITIVE_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /authorization/i,
    /api[_-]?key/i,
    /access[_-]?token/i,
    /refresh[_-]?token/i,
    /mfa[_-]?secret/i,
    /backup[_-]?code/i,
    /credit[_-]?card/i,
    /ssn/i,
    /social[_-]?security/i,
  ];

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Set the global log level
   */
  static setLogLevel(level: LogLevel): void {
    LoggerService.logLevel = level;
  }

  /**
   * Get the current log level
   */
  static getLogLevel(): LogLevel {
    return LoggerService.logLevel;
  }

  /**
   * Set correlation context for the current async context
   */
  static setContext(context: LogContext): void {
    LoggerService.asyncLocalStorage.enterWith(context);
  }

  /**
   * Get the current correlation context
   */
  static getContext(): LogContext | undefined {
    return LoggerService.asyncLocalStorage.getStore();
  }

  /**
   * Run a function with a specific correlation context
   */
  static runWithContext<T>(context: LogContext, fn: () => T): T {
    return LoggerService.asyncLocalStorage.run(context, fn);
  }

  /**
   * Set the context name for this logger instance
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Log a message at LOG level
   */
  log(message: string, context?: string, metadata?: any): void {
    this.writeLog(LogLevel.LOG, message, context, metadata);
  }

  /**
   * Log an error message
   */
  error(message: string, trace?: string, context?: string, metadata?: any): void {
    this.writeLog(LogLevel.ERROR, message, context, { ...metadata, trace });
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: string, metadata?: any): void {
    this.writeLog(LogLevel.WARN, message, context, metadata);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: string, metadata?: any): void {
    this.writeLog(LogLevel.DEBUG, message, context, metadata);
  }

  /**
   * Log a verbose message
   */
  verbose(message: string, context?: string, metadata?: any): void {
    this.writeLog(LogLevel.VERBOSE, message, context, metadata);
  }

  /**
   * Core logging method that handles structured logging
   */
  private writeLog(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: any,
  ): void {
    // Check if this log level should be output
    if (!this.shouldLog(level)) {
      return;
    }

    const logContext = context || this.context;
    const correlationContext = LoggerService.getContext();
    
    // Mask sensitive data in metadata
    const maskedMetadata = metadata ? this.maskSensitiveData(metadata) : undefined;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: logContext,
      correlationId: correlationContext?.correlationId,
      metadata: maskedMetadata,
    };

    // Add trace if present (for errors)
    if (maskedMetadata?.trace) {
      logEntry.trace = maskedMetadata.trace;
      delete maskedMetadata.trace;
    }

    // Output based on environment
    this.output(logEntry);
  }

  /**
   * Determine if a log level should be output based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.LOG, LogLevel.DEBUG, LogLevel.VERBOSE];
    const currentLevelIndex = levels.indexOf(LoggerService.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Output the log entry to the appropriate transport
   */
  private output(entry: LogEntry): void {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Structured JSON logging for production
      console.log(JSON.stringify(entry));
    } else {
      // Human-readable logging for development
      const colorMap: Record<LogLevel, string> = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.LOG]: '\x1b[32m',   // Green
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.VERBOSE]: '\x1b[35m', // Magenta
      };
      const resetColor = '\x1b[0m';
      const color = colorMap[entry.level] || '';

      let output = `${color}[${entry.timestamp}] [${entry.level.toUpperCase()}]${resetColor}`;
      
      if (entry.context) {
        output += ` ${color}[${entry.context}]${resetColor}`;
      }
      
      if (entry.correlationId) {
        output += ` ${color}[${entry.correlationId}]${resetColor}`;
      }
      
      output += ` ${entry.message}`;

      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        output += `\n${JSON.stringify(entry.metadata, null, 2)}`;
      }

      if (entry.trace) {
        output += `\n${entry.trace}`;
      }

      console.log(output);
    }
  }

  /**
   * Mask sensitive data in objects recursively
   */
  private maskSensitiveData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle primitive types
    if (typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    // Handle objects
    const masked: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Check if key matches sensitive patterns
      if (this.isSensitiveField(key)) {
        masked[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively mask nested objects
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  /**
   * Check if a field name matches sensitive patterns
   */
  private isSensitiveField(fieldName: string): boolean {
    return LoggerService.SENSITIVE_PATTERNS.some(pattern => 
      pattern.test(fieldName)
    );
  }
}
