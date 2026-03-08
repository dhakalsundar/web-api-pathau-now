import { ShipmentModel, IShipment, IShipmentEvent } from '../models/shipment.model';
import mongoose from 'mongoose';

export interface ShipmentFilters {
  status?: string;
  riderUserId?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: string;
  deliveryType?: string;
  trackingNumber?: string;
}

export class ShipmentRepository {
  async create(shipmentData: Partial<IShipment>): Promise<IShipment> {
    const shipment = new ShipmentModel(shipmentData);
    return await shipment.save();
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<IShipment | null> {
    return await ShipmentModel.findById(id)
      .populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus')
      .populate('customerId', 'email firstName lastName phoneNumber');
  }

  async findByTrackingNumber(trackingNumber: string): Promise<IShipment | null> {
    return await ShipmentModel.findOne({ trackingNumber })
      .populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus')
      .populate('customerId', 'email firstName lastName phoneNumber');
  }

  async findAll(filters: ShipmentFilters = {}, page: number = 1, limit: number = 10): Promise<{ shipments: IShipment[], total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.riderUserId) query.riderUserId = filters.riderUserId;
    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.deliveryType) query.deliveryType = filters.deliveryType;
    if (filters.trackingNumber) query.trackingNumber = new RegExp(filters.trackingNumber, 'i');
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const shipments = await ShipmentModel.find(query)
      .populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus')
      .populate('customerId', 'email firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ShipmentModel.countDocuments(query);

    return { shipments, total };
  }

  async update(id: string | mongoose.Types.ObjectId, updateData: Partial<IShipment>): Promise<IShipment | null> {
    return await ShipmentModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus')
      .populate('customerId', 'email firstName lastName');
  }

  async updateStatus(id: string | mongoose.Types.ObjectId, status: string, event?: IShipmentEvent): Promise<IShipment | null> {
    const updateData: any = { status };
    
    if (event) {
      updateData.$push = { events: event };
    }

    return await ShipmentModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus');
  }

  async addEvent(id: string | mongoose.Types.ObjectId, event: IShipmentEvent): Promise<IShipment | null> {
    return await ShipmentModel.findByIdAndUpdate(
      id,
      { $push: { events: event } },
      { new: true }
    );
  }

  async delete(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    const result = await ShipmentModel.findByIdAndDelete(id);
    return result !== null;
  }

  async search(searchTerm: string, page: number = 1, limit: number = 10): Promise<{ shipments: IShipment[], total: number }> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(searchTerm, 'i');

    const query = {
      $or: [
        { trackingNumber: searchRegex },
        { 'sender.name': searchRegex },
        { 'recipient.name': searchRegex },
        { 'sender.phoneNumber': searchRegex },
        { 'recipient.phoneNumber': searchRegex }
      ]
    };

    const shipments = await ShipmentModel.find(query)
      .populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus')
      .populate('customerId', 'email firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ShipmentModel.countDocuments(query);

    return { shipments, total };
  }

  async countByStatus(status: string): Promise<number> {
    return await ShipmentModel.countDocuments({ status });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await ShipmentModel.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await ShipmentModel.aggregate([
      { 
        $match: { 
          paymentStatus: 'PAID',
          createdAt: { $gte: startDate, $lte: endDate }
        } 
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }

  async assignRider(shipmentId: string | mongoose.Types.ObjectId, riderUserId: string | mongoose.Types.ObjectId): Promise<IShipment | null> {
    return await ShipmentModel.findByIdAndUpdate(
      shipmentId,
      { riderUserId },
      { new: true }
    ).populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus');
  }

  async findByRider(riderUserId: string | mongoose.Types.ObjectId): Promise<IShipment[]> {
    return await ShipmentModel.find({ riderUserId })
      .sort({ createdAt: -1 });
  }

 
  async findAvailableShipments(page: number = 1, limit: number = 10): Promise<{ shipments: IShipment[], total: number }> {
    const skip = (page - 1) * limit;
    const query = {
      riderUserId: { $exists: false }, // Not assigned to any rider user
      status: 'PENDING', // Still pending pickup
    };

    const shipments = await ShipmentModel.find(query)
      .populate('riderUserId', 'firstName lastName phoneNumber vehicleType riderStatus')
      .populate('customerId', 'email firstName lastName phoneNumber')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ShipmentModel.countDocuments(query);

    return { shipments, total };
  }

  async getStats(): Promise<any> {
    const total = await ShipmentModel.countDocuments();
    const pending = await ShipmentModel.countDocuments({ status: 'PENDING' });
    const pickedUp = await ShipmentModel.countDocuments({ status: 'PICKED_UP' });
    const inTransit = await ShipmentModel.countDocuments({ status: 'IN_TRANSIT' });
    const outForDelivery = await ShipmentModel.countDocuments({ status: 'OUT_FOR_DELIVERY' });
    const delivered = await ShipmentModel.countDocuments({ status: 'DELIVERED' });
    const failed = await ShipmentModel.countDocuments({ status: 'FAILED' });
    const cancelled = await ShipmentModel.countDocuments({ status: 'CANCELLED' });

    return {
      total,
      pending,
      pickedUp,
      inTransit,
      outForDelivery,
      delivered,
      failed,
      cancelled
    };
  }
}
