/**
 * DEPRECATED: RiderService has been consolidated into UserService/UserRiderService
 * This file is kept for backward compatibility only.
 * 
 * All Rider operations now use the User model with role='RIDER'
 * Use UserService or UserRiderService instead.
 */

import { UserRepository } from '../repositories/user.repository';
import { HttpError } from '../errors/http-error';
import { IUser } from '../models/user.model';

const userRepository = new UserRepository();

export class RiderService {
  /**
   * @deprecated Use UserService.createUser() instead
   */
  async createRider(data: Partial<IUser>) {
    // Check if phone number already exists
    if (data.phoneNumber) {
      const existing = await userRepository.findByPhoneNumber(data.phoneNumber);
      if (existing) {
        throw new HttpError(400, 'Phone number already in use');
      }
    }

    const riderData = {
      ...data,
      role: 'RIDER',
      riderStatus: data.riderStatus || 'OFFLINE',
      isActive: true,
      totalDeliveries: 0,
      rating: 0,
    };

    return await userRepository.create(riderData as any);
  }

  /**
   * @deprecated Use UserRepository.findById() instead
   */
  async getRiderById(id: string) {
    const rider = await userRepository.findById(id);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }
    return rider;
  }

  /**
   * @deprecated Use UserRepository.findByUserId() instead
   */
  async getRiderByUserId(userId: string) {
    const user = await userRepository.findByUserId(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return user;
  }

  /**
   * @deprecated Use UserRepository.findRidersWithFilters() instead
   */
  async getAllRiders(filters: any = {}, page: number = 1, limit: number = 10) {
    return await userRepository.findRidersWithFilters(filters, page, limit);
  }

  /**
   * @deprecated Use UserRepository.getAvailableRiders() instead
   */
  async getAvailableRiders() {
    return await userRepository.getAvailableRiders();
  }

  /**
   * @deprecated Use UserRepository.searchRiders() instead
   */
  async searchRiders(searchTerm: string, page: number = 1, limit: number = 10) {
    return await userRepository.searchRiders(searchTerm, page, limit);
  }

  /**
   * @deprecated Use UserRepository.update() instead
   */
  async updateRider(id: string, updateData: Partial<IUser>) {
    const rider = await userRepository.findById(id);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    // Check if updating phone number to one that already exists
    if (updateData.phoneNumber && updateData.phoneNumber !== rider.phoneNumber) {
      const existing = await userRepository.findByPhoneNumber(updateData.phoneNumber);
      if (existing) {
        throw new HttpError(400, 'Phone number already in use');
      }
    }

    return await userRepository.update(id, updateData);
  }

  /**
   * @deprecated Use UserRepository.updateRiderStatus() instead
   */
  async updateRiderStatus(id: string, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') {
    const updated = await userRepository.updateRiderStatus(id, status);
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return updated;
  }

  /**
   * @deprecated Use UserRepository.updateLocation() instead
   */
  async updateRiderLocation(id: string, location: { latitude: number, longitude: number, address?: string }) {
    const updated = await userRepository.updateLocation(id, location);
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return updated;
  }

  /**
   * @deprecated Use UserRepository.updateRiderRating() instead
   */
  async updateRiderRating(id: string, rating: number) {
    if (rating < 0 || rating > 5) {
      throw new HttpError(400, 'Rating must be between 0 and 5');
    }

    return await userRepository.updateRiderRating(id, rating);
  }

  /**
   * @deprecated Use UserRepository.delete() instead
   */
  async deleteRider(id: string) {
    const rider = await userRepository.findById(id);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    // Check if rider has assigned parcels
    if (rider.assignedParcels && rider.assignedParcels.length > 0) {
      throw new HttpError(400, 'Cannot delete rider with assigned parcels');
    }

    await userRepository.delete(id);
    return { success: true, message: 'Rider deleted successfully' };
  }

  /**
   * @deprecated Use UserRepository.updateRiderStatus() with 'OFFLINE' instead
   */
  async deactivateRider(id: string) {
    const updated = await userRepository.update(id, { isActive: false, riderStatus: 'OFFLINE' });
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return { success: true, message: 'Rider deactivated successfully' };
  }

  /**
   * @deprecated Use UserRepository.update() instead
   */
  async activateRider(id: string) {
    const updated = await userRepository.update(id, { isActive: true });
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return { success: true, message: 'Rider activated successfully' };
  }

  /**
   * @deprecated Use UserRepository.getRiderStats() instead
   */
  async getRiderStats() {
    return await userRepository.getRiderStats();
  }

  /**
   * @deprecated Use UserRepository.incrementDeliveries() instead
   */
  async incrementDeliveries(id: string) {
    const updated = await userRepository.incrementDeliveries(id);
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return updated;
  }

  /**
   * @deprecated - Profile fields are now part of User model
   */
  async updateMyProfile(userId: string, updateData: Partial<IUser>) {
    return await userRepository.update(userId, updateData);
  }
}

export const riderService = new RiderService();
