import { RiderRepository, RiderFilters } from '../repositories/rider.repository';
import { HttpError } from '../errors/http-error';
import { IRider } from '../models/rider.model';

const riderRepository = new RiderRepository();

export class RiderService {
  async createRider(data: Partial<IRider>) {
    // Check if phone number already exists
    if (data.phoneNumber) {
      const existing = await riderRepository.findByPhoneNumber(data.phoneNumber);
      if (existing) {
        throw new HttpError(400, 'Phone number already in use');
      }
    }

    const riderData = {
      ...data,
      status: data.status || 'OFFLINE',
      isActive: true,
      totalDeliveries: 0,
      rating: 0,
    };

    const newRider = await riderRepository.create(riderData as any);
    return newRider;
  }

  async getRiderById(id: string) {
    const rider = await riderRepository.findById(id);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }
    return rider;
  }

  async getAllRiders(filters: RiderFilters = {}, page: number = 1, limit: number = 10) {
    return await riderRepository.findAll(filters, page, limit);
  }

  async getAvailableRiders() {
    return await riderRepository.getAvailableRiders();
  }

  async searchRiders(searchTerm: string, page: number = 1, limit: number = 10) {
    return await riderRepository.search(searchTerm, page, limit);
  }

  async updateRider(id: string, updateData: Partial<IRider>) {
    const rider = await riderRepository.findById(id);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    // Check if updating phone number to one that already exists
    if (updateData.phoneNumber && updateData.phoneNumber !== rider.phoneNumber) {
      const existing = await riderRepository.findByPhoneNumber(updateData.phoneNumber);
      if (existing) {
        throw new HttpError(400, 'Phone number already in use');
      }
    }

    const updated = await riderRepository.update(id, updateData);
    return updated;
  }

  async updateRiderStatus(id: string, status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') {
    const updated = await riderRepository.updateStatus(id, status);
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return updated;
  }

  async updateRiderLocation(id: string, location: { latitude: number, longitude: number, address?: string }) {
    const updated = await riderRepository.updateLocation(id, location);
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return updated;
  }

  async updateRiderRating(id: string, rating: number) {
    if (rating < 0 || rating > 5) {
      throw new HttpError(400, 'Rating must be between 0 and 5');
    }

    const updated = await riderRepository.updateRating(id, rating);
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return updated;
  }

  async deleteRider(id: string) {
    const rider = await riderRepository.findById(id);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    // Check if rider has assigned parcels
    if (rider.assignedParcels && rider.assignedParcels.length > 0) {
      throw new HttpError(400, 'Cannot delete rider with assigned parcels');
    }

    const deleted = await riderRepository.delete(id);
    return { success: true, message: 'Rider deleted successfully' };
  }

  async deactivateRider(id: string) {
    const updated = await riderRepository.update(id, { isActive: false, status: 'OFFLINE' });
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return { success: true, message: 'Rider deactivated successfully' };
  }

  async activateRider(id: string) {
    const updated = await riderRepository.update(id, { isActive: true });
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return { success: true, message: 'Rider activated successfully' };
  }

  async getRiderStats() {
    return await riderRepository.getStats();
  }

  async incrementDeliveries(id: string) {
    const updated = await riderRepository.incrementDeliveries(id);
    if (!updated) {
      throw new HttpError(404, 'Rider not found');
    }
    return updated;
  }
}

export const riderService = new RiderService();