import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { HttpError } from '../errors/http-error';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new HttpError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET || 'your-secret-key') as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else {
      next(new HttpError(401, 'Invalid or expired token'));
    }
  }
};
