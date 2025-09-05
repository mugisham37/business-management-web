import winston from 'winston';

// Create logger configuration
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'database' },
  transports: [
    new winston.transports.File({ filename: 'logs/database-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/database-combined.log' }),
  ],
};

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  loggerConfig.transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

// Create and export logger
export const logger = winston.createLogger(loggerConfig);

// Export logger as default
export default logger;
