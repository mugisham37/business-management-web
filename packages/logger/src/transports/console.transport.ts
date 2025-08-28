import winston from 'winston';

export interface ConsoleTransportOptions extends winston.transports.ConsoleTransportOptions {
  colorize?: boolean;
  timestamp?: boolean;
  prettyPrint?: boolean;
}

/**
 * Console transport for development and debugging
 */
export class ConsoleTransport extends winston.transports.Console {
  constructor(options: ConsoleTransportOptions = {}) {
    const formats = [];

    if (options.timestamp !== false) {
      formats.push(
        winston.format.timestamp({
          format: 'HH:mm:ss.SSS',
        })
      );
    }

    if (options.colorize !== false) {
      formats.push(winston.format.colorize());
    }

    formats.push(winston.format.errors({ stack: true }));
    formats.push(
      winston.format.printf(({ timestamp, level, message, service, correlationId, ...meta }) => {
        const prefix = timestamp ? `${timestamp} ` : '';
        const serviceInfo = service ? `[${service}] ` : '';
        const corrId = correlationId ? `(${correlationId}) ` : '';
        const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';

        return `${prefix}${level}: ${serviceInfo}${corrId}${message}${metaString}`;
      })
    );

    const format = winston.format.combine(...formats);

    super({
      ...options,
      format,
    });
  }
}

export const createConsoleTransport = (options: ConsoleTransportOptions = {}): ConsoleTransport => {
  return new ConsoleTransport(options);
};
