import winston from 'winston';
import path from 'path';

// Define log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(LOG_COLORS);

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');

/**
 * Winston Logger Configuration
 * Logs to:
 * - Console (all levels with colors)
 * - File: logs/combined.log (all levels)
 * - File: logs/error.log (errors only)
 */
export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    // Console transport - colorized output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `${info.timestamp} [${info.level}]: ${info.message}`
        )
      ),
    }),

    // File transport - combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          (info) => {
            if (info.stack) {
              return `${info.timestamp} [${info.level}]: ${info.message}\n${info.stack}`;
            }
            return `${info.timestamp} [${info.level}]: ${info.message}`;
          }
        )
      ),
    }),

    // File transport - error logs only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          (info) => {
            if (info.stack) {
              return `${info.timestamp} [${info.level}]: ${info.message}\n${info.stack}`;
            }
            return `${info.timestamp} [${info.level}]: ${info.message}`;
          }
        )
      ),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    }),
  ],
});

// Add stream for Morgan HTTP logging
export const httpRequestLogger = () =>
  winston.createLogger({
    level: 'http',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
      )
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(
            (info) => `${info.timestamp} [${info.level}]: ${info.message}`
          )
        ),
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'http.log'),
      }),
    ],
  });
