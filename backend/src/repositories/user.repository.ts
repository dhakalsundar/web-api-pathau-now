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

  // Rider-specific methods
  async findByPhoneNumber(phoneNumber: string): Promise<IUser | null> {
    return await UserModel.findOne({ phoneNumber });
  }

  async findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    return await UserModel.findOne({ _id: userId, role: 'RIDER' });
  }

  async updateRiderStatus(riderId: string | mongoose.Types.ObjectId, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      riderId, 
      { riderStatus: status }, 
      { new: true }
    ).select('-password');
  }

  async updateLocation(riderId: string | mongoose.Types.ObjectId, location: { latitude: number, longitude: number, address?: string }): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      riderId,
      { currentLocation: location },
      { new: true }
    ).select('-password');
  }

  async assignParcel(riderId: string | mongoose.Types.ObjectId, parcelId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      riderId,
      { 
        $push: { assignedParcels: parcelId },
        riderStatus: 'BUSY'
      },
      { new: true }
    ).select('-password');
  }

  async unassignParcel(riderId: string | mongoose.Types.ObjectId, parcelId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(
      riderId,
      { $pull: { assignedParcels: parcelId } },
      { new: true }
    ).select('-password');

    // If no more assigned parcels, set status to available
    if (user && user.assignedParcels && user.assignedParcels.length === 0) {
      user.riderStatus = 'AVAILABLE';
      await user.save();
    }

    return user;
  }

  async incrementDeliveries(riderId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      riderId,
      { $inc: { totalDeliveries: 1 } },
      { new: true }
    ).select('-password');
  }

  async updateRiderRating(riderId: string | mongoose.Types.ObjectId, rating: number): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      riderId,
      { rating },
      { new: true }
    ).select('-password');
  }

  async searchRiders(searchTerm: string, page: number = 1, limit: number = 10): Promise<{ riders: IUser[], total: number }> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(searchTerm, 'i');

    const query = {
      role: 'RIDER',
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phoneNumber: searchRegex },
        { vehicleNumber: searchRegex }
      ]
    };

    const riders = await UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments(query);

    return { riders, total };
  }

  async getAvailableRiders(): Promise<IUser[]> {
    return await UserModel.find({ role: 'RIDER', riderStatus: 'AVAILABLE', isActive: true }).select('-password');
  }

  async countRidersByStatus(status: string): Promise<number> {
    return await UserModel.countDocuments({ role: 'RIDER', riderStatus: status, isActive: true });
  }

  async getRiderStats(): Promise<any> {
    const total = await UserModel.countDocuments({ role: 'RIDER', isActive: true });
    const available = await UserModel.countDocuments({ role: 'RIDER', riderStatus: 'AVAILABLE', isActive: true });
    const busy = await UserModel.countDocuments({ role: 'RIDER', riderStatus: 'BUSY', isActive: true });
    const offline = await UserModel.countDocuments({ role: 'RIDER', riderStatus: 'OFFLINE', isActive: true });

    return {
      total,
      available,
      busy,
      offline
    };
  }

  async findRidersWithFilters(filters: any = {}, page: number = 1, limit: number = 10): Promise<{ riders: IUser[], total: number }> {
    const skip = (page - 1) * limit;
    const query: any = { role: 'RIDER', ...filters };

    if (filters.riderStatus) query.riderStatus = filters.riderStatus;
    if (filters.vehicleType) query.vehicleType = filters.vehicleType;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const riders = await UserModel.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments(query);

    return { riders, total };
  }
}