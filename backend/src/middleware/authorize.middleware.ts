import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  };
}

/**
 * Role-based authorization middleware
 * Supports multiple formats:
 * - authorize("ADMIN")
 * - authorize("ADMIN", "RIDER", "USER")
 * - authorize(["ADMIN", "RIDER"])
 *
 * @param roles - Role or array of roles to authorize
 * @returns Middleware function
 */
export const authorize = (...roles: (string | string[])[]): ((req: AuthRequest, res: Response, next: NextFunction) => void) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      const user = req.user;
      if (!user) {
        throw new HttpError(401, 'Unauthorized: User not found');
      }

      // If no roles specified, allow all authenticated users
      if (roles.length === 0) {
        return next();
      }

      // Flatten roles array (support both single string args and array format)
      const allowedRoles: string[] = [];
      for (const role of roles) {
        if (Array.isArray(role)) {
          allowedRoles.push(...role);
        } else {
          allowedRoles.push(role);
        }
      }

      // Normalize user role to uppercase
      const userRole = typeof user.role === 'string' ? user.role.toUpperCase() : user.role;
      const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

      // Check if user role is in allowed roles
      if (!normalizedAllowedRoles.includes(userRole)) {
        throw new HttpError(
          403,
          `Forbidden: User role '${user.role}' is not authorized. Required roles: ${normalizedAllowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      if (error instanceof HttpError) {
        next(error);
      } else {
        next(new HttpError(403, 'Authorization failed'));
      }
    }
  };
};

/**
 * Convenience middleware for admin-only endpoints
 */
export const authorizeAdmin = authorize('ADMIN');

/**
 * Convenience middleware for rider-only endpoints
 */
export const authorizeRider = authorize('RIDER');

/**
 * Convenience middleware for customer-only endpoints
 */
export const authorizeCustomer = authorize('CUSTOMER');

/**
 * Convenience middleware for staff or admin
 */
export const authorizeStaffOrAdmin = authorize('STAFF', 'ADMIN');

