import { UserModel, IUser } from '../models/user.model';
import mongoose from 'mongoose';

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findAll(filters: any = {}, page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
    const skip = (page - 1) * limit;
    const query = { ...filters };
    
    const users = await UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await UserModel.countDocuments(query);
    
    return { users, total };
  }

  async update(id: string | mongoose.Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async delete(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }

  async search(searchTerm: string, page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(searchTerm, 'i');
    
    const query = {
      $or: [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phoneNumber: searchRegex }
      ]
    };
    
    const users = await UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await UserModel.countDocuments(query);
    
    return { users, total };
  }

  async countByRole(role: string): Promise<number> {
    return await UserModel.countDocuments({ role });
  }

  async updatePassword(id: string | mongoose.Types.ObjectId, hashedPassword: string): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).select('-password');
  }
}