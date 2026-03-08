import mongoose, { Document, Schema } from 'mongoose';

export interface IShipmentEvent {
  status: string;
  message?: string;
  location?: string;
  timestamp: Date;
}

export interface ISender {
  name: string;
  address: string;
  phoneNumber: string;
  email?: string;
}

export interface IRecipient {
  name: string;
  address: string;
  phoneNumber: string;
  email?: string;
}

export interface IShipment extends Document {
  trackingNumber: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  sender: ISender;
  recipient: IRecipient;
  riderId?: mongoose.Types.ObjectId;
  riderUserId?: mongoose.Types.ObjectId; // User._id of the rider who accepted this
  customerId?: mongoose.Types.ObjectId;
  weight?: number;
  price?: number;
  paymentStatus?: 'PENDING' | 'PAID' | 'COD';
  deliveryType?: 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
  parcelType?: 'DOCUMENT' | 'PARCEL' | 'FOOD' | 'FRAGILE' | 'HEAVY' | 'OTHER';
  courier?: string;
  notes?: string;
  events: IShipmentEvent[];
  senderLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  recipientLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  riderLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentEventSchema: Schema = new Schema(
  {
    status: { type: String, required: true },
    message: { type: String },
    location: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const SenderSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

const RecipientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

const ShipmentSchema: Schema = new Schema(
  {
    trackingNumber: { type: String, required: true, unique: true, index: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'],
      default: 'PENDING'
    },
    sender: { type: SenderSchema, required: true },
    senderLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
      address: { type: String },
    },
    recipient: { type: RecipientSchema, required: true },
    recipientLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
      address: { type: String },
    },
    riderLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
      address: { type: String },
      updatedAt: { type: Date },
    },
    riderUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // User._id of the rider who accepted this
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    weight: { type: Number },
    price: { type: Number },
    paymentStatus: { 
      type: String, 
      enum: ['PENDING', 'PAID', 'COD'], 
      default: 'PENDING' 
    },
    deliveryType: { 
      type: String, 
      enum: ['STANDARD', 'EXPRESS', 'SAME_DAY'], 
      default: 'STANDARD' 
    },
    parcelType: {
      type: String,
      enum: ['DOCUMENT', 'PARCEL', 'FOOD', 'FRAGILE', 'HEAVY', 'OTHER'],
      default: 'PARCEL'
    },
    courier: { type: String, default: 'Pathao Express' },
    notes: { type: String },
    events: { type: [ShipmentEventSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast search
ShipmentSchema.index({ trackingNumber: 'text', 'recipient.name': 'text', 'sender.name': 'text' });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ riderUserId: 1 });
ShipmentSchema.index({ customerId: 1 });
ShipmentSchema.index({ createdAt: -1 });

export const ShipmentModel = mongoose.model<IShipment>('Shipment', ShipmentSchema);
