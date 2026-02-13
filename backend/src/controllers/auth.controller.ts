import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { HttpError } from '../errors/http-error';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new HttpError(409, 'User already exists with this email');
      }

      const user = await userService.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role: 'CUSTOMER',
      });

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new HttpError(400, 'Email and password are required');
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new HttpError(401, 'Invalid email or password');
      }

      const isPasswordValid = await userService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new HttpError(401, 'Invalid email or password');
      }

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createUserByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phoneNumber, role } = req.body;
      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new HttpError(409, 'User already exists with this email');
      }

      const user = await userService.createUser({
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { firstName, lastName, phoneNumber } = req.body;
      const currentUser = (req as any).user;

      // Only allow users to update their own profile or admins to update anyone
      if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
        throw new HttpError(403, 'You can only update your own profile');
      }

      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

      const user = await userService.updateUser(id, {
        firstName,
        lastName,
        phoneNumber,
        ...(avatarPath && { avatar: avatarPath }),
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
