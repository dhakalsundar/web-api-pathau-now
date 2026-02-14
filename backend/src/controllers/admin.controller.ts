import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { HttpError } from '../errors/http-error';

const adminService = new AdminService();

export class AdminController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phoneNumber, role } = req.body;
      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

      const user = await adminService.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: role || 'CUSTOMER',
        avatar: avatarPath,
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;

      const users = await adminService.getAllUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        role: role as string,
        search: search as string,
      });

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await adminService.getUserById(id);

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, phoneNumber, role } = req.body;
      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

      const user = await adminService.updateUser(id, {
        email,
        firstName,
        lastName,
        phoneNumber,
        role,
        ...(avatarPath && { avatar: avatarPath }),
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await adminService.deleteUser(id);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
