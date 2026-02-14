import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

/**
 * Admin-only authorization middleware
 * Checks if user has ADMIN role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      throw new HttpError(401, 'Unauthorized - User not found');
    }

    const userRole = typeof user.role === 'string' ? user.role.toUpperCase() : user.role;

    if (userRole !== 'ADMIN') {
      throw new HttpError(403, `Forbidden - Only ADMIN can access this resource. Current role: ${user.role}`);
    }

    next();
  } catch (error) {
    next(error);
  }
};
