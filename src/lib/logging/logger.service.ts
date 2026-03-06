/**
 * Frontend Logger Service
 * 
 * Centralized logging service for the frontend application.
 * Provides structured logging with correlation IDs, context awareness,
 * and optional toast notifications for user-facing messages.
 * 
 * Features:
 * - Structured console logging
 * - Correlation ID tracking
 * - Context-aware logging
 * - Toast integration for user feedback
 * - Health check filtering
 * - Environment-aware configuration
 * - Log levels: error, warn, info, debug
 * 
 * Requirements: 2.1, 6.1
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogMetadata {
  [key: string]: unknown;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableToasts: boolean;
  filterHealthChecks: boolean;
  context?: string;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

class FrontendLogger {
  private config: LoggerConfig;
  private context?: string;
  private correlationId?: string;
  private toastHandler?: (options: ToastOptions) => void;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: (process.env.NODE_ENV === 'production' ? 'info' : 'debug') as LogLevel,
      enableConsole: true,
      enableToasts: true,
      filterHealthChecks: true,
      ...config,
    };
  }

  /**
   * Set the context for subsequent log messages
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Set the correlation ID for request tracing
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  /**
   * Set the toast handler function
   */
  setToastHandler(handler: (options: ToastOptions) => void): void {
    this.toastHandler = handler;
  }

  /**
   * Check if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= configLevelIndex;
  }

  /**
   * Build log object with context and metadata
   */
  private buildLogObject(
    message: string,
    metadata?: LogMetadata,
    context?: string,
  ): Record<string, unknown> {
    const logObject: Record<string, unknown> = {
      message,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    if (context || this.context) {
      logObject.context = context || this.context;
    }

    if (this.correlationId) {
      logObject.correlationId = this.correlationId;
    }

    return logObject;
  }

  /**
   * Format log message for console
   */
  private formatConsoleMessage(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    context?: string,
  ): void {
    if (!this.config.enableConsole) return;

    const logObject = this.buildLogObject(message, metadata, context);
    const timestamp = new Date().toLocaleTimeString();
    const ctx = context || this.context || 'App';

    if (process.env.NODE_ENV === 'development') {
      // Pretty format in development - use console methods directly
      const prefix = `[${timestamp}] ${level.toUpperCase()} (${ctx}):`;
      
      switch (level) {
        case 'error':
          console.error(prefix, message, metadata || '');
          break;
        case 'warn':
          console.warn(prefix, message, metadata || '');
          break;
        case 'info':
          console.info(prefix, message, metadata || '');
          break;
        case 'debug':
          console.debug(prefix, message, metadata || '');
          break;
      }
    } else {
      // JSON format in production
      console.log(JSON.stringify({ level, ...logObject }));
    }
  }

  /**
   * Show toast notification
   */
  private showToast(options: ToastOptions): void {
    if (!this.config.enableToasts || !this.toastHandler) return;
    this.toastHandler(options);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: string): void {
    if (!this.shouldLog('error')) return;

    const metadata: LogMetadata = {};
    if (error instanceof Error) {
      metadata.error = error.message;
      metadata.stack = error.stack;
    } else if (error) {
      metadata.error = String(error);
    }

    this.formatConsoleMessage('error', message, metadata, context);
  }

  /**
   * Log an error with toast notification
   */
  errorWithToast(
    message: string,
    toastTitle: string,
    toastDescription?: string,
    error?: Error | unknown,
    context?: string,
  ): void {
    this.error(message, error, context);
    this.showToast({
      title: toastTitle,
      description: toastDescription || (error instanceof Error ? error.message : undefined),
      variant: 'error',
      duration: 5000,
    });
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata, context?: string): void {
    if (!this.shouldLog('warn')) return;
    this.formatConsoleMessage('warn', message, metadata, context);
  }

  /**
   * Log a warning with toast notification
   */
  warnWithToast(
    message: string,
    toastTitle: string,
    toastDescription?: string,
    metadata?: LogMetadata,
    context?: string,
  ): void {
    this.warn(message, metadata, context);
    this.showToast({
      title: toastTitle,
      description: toastDescription,
      variant: 'warning',
      duration: 4000,
    });
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: LogMetadata, context?: string): void {
    if (!this.shouldLog('info')) return;
    this.formatConsoleMessage('info', message, metadata, context);
  }

  /**
   * Log an info message with toast notification
   */
  infoWithToast(
    message: string,
    toastTitle: string,
    toastDescription?: string,
    metadata?: LogMetadata,
    context?: string,
  ): void {
    this.info(message, metadata, context);
    this.showToast({
      title: toastTitle,
      description: toastDescription,
      variant: 'info',
      duration: 3000,
    });
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: LogMetadata, context?: string): void {
    if (!this.shouldLog('debug')) return;
    this.formatConsoleMessage('debug', message, metadata, context);
  }

  /**
   * Log a success message with toast notification
   */
  success(
    message: string,
    toastTitle: string,
    toastDescription?: string,
    metadata?: LogMetadata,
    context?: string,
  ): void {
    this.info(message, metadata, context);
    this.showToast({
      title: toastTitle,
      description: toastDescription,
      variant: 'success',
      duration: 3000,
    });
  }

  /**
   * Check if an operation is a health check
   */
  isHealthCheck(operationName?: string, url?: string): boolean {
    if (!this.config.filterHealthChecks) return false;

    const healthCheckNames = ['Health', 'HealthCheck', 'HEALTH', 'health'];
    const healthCheckUrls = ['/health', '/health/live', '/health/ready'];

    if (operationName && healthCheckNames.includes(operationName)) {
      return true;
    }

    if (url && healthCheckUrls.some(path => url.includes(path))) {
      return true;
    }

    return false;
  }

  /**
   * Create a child logger with a specific context
   */
  createChildLogger(context: string): FrontendLogger {
    const childLogger = new FrontendLogger(this.config);
    childLogger.setContext(context);
    if (this.correlationId) {
      childLogger.setCorrelationId(this.correlationId);
    }
    if (this.toastHandler) {
      childLogger.setToastHandler(this.toastHandler);
    }
    return childLogger;
  }
}

// Export singleton instance
export const logger = new FrontendLogger();

// Export class for creating custom instances
export { FrontendLogger };
