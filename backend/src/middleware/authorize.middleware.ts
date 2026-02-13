import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    [key: string]: any;
  };
}

export const authorize = (roles: string[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userRole = typeof user.role === 'string' ? user.role.toUpperCase() : user.role;
    const allowedRoles = roles.map((role) => role.toUpperCase());
    if (roles.length > 0 && !allowedRoles.includes(userRole)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
};
