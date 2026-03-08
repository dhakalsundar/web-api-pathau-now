import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { HttpError } from '../errors/http-error';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!JWT_SECRET) {
      console.error(' [AUTH] JWT_SECRET not configured - cannot authenticate');
      throw new HttpError(500, 'Server configuration error');
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.warn(` [AUTH] No token provided for ${req.method} ${req.path}`);
      throw new HttpError(401, 'No authorization token provided');
    }

    console.log(` [AUTH] Verifying token for ${req.method} ${req.path}`);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    console.log(` [AUTH] Verified - User: ${decoded.id} (${decoded.email}), Role: ${decoded.role}`);
    next();
  } catch (error) {
    console.error(` [AUTH] Token verification failed:`, error instanceof Error ? error.message : error);
    if (error instanceof HttpError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpError(401, 'Invalid token signature'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new HttpError(401, 'Token has expired'));
    } else {
      next(new HttpError(401, 'Invalid or expired token'));
    }
  }
};
