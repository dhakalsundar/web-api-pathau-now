import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized - User not found');
    }

    if (user.role !== 'admin' && user.role !== 'ADMIN') {
      throw new HttpError(403, 'Forbidden - Only admin can access this resource');
    }

    next();
  } catch (error) {
    next(error);
  }
};
