import winston from 'winston';
import { getCorrelationId } from './correlation';
import { createSensitiveDataFilter } from './filters/sensitive-data.filter';
import { createJsonFormatter } from './formatters/json.formatter';
import { MetricsTransport } from './metrics/log-metrics';
import { createConsoleTransport } from './transports/console.transport';
import { createErrorFileTransport, createFileTransport } from './transports/file.transport';
import { createRemoteTransport } from './transports/remote.transport';

export interface LoggerConfig {
  level?: string;
  service?: string;
  environment?: string;
  enableConsole?: boolean;
  enableFile?: boolean;
  enableRemote?: boolean;
  enableMetrics?: boolean;
  console?: {
    colorize?: boolean;
    timestamp?: boolean;
  };
  file?: {
    directory?: string;
    maxSize?: string;
    maxFiles?: string | number;
    datePattern?: string;
  };
  remote?: {
    host: string;
    port: number;
    path?: string;
    protocol?: 'http' | 'https';
    auth?: {
      username: string;
      password: string;
    };
  };
  filters?: {
    enableSensitiveDataFilter?: boolean;
    sensitiveFields?: string[];
    sensitivePatterns?: RegExp[];
  };
}

/**
 * Logger factory for creating configured logger instances
 */
export class LoggerFactory {
  private static instance: LoggerFactory;
  private config: LoggerConfig;
  private rootLogger: winston.Logger;
  private metricsTransport?: MetricsTransport;

  private constructor(config: LoggerConfig = {}) {
    this.config = {
      level: 'info',
      environment: process.env.NODE_ENV || 'development',
      enableConsole: true,
      enableFile: true,
      enableRemote: false,
      enableMetrics: true,
      ...config,
    };

    this.rootLogger = this.createRootLogger();
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(config?: LoggerConfig): LoggerFactory {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new LoggerFactory(config);
    }
    return LoggerFactory.instance;
  }

  /**
   * Create the root logger with all configured transports
   */
  private createRootLogger(): winston.Logger {
    const transports: any[] = [];
    const formats: winston.Logform.Format[] = [];

    // Add sensitive data filter if enabled
    if (this.config.filters?.enableSensitiveDataFilter !== false) {
      const filterOptions: any = {};
      if (this.config.filters?.sensitiveFields) {
        filterOptions.fields = this.config.filters.sensitiveFields;
      }
      if (this.config.filters?.sensitivePatterns) {
        filterOptions.patterns = this.config.filters.sensitivePatterns;
      }
      formats.push(createSensitiveDataFilter(filterOptions));
    }

    // Console transport
    if (this.config.enableConsole) {
      const consoleOptions: any = {};
      if (this.config.level) consoleOptions.level = this.config.level;
      if (this.config.console?.colorize !== undefined)
        consoleOptions.colorize = this.config.console.colorize;
      if (this.config.console?.timestamp !== undefined)
        consoleOptions.timestamp = this.config.console.timestamp;
      transports.push(createConsoleTransport(consoleOptions));
    }

    // File transports
    if (this.config.enableFile) {
      const directory = this.config.file?.directory || 'logs';

      const fileOptions: any = {
        filename: `${directory}/app.log`,
      };
      if (this.config.level) fileOptions.level = this.config.level;
      if (this.config.file?.maxSize) fileOptions.maxSize = this.config.file.maxSize;
      if (this.config.file?.maxFiles) fileOptions.maxFiles = this.config.file.maxFiles;
      if (this.config.file?.datePattern) fileOptions.datePattern = this.config.file.datePattern;
      transports.push(createFileTransport(fileOptions));

      const errorFileOptions: any = {};
      if (this.config.file?.maxSize) errorFileOptions.maxSize = this.config.file.maxSize;
      if (this.config.file?.maxFiles) errorFileOptions.maxFiles = this.config.file.maxFiles;
      if (this.config.file?.datePattern)
        errorFileOptions.datePattern = this.config.file.datePattern;
      transports.push(createErrorFileTransport(`${directory}/error.log`, errorFileOptions));
    }

    // Remote transport
    if (this.config.enableRemote && this.config.remote) {
      transports.push(createRemoteTransport(this.config.remote));
    }

    // Metrics transport
    if (this.config.enableMetrics) {
      this.metricsTransport = new MetricsTransport();
      transports.push(this.metricsTransport);
    }

    // Create logger
    const loggerOptions: any = {
      format: winston.format.combine(...formats),
      transports,
      exitOnError: false,
    };
    if (this.config.level) loggerOptions.level = this.config.level;
    const logger = winston.createLogger(loggerOptions);

    // Handle uncaught exceptions and unhandled rejections
    if (this.config.environment !== 'test') {
      logger.exceptions.handle(
        new winston.transports.File({
          filename: `${this.config.file?.directory || 'logs'}/exceptions.log`,
          format: createJsonFormatter(),
        })
      );

      logger.rejections.handle(
        new winston.transports.File({
          filename: `${this.config.file?.directory || 'logs'}/rejections.log`,
          format: createJsonFormatter(),
        })
      );
    }

    return logger;
  }

  /**
   * Create a logger for a specific service
   */
  public createLogger(serviceName: string): winston.Logger {
    return this.rootLogger.child({
      service: serviceName,
      environment: this.config.environment,
      get correlationId() {
        return getCorrelationId();
      },
    });
  }

  /**
   * Create a logger with correlation ID
   */
  public createLoggerWithCorrelation(serviceName: string, correlationId: string): winston.Logger {
    return this.rootLogger.child({
      service: serviceName,
      environment: this.config.environment,
      correlationId,
    });
  }

  /**
   * Get the root logger
   */
  public getRootLogger(): winston.Logger {
    return this.rootLogger;
  }

  /**
   * Get log metrics if enabled
   */
  public getMetrics() {
    return this.metricsTransport?.getMetrics();
  }

  /**
   * Get metrics summary if enabled
   */
  public getMetricsSummary(): string | undefined {
    return this.metricsTransport?.getMetricsSummary();
  }

  /**
   * Update logger configuration
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.rootLogger = this.createRootLogger();
  }

  /**
   * Shutdown logger gracefully
   */
  public async shutdown(): Promise<void> {
    return new Promise(resolve => {
      this.rootLogger.end(() => {
        resolve();
      });
    });
  }
}

// Default logger instance
let defaultFactory: LoggerFactory;

/**
 * Initialize the default logger factory
 */
export const initializeLogger = (config: LoggerConfig = {}): LoggerFactory => {
  defaultFactory = LoggerFactory.getInstance(config);
  return defaultFactory;
};

/**
 * Get the default logger factory
 */
export const getLoggerFactory = (): LoggerFactory => {
  if (!defaultFactory) {
    defaultFactory = LoggerFactory.getInstance();
  }
  return defaultFactory;
};

/**
 * Create a logger for a service (convenience function)
 */
export const createLogger = (serviceName: string): winston.Logger => {
  return getLoggerFactory().createLogger(serviceName);
};

/**
 * Create a logger with correlation ID (convenience function)
 */
export const createLoggerWithCorrelation = (
  serviceName: string,
  correlationId: string
): winston.Logger => {
  return getLoggerFactory().createLoggerWithCorrelation(serviceName, correlationId);
};
