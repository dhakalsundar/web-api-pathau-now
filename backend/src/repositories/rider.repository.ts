import { RiderModel, IRider } from '../models/rider.model';
import mongoose from 'mongoose';

export interface RiderFilters {
  status?: string;
  vehicleType?: string;
  isActive?: boolean;
}

export class RiderRepository {
  async create(riderData: Partial<IRider>): Promise<IRider> {
    const rider = new RiderModel(riderData);
    return await rider.save();
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<IRider | null> {
    return await RiderModel.findById(id);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<IRider | null> {
    return await RiderModel.findOne({ phoneNumber });
  }

  async findAll(filters: RiderFilters = {}, page: number = 1, limit: number = 10): Promise<{ riders: IRider[], total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.vehicleType) query.vehicleType = filters.vehicleType;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const riders = await RiderModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await RiderModel.countDocuments(query);

    return { riders, total };
  }

  async update(id: string | mongoose.Types.ObjectId, updateData: Partial<IRider>): Promise<IRider | null> {
    return await RiderModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    const result = await RiderModel.findByIdAndDelete(id);
    return result !== null;
  }

  async updateStatus(id: string | mongoose.Types.ObjectId, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'): Promise<IRider | null> {
    return await RiderModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async updateLocation(id: string | mongoose.Types.ObjectId, location: { latitude: number, longitude: number, address?: string }): Promise<IRider | null> {
    return await RiderModel.findByIdAndUpdate(
      id,
      { currentLocation: location },
      { new: true }
    );
  }

  async assignParcel(riderId: string | mongoose.Types.ObjectId, parcelId: string | mongoose.Types.ObjectId): Promise<IRider | null> {
    return await RiderModel.findByIdAndUpdate(
      riderId,
      { 
        $push: { assignedParcels: parcelId },
        status: 'BUSY'
      },
      { new: true }
    );
  }

  async unassignParcel(riderId: string | mongoose.Types.ObjectId, parcelId: string | mongoose.Types.ObjectId): Promise<IRider | null> {
    const rider = await RiderModel.findByIdAndUpdate(
      riderId,
      { $pull: { assignedParcels: parcelId } },
      { new: true }
    );

    // If no more assigned parcels, set status to available
    if (rider && rider.assignedParcels && rider.assignedParcels.length === 0) {
      rider.status = 'AVAILABLE';
      await rider.save();
    }

    return rider;
  }

  async incrementDeliveries(id: string | mongoose.Types.ObjectId): Promise<IRider | null> {
    return await RiderModel.findByIdAndUpdate(
      id,
      { $inc: { totalDeliveries: 1 } },
      { new: true }
    );
  }

  async updateRating(id: string | mongoose.Types.ObjectId, rating: number): Promise<IRider | null> {
    return await RiderModel.findByIdAndUpdate(
      id,
      { rating },
      { new: true }
    );
  }

  async search(searchTerm: string, page: number = 1, limit: number = 10): Promise<{ riders: IRider[], total: number }> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(searchTerm, 'i');

    const query = {
      $or: [
        { name: searchRegex },
        { phoneNumber: searchRegex },
        { email: searchRegex },
        { vehicleNumber: searchRegex }
      ]
    };

    const riders = await RiderModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await RiderModel.countDocuments(query);

    return { riders, total };
  }

  async getAvailableRiders(): Promise<IRider[]> {
    return await RiderModel.find({ status: 'AVAILABLE', isActive: true });
  }

  async countByStatus(status: string): Promise<number> {
    return await RiderModel.countDocuments({ status, isActive: true });
  }

  async getStats(): Promise<any> {
    const total = await RiderModel.countDocuments({ isActive: true });
    const available = await RiderModel.countDocuments({ status: 'AVAILABLE', isActive: true });
    const busy = await RiderModel.countDocuments({ status: 'BUSY', isActive: true });
    const offline = await RiderModel.countDocuments({ status: 'OFFLINE', isActive: true });

    return {
      total,
      available,
      busy,
      offline
    };
  }
}
