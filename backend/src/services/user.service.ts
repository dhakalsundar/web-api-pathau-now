import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { IUser } from "../models/user.model";

const userRepository = new UserRepository();

export class UserService {
  async register(data: CreateUserDTO) {
    const emailCheck = await userRepository.findByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(400, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const userData = {
      ...data,
      password: hashedPassword,
      role: 'CUSTOMER',
    };

    const newUser = await userRepository.create(userData as any);
    
    // Remove password from response
    const userObj = newUser.toObject();
    delete userObj.password;
    
    return userObj;
  }

  async login(data: LoginUserDTO) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    if (!user.isActive) {
      throw new HttpError(403, "Account is inactive");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    const userObj = user.toObject();
    delete userObj.password;

    return { token, user: userObj };
  }

  async getAllUsers(filters: any = {}, page: number = 1, limit: number = 10) {
    return await userRepository.findAll(filters, page, limit);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "User not found");
    
    const userObj = user.toObject();
    delete userObj.password;
    
    return userObj;
  }

  async searchUsers(searchTerm: string, page: number = 1, limit: number = 10) {
    return await userRepository.search(searchTerm, page, limit);
  }

  async updateUser(id: string, updateData: Partial<IUser>) {
    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, 10);
    }

    const updated = await userRepository.update(id, updateData);
    if (!updated) throw new HttpError(404, "User not found");

    const userObj = updated.toObject();
    delete userObj.password;
    
    return userObj;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new HttpError(404, "User not found");

    const validPassword = await bcryptjs.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Current password is incorrect");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await userRepository.updatePassword(id, hashedPassword);

    return { success: true, message: "Password updated successfully" };
  }

  async deleteUser(id: string) {
    const deleted = await userRepository.delete(id);
    if (!deleted) throw new HttpError(404, "User not found");
    return { success: true, message: "User deleted successfully" };
  }

  async createUserByAdmin(data: Partial<IUser>) {
    const emailCheck = await userRepository.findByEmail(data.email!);
    if (emailCheck) {
      throw new HttpError(400, "Email already in use");
    }

    if (data.password) {
      data.password = await bcryptjs.hash(data.password, 10);
    }

    // Normalize role to uppercase
    const userData = {
      ...data,
      role: (data.role || 'CUSTOMER').toUpperCase(),
    };

    const newUser = await userRepository.create(userData as any);
    
    // Rider-specific fields are now part of the User model, no need for separate profile
    
    const userObj = newUser.toObject();
    delete userObj.password;
    
    return userObj;
  }

  async getUserStats() {
    const totalCustomers = await userRepository.countByRole('CUSTOMER');
    const totalStaff = await userRepository.countByRole('STAFF');
    const totalAdmins = await userRepository.countByRole('ADMIN');

    return {
      totalCustomers,
      totalStaff,
      totalAdmins,
      totalUsers: totalCustomers + totalStaff + totalAdmins,
    };
  }

  async createUser(data: any) {
    const emailCheck = await userRepository.findByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(400, 'Email already in use');
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const userData = {
      ...data,
      password: hashedPassword,
      role: (data.role || 'CUSTOMER').toUpperCase(),
    };

    const newUser = await userRepository.create(userData as any);
    const userObj = newUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async getUserByEmail(email: string) {
    return await userRepository.findByEmail(email);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await bcryptjs.compare(password, hashedPassword);
  }
}