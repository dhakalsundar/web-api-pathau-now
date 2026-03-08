import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import multer from 'multer';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Handle multer file upload errors
  if (err instanceof multer.MulterError) {
    // Check for file size limit error
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    logger.error(`${req.method} ${req.originalUrl} -> Multer Error: ${err.message}`, { error: err });
    return res.status(status).json({ 
      success: false, 
      message: err.message || 'File upload error' 
    });
  }

  // Handle custom validation errors from file filter
  if (err instanceof Error && err.message.includes('Only image files are allowed')) {
    logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`, { error: err });
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }

  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  logger.error(`${req.method} ${req.originalUrl} -> ${message}`, { error: err });
  res.status(status).json({ success: false, message });
}
