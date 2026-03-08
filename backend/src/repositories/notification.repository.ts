import { NotificationModel, INotification } from '../models/notification.model';
import mongoose from 'mongoose';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    const notification = new NotificationModel(data);
    return await notification.save();
  }

  async createBulk(data: Partial<INotification>[]): Promise<INotification[]> {
    return (await NotificationModel.insertMany(data)) as INotification[];
  }

  async findById(id: string): Promise<INotification | null> {
    return await NotificationModel.findById(id);
  }

  async findByRiderId(riderId: string, filters: any = {}) {
    // Convert string to ObjectId properly
    const riderObjectId = new mongoose.Types.ObjectId(riderId);
    const query: any = { $or: [{ riderId: riderObjectId }, { riderId: null }] };

    // Filter by status if provided
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter by type if provided
    if (filters.type) {
      query.type = filters.type;
    }

    const limit = filters.limit || 20;
    const skip = ((filters.page || 1) - 1) * limit;

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('shipmentId', 'trackingNumber sender recipient status')
      .lean();

    const total = await NotificationModel.countDocuments(query);

    return {
      data: notifications,
      total,
      page: filters.page || 1,
      limit,
    };
  }

  async findPendingByRiderId(riderId: string) {
    // Convert string to ObjectId properly
    const riderObjectId = new mongoose.Types.ObjectId(riderId);
    return await NotificationModel.find({
      $or: [{ riderId: riderObjectId }, { riderId: null }],
      status: 'PENDING',
    })
      .sort({ createdAt: -1 })
      .populate('shipmentId', 'trackingNumber sender recipient status deliveryType')
      .lean();
  }

  async updateNotificationStatus(
    notificationId: string,
    status: 'READ' | 'ACCEPTED' | 'REJECTED',
    riderId?: string
  ): Promise<INotification | null> {
    const updateData: any = {
      status,
      respondedAt: new Date(),
      respondedBy: status === 'ACCEPTED' ? 'ACCEPTED' : status === 'REJECTED' ? 'REJECTED' : undefined,
    };

    if (status === 'READ') {
      updateData.readAt = new Date();
    }

    return await NotificationModel.findByIdAndUpdate(notificationId, updateData, {
      new: true,
    }).populate('shipmentId');
  }

  async findNotificationByShipmentAndRider(
    shipmentId: string,
    riderId?: string
  ): Promise<INotification | null> {
    const query: any = { shipmentId };
    if (riderId) {
      query.riderId = riderId;
    }
    return await NotificationModel.findOne(query);
  }

  async updateByShipmentId(shipmentId: string, data: any): Promise<any> {
    return await NotificationModel.updateMany(
      { shipmentId: new (require('mongoose')).Types.ObjectId(shipmentId) },
      { $set: data }
    );
  }

  async cancelNotificationsByShipmentId(shipmentId: string): Promise<any> {
    return await NotificationModel.deleteMany({ shipmentId });
  }

  async getUnreadCount(riderId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      $or: [{ riderId }, { riderId: null }],
      status: 'PENDING',
    });
  }
}

export default new NotificationRepository();
