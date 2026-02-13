import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  logger.error(`${req.method} ${req.originalUrl} -> ${message}`, { error: err });
  res.status(status).json({ success: false, message });
}
