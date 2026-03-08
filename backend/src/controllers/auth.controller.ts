import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { HttpError } from '../errors/http-error';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(' [AUTH] Register endpoint called');
      const { email, password, firstName, lastName, phoneNumber, name, phone, address, role, vehicleType, vehicleNumber } = req.body;
      
      console.log(' [AUTH] Extracted fields:');
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

      // Determine user role (default to CUSTOMER if not provided) - normalize to uppercase
      const userRole = (role || 'CUSTOMER').toUpperCase();

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

      console.log(` [AUTH] User created: ${user._id}`);

      // If registering as RIDER, update rider-specific fields
      if (userRole === 'RIDER') {
        try {
          console.log(`  [AUTH] Adding rider fields for user ${user._id}`);
          console.log(`   vehicleType: ${vehicleType}, vehicleNumber: ${vehicleNumber}`);
          
          await userService.getUserById(user._id.toString()).then(async (existingUser) => {
            if (existingUser) {
              // Update user with rider-specific fields
              await userService.updateUser(user._id.toString(), {
                vehicleType: vehicleType || null,
                vehicleNumber: vehicleNumber || null,
                riderStatus: 'AVAILABLE',
              });
              console.log(` [AUTH] Rider fields added`);
            }
          });
        } catch (riderError: any) {
          // Log error but don't fail user creation
          console.error('  [AUTH] Error updating rider fields:', riderError.message);
        }
      }

      // Generate access and refresh tokens
      const { accessToken, accessTokenExpiresIn } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
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
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
          },
          tokens: {
            accessToken,
            accessTokenExpiresIn,
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

      // Generate access token
      const { accessToken, accessTokenExpiresIn } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
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
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
          },
          tokens: {
            accessToken,
            accessTokenExpiresIn,
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
      const userRole = currentUser.role?.toUpperCase();
      if (currentUser.id !== id && userRole !== 'ADMIN') {
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

  async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;

      if (!req.file) {
        throw new HttpError(400, 'No file provided');
      }

      const avatarPath = `/uploads/${req.file.filename}`;

      const user = await userService.updateUser(currentUser.id, {
        avatar: avatarPath,
      });

      console.log(` [AUTH] Avatar updated successfully: ${avatarPath}`);

      return res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;
      let { firstName, lastName, phoneNumber, name, phone } = req.body;

      console.log(`✏️  [AUTH] Updating current user profile: ${currentUser.id}`);
      console.log(`   Received fields - firstName: ${firstName}, lastName: ${lastName}, name: ${name}, phone: ${phone}, phoneNumber: ${phoneNumber}`);

      // Handle field mapping: support both old format (name, phone) and new format (firstName, lastName, phoneNumber)
      if (name && !firstName) {
        const nameParts = name.trim().split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ') || '';
        console.log(`   Mapped 'name' to firstName="${firstName}", lastName="${lastName}"`);
      }

      if (phone && !phoneNumber) {
        phoneNumber = phone;
        console.log(`   Mapped 'phone' to phoneNumber="${phoneNumber}"`);
      }

      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

      const user = await userService.updateUser(currentUser.id, {
        firstName,
        lastName,
        phoneNumber,
        ...(avatarPath && { avatar: avatarPath }),
      });

      console.log(` [AUTH] User profile updated successfully`);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = (req as any).user;

      console.log(` [AUTH] Fetching current user profile: ${currentUser.id}`);

      const user = await userService.getUserById(currentUser.id);
      if (!user) {
        throw new HttpError(404, 'User not found');
      }

      console.log(` [AUTH] Current user profile fetched successfully`);

      return res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            phoneNumber: user.phoneNumber,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
          },
        },
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

      // Generate new access token
      const { accessToken, accessTokenExpiresIn } = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          tokens: {
            accessToken,
            accessTokenExpiresIn,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // Verify email exists
      const user = await userService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        console.warn(`  [AUTH] Forgot password request for non-existent email: ${email}`);
        return res.status(200).json({
          success: true,
          message: 'If an account exists with this email, an OTP will be sent shortly.'
        });
      }

      // Generate OTP
      const { generateOtp, hashOtp } = await import('../utils/otp');
      const otp = generateOtp();
      const hashedOtp = await hashOtp(otp);

      // Set OTP expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Update user with OTP
      await userService.updateUser(user._id.toString(), {
        resetPassword: {
          otpHash: hashedOtp,
          expiresAt,
          verified: false
        }
      });

      // Send OTP via email
      const { sendOtpEmail } = await import('../utils/mail');
      await sendOtpEmail(email, otp);

      console.log(` [AUTH] OTP sent successfully to ${email}`);

      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, an OTP will be sent shortly.'
      });
    } catch (error) {
      console.error(' [AUTH] Forgot password error:', error);
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;

      // Get user
      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new HttpError(401, 'Invalid email or OTP');
      }

      // Check if OTP exists and is not expired
      if (!user.resetPassword?.otpHash || !user.resetPassword?.expiresAt) {
        throw new HttpError(401, 'No OTP found. Please request a new one.');
      }

      const { isOtpExpired, verifyOtp } = await import('../utils/otp');
      
      // Check if OTP is expired
      if (isOtpExpired(user.resetPassword.expiresAt)) {
        throw new HttpError(401, 'OTP has expired. Please request a new one.');
      }

      // Verify OTP
      const isOtpValid = await verifyOtp(otp, user.resetPassword.otpHash);
      if (!isOtpValid) {
        throw new HttpError(401, 'Invalid OTP. Please try again.');
      }

      // Mark OTP as verified
      await userService.updateUser(user._id.toString(), {
        resetPassword: {
          ...user.resetPassword,
          verified: true
        }
      });

      console.log(` [AUTH] OTP verified successfully for ${email}`);

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully. You can now reset your password.',
        data: {
          verified: true
        }
      });
    } catch (error) {
      console.error(' [AUTH] Verify OTP error:', error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, newPassword } = req.body;

      // Get user
      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new HttpError(401, 'Invalid email');
      }

      // Check if OTP is verified
      if (!user.resetPassword?.verified) {
        throw new HttpError(401, 'Please verify OTP first before resetting password.');
      }

      // Update password
      const { hash } = await import('bcryptjs');
      const hashedPassword = await hash(newPassword, 10);

      await userService.updateUser(user._id.toString(), {
        password: hashedPassword,
        resetPassword: {
          otpHash: null,
          expiresAt: null,
          verified: false
        }
      });

      // Send confirmation email
      const { sendPasswordResetConfirmation } = await import('../utils/mail');
      await sendPasswordResetConfirmation(email);

      console.log(` [AUTH] Password reset successfully for ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      });
    } catch (error) {
      console.error(' [AUTH] Reset password error:', error);
      next(error);
    }
  }
}

export default new AuthController();
