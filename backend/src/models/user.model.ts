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
    },
    {
        timestamps: true, 
    }
);

// Index for fast search
UserSchema.index({ role: 1 });

export interface IUser extends UserType, Document { 
    _id: mongoose.Types.ObjectId; 
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
