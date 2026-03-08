import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  shipmentId: mongoose.Types.ObjectId;
  riderId?: mongoose.Types.ObjectId; // If null, it's for all riders
  type: 'NEW_PARCEL_AVAILABLE' | 'PARCEL_ASSIGNED' | 'PARCEL_CANCELLED';
  title: string;
  message: string;
  metadata?: {
    pickupLocation?: string;
    dropLocation?: string;
    weight?: number;
    deliveryType?: string;
  };
  status: 'PENDING' | 'READ' | 'ACCEPTED' | 'REJECTED';
  readAt?: Date;
  respondedAt?: Date;
  respondedBy?: 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
      required: true,
      index: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
      index: true,
    },
    type: {
      type: String,
      enum: ['NEW_PARCEL_AVAILABLE', 'PARCEL_ASSIGNED', 'PARCEL_CANCELLED'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: {
      pickupLocation: { type: String },
      dropLocation: { type: String },
      weight: { type: Number },
      deliveryType: { type: String },
    },
    status: {
      type: String,
      enum: ['PENDING', 'READ', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    readAt: { type: Date },
    respondedAt: { type: Date },
    respondedBy: {
      type: String,
      enum: ['ACCEPTED', 'REJECTED'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ riderId: 1, createdAt: -1 });
NotificationSchema.index({ shipmentId: 1, riderId: 1 });

export const NotificationModel = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
