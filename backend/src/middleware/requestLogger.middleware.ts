import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * HTTP Request Logging Middleware
 * Logs all incoming HTTP requests with method, URL, status code, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      logger.error(logMessage);
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      logger.info(logMessage);
    } else {
      logger.warn(logMessage);
    }
  });

  next();
};
