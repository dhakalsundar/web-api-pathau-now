import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { RiderService } from '../services/rider.service';
import { HttpError } from '../errors/http-error';
import { generateTokens, verifyRefreshToken, getRefreshTokenExpiryDate } from '../utils/jwt';

const userService = new UserService();
const riderService = new RiderService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('📥 [AUTH] Register endpoint called');
      const { email, password, firstName, lastName, phoneNumber, name, phone, address, role, vehicleType, vehicleNumber } = req.body;
      
      console.log('📋 [AUTH] Extracted fields:');
      console.log(`   email: ${email}`);
      console.log(`   password: ${password ? '***' : 'undefined'}`);
      console.log(`   name: ${name}`);
      console.log(`   firstName: ${firstName}`);
      console.log(`   phone: ${phone}`);
      console.log(`   phoneNumber: ${phoneNumber}`);
      console.log(`   role: ${role}`);
      console.log(`   vehicleType: ${vehicleType}`);
      console.log(`   vehicleNumber: ${vehicleNumber}`);

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        console.warn(`⚠️  [AUTH] User already exists: ${email}`);
        throw new HttpError(409, 'User already exists with this email');
      }

      // Handle field mapping: support both 'name' and 'firstName'
      let first_name = firstName || '';
      let last_name = lastName || '';
      
      if (name && !firstName) {
        // Split 'name' into firstName and lastName if provided
        const nameParts = name.trim().split(' ');
        first_name = nameParts[0];
        last_name = nameParts.slice(1).join(' ') || '';
      }

      // Handle phone field mapping
      const phoneNum = phone || phoneNumber || '';

      // Determine user role (default to CUSTOMER if not provided)
      const userRole = role || 'CUSTOMER';

      console.log(`👤 [AUTH] Creating user: name=${first_name} ${last_name}, email=${email}, role=${userRole}, phone=${phoneNum}`);

      const user = await userService.createUser({
        email,
        password,
        firstName: first_name,
        lastName: last_name,
        phoneNumber: phoneNum,
        address: address || '',
        role: userRole,
      });

      console.log(`✅ [AUTH] User created: ${user._id}`);

      // If registering as RIDER, create a rider profile
      if (userRole === 'RIDER') {
        try {
          console.log(`🏍️  [AUTH] Creating rider profile for user ${user._id}`);
          console.log(`   vehicleType: ${vehicleType}, vehicleNumber: ${vehicleNumber}`);
          
          await riderService.createRider({
            name: first_name + (last_name ? ' ' + last_name : ''),
            email,
            phoneNumber: phoneNum,
            vehicleType,
            vehicleNumber,
            status: 'OFFLINE',
            isActive: true,
          });
          
          console.log(`✅ [AUTH] Rider profile created`);
        } catch (riderError: any) {
          // Log rider creation error but don't fail user creation
          console.error('⚠️  [AUTH] Error creating rider profile:', riderError.message);
        }
      }

      // Generate access and refresh tokens
      const { accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Store refresh token in database
      const refreshTokenExpiresAt = getRefreshTokenExpiryDate();
      await userService.updateUser(user._id.toString(), {
        refreshToken,
        refreshTokenExpiresAt,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
            accessTokenExpiresIn,
            refreshTokenExpiresIn,
          },
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

      // Generate access and refresh tokens
      const { accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Store refresh token in database
      const refreshTokenExpiresAt = getRefreshTokenExpiryDate();
      await userService.updateUser(user._id.toString(), {
        refreshToken,
        refreshTokenExpiresAt,
      });

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
          },
          tokens: {
            accessToken,
            refreshToken,
            accessTokenExpiresIn,
            refreshTokenExpiresIn,
          },
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

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new HttpError(400, 'Refresh token is required');
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new HttpError(401, 'Invalid or expired refresh token');
      }

      // Get user from database
      const user = await userService.getUserById(decoded.id);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      // Verify stored refresh token matches
      if (user.refreshToken !== refreshToken) {
        throw new HttpError(401, 'Refresh token does not match');
      }

      // Check if refresh token has expired
      if (user.refreshTokenExpiresAt && new Date() > user.refreshTokenExpiresAt) {
        throw new HttpError(401, 'Refresh token has expired');
      }

      // Generate new access and refresh tokens
      const { accessToken, refreshToken: newRefreshToken, accessTokenExpiresIn, refreshTokenExpiresIn } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Store new refresh token in database
      const refreshTokenExpiresAt = getRefreshTokenExpiryDate();
      await userService.updateUser(user._id.toString(), {
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt,
      });

      return res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken,
            accessTokenExpiresIn,
            refreshTokenExpiresIn,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
