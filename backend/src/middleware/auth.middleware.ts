import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { HttpError } from '../errors/http-error';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.warn(`⚠️ [AUTH] No token provided in Authorization header for ${req.method} ${req.path}`);
      throw new HttpError(401, 'No token provided');
    }

    console.log(`🔐 [AUTH] Verifying token for ${req.method} ${req.path}`);
    const decoded = jwt.verify(token, JWT_SECRET || 'your-secret-key') as any;
    (req as any).user = decoded;
    console.log(`✅ [AUTH] Token verified for user: ${decoded.id} (role: ${decoded.role})`);
    next();
  } catch (error) {
    console.error(`❌ [AUTH] Token verification failed:`, error instanceof Error ? error.message : error);
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(new HttpError(401, 'Invalid or expired token'));
    }
  }
};
