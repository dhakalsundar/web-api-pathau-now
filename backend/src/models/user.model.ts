import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        avatar: { type: String },
        role: {
            type: String,
            enum: ['CUSTOMER', 'STAFF', 'ADMIN', 'RIDER'],
            default: 'CUSTOMER',
        },
        isActive: { type: Boolean, default: true },
        refreshToken: { type: String, default: null },
        refreshTokenExpiresAt: { type: Date, default: null },
        // Rider-specific fields (only used when role === 'RIDER')
        vehicleType: { 
            type: String, 
            enum: ['BIKE', 'CAR', 'VAN', null], 
            default: null,
        },
        vehicleNumber: { type: String, default: null },
        riderStatus: { 
            type: String, 
            enum: ['AVAILABLE', 'BUSY', 'OFFLINE'], 
            default: 'AVAILABLE' 
        },
        currentLocation: {
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
            address: { type: String, default: null }
        },
        assignedParcels: [{ type: Schema.Types.ObjectId, ref: 'Shipment', default: [] }],
        totalDeliveries: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        // Password reset OTP fields
        resetPassword: {
            otpHash: { type: String, default: null },
            expiresAt: { type: Date, default: null },
            verified: { type: Boolean, default: false }
        }
    },
    {
        timestamps: true, 
    }
);

// Index for fast search
UserSchema.index({ role: 1 });
UserSchema.index({ riderStatus: 1 });
UserSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

export interface IUser extends UserType, Document { 
    _id: mongoose.Types.ObjectId; 
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
