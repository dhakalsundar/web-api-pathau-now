/**
 * UserRiderService - Unified service for User model with rider fields
 * Consolidates the separate Rider model into the User model for consistency
 */

import { UserRepository } from '../repositories/user.repository';
import { HttpError } from '../errors/http-error';
import { IUser } from '../models/user.model';

const userRepository = new UserRepository();

export class UserRiderService {
  /**
   * Get rider profile by User ID
   * Returns the User document with rider role and fields
   */
  async getRiderByUserId(userId: string): Promise<IUser> {
    console.log(`\n[getUserRider] ========== START ==========`);
    console.log(`[getUserRider] Looking up User with rider role for userId: ${userId}`);
    
    const user = await userRepository.findById(userId);
    
    if (!user) {
      console.error(`[getUserRider] User not found for userId: ${userId}`);
      throw new HttpError(404, 'User not found');
    }
    
    if ((user.role || '').toUpperCase() !== 'RIDER') {
      console.error(`[getUserRider] User is not a rider. Role: ${user.role}`);
      throw new HttpError(403, 'User is not a rider');
    }
    
    console.log(`[getUserRider] User found:`);
    console.log(`  User._id: ${user._id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Vehicle: ${user.vehicleType || 'Not set'}`);
    console.log(`[getUserRider] ========== END ==========\n`);
    
    return user;
  }

  /**
   * Update rider fields in the User model
   */
  async updateRiderStatus(userId: string, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'): Promise<IUser | null> {
    return await userRepository.update(userId, { riderStatus: status });
  }

  /**
   * Update rider location
   */
  async updateRiderLocation(userId: string, location: { latitude?: number; longitude?: number; address?: string }): Promise<IUser | null> {
    return await userRepository.update(userId, { currentLocation: location });
  }

  /**
   * Update rider profile
   */
  async updateRiderProfile(userId: string, profileData: Partial<IUser>): Promise<IUser | null> {
    return await userRepository.update(userId, profileData);
  }

  /**
   * Add shipment to rider's assigned parcels
   */
  async assignParcel(userId: string, shipmentId: string): Promise<IUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Rider user not found');
    }

    // Check if shipment is already assigned
    if (user.assignedParcels?.some(p => p.toString() === shipmentId)) {
      console.log(`[assignParcel] Shipment already assigned to rider`);
      return user;
    }

    // Add to assigned parcels
    if (!user.assignedParcels) {
      user.assignedParcels = [];
    }
    
    user.assignedParcels.push(shipmentId as any);
    user.riderStatus = 'BUSY';
    
    await user.save();
    return user;
  }

  /**
   * Remove shipment from rider's assigned parcels
   */
  async unassignParcel(userId: string, shipmentId: string): Promise<IUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Rider user not found');
    }

    // Remove from assigned parcels
    user.assignedParcels = user.assignedParcels?.filter(p => p.toString() !== shipmentId) || [];
    
    // If no more parcels, set to AVAILABLE
    if (user.assignedParcels.length === 0) {
      user.riderStatus = 'AVAILABLE';
    }
    
    await user.save();
    return user;
  }

  /**
   * Increment rider's total deliveries count
   */
  async incrementDeliveries(userId: string): Promise<IUser | null> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Rider user not found');
    }

    user.totalDeliveries = (user.totalDeliveries || 0) + 1;
    await user.save();
    return user;
  }

  /**
   * Get rider stats for dashboard
   */
  async getRiderStats(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Rider not found');
    }

    return {
      _id: user._id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      phoneNumber: user.phoneNumber,
      vehicleType: user.vehicleType,
      vehicleNumber: user.vehicleNumber,
      riderStatus: user.riderStatus,
      totalDeliveries: user.totalDeliveries || 0,
      rating: user.rating || 0,
      assignedParcelsCount: user.assignedParcels?.length || 0,
    };
  }
}

export const userRiderService = new UserRiderService();
