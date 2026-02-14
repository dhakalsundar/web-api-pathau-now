import mongoose, { Document, Schema } from 'mongoose';

export interface IRider extends Document {
  name: string;
  email?: string;
  phoneNumber: string;
  vehicleType?: 'BIKE' | 'CAR' | 'VAN';
  vehicleNumber?: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  assignedParcels?: mongoose.Types.ObjectId[];
  totalDeliveries?: number;
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RiderSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String, required: true },
    vehicleType: { type: String, enum: ['BIKE', 'CAR', 'VAN'] },
    vehicleNumber: { type: String },
    status: { 
      type: String, 
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE'], 
      default: 'OFFLINE' 
    },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String }
    },
    assignedParcels: [{ type: Schema.Types.ObjectId, ref: 'Shipment' }],
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
RiderSchema.index({ status: 1 });
RiderSchema.index({ phoneNumber: 1 });
RiderSchema.index({ isActive: 1 });

export const RiderModel = mongoose.model<IRider>('Rider', RiderSchema);
