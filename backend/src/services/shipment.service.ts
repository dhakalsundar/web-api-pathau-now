import { ShipmentRepository, ShipmentFilters } from '../repositories/shipment.repository';
import { RiderRepository } from '../repositories/rider.repository';
import { CreateShipmentDTO, AddEventDTO } from '../dtos/shipment.dto';
import { HttpError } from '../errors/http-error';
import { IShipment } from '../models/shipment.model';
import { validateStatusTransition, ShipmentStatus } from '../utils/shipmentStatusTransition';
import { generateTrackingNumber } from '../utils/trackingNumberGenerator';
import mongoose from 'mongoose';

const shipmentRepository = new ShipmentRepository();
const riderRepository = new RiderRepository();

export class ShipmentService {
  /**
   * Generate a unique tracking number with retry logic
   * Format: PTH-YYYYMMDD-XXXX
   * @param maxRetries Maximum number of retry attempts (default: 5)
   * @returns Unique tracking number
   * @throws HttpError if unable to generate unique number after max retries
   */
  private async generateUniqueTrackingNumber(maxRetries: number = 5): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const trackingNumber = generateTrackingNumber();
      const existing = await shipmentRepository.findByTrackingNumber(trackingNumber);
      
      if (!existing) {
        return trackingNumber;
      }
    }

    throw new HttpError(500, 'Failed to generate unique tracking number after maximum retries');
  }

  async createShipment(data: any, customerId?: string, userRole?: string) {
    // Only allow admins to create shipments without customerId
    if (!customerId && userRole !== 'ADMIN' && userRole !== 'STAFF') {
      throw new HttpError(401, 'Authentication required. Please log in to create a shipment.');
    }

    // Generate unique tracking number (or use provided one if valid)
    let trackingNumber = data.trackingNumber;
    
    if (!trackingNumber) {
      trackingNumber = await this.generateUniqueTrackingNumber();
    } else {
      // Validate provided tracking number format
      const existing = await shipmentRepository.findByTrackingNumber(trackingNumber);
      if (existing) {
        throw new HttpError(409, `Tracking number ${trackingNumber} already exists`);
      }
    }

    // Prepare shipment data
    const shipmentData: Partial<IShipment> = {
      trackingNumber,
      status: 'PENDING',
      sender: {
        name: data.sender?.name || '',
        address: data.sender?.address || '',
        phoneNumber: data.sender?.phoneNumber || '',
      },
      recipient: {
        name: data.recipient?.name || '',
        address: data.recipient?.address || '',
        phoneNumber: data.recipient?.phoneNumber || '',
      },
      weight: data.weight || 0,
      price: data.price || 0,
      deliveryType: data.deliveryType || 'STANDARD',
      paymentStatus: data.paymentStatus || 'PENDING',
      courier: 'Pathao Express',
      notes: data.notes || '',
      customerId: customerId ? new mongoose.Types.ObjectId(customerId) : undefined,
      events: [
        {
          status: 'CREATED',
          message: 'Parcel booking created',
          timestamp: new Date(),
        }
      ],
    };

    const newShipment = await shipmentRepository.create(shipmentData as any);
    return newShipment;
  }

  async getByTrackingNumber(trackingNumber: string) {
    const shipment = await shipmentRepository.findByTrackingNumber(trackingNumber);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }
    return shipment;
  }

  async getById(id: string) {
    const shipment = await shipmentRepository.findById(id);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }
    return shipment;
  }

  async getAllShipments(filters: ShipmentFilters = {}, page: number = 1, limit: number = 10) {
    return await shipmentRepository.findAll(filters, page, limit);
  }

  async searchShipments(searchTerm: string, page: number = 1, limit: number = 10) {
    return await shipmentRepository.search(searchTerm, page, limit);
  }

  async updateShipment(id: string, updateData: Partial<IShipment>) {
    const updated = await shipmentRepository.update(id, updateData);
    if (!updated) {
      throw new HttpError(404, 'Shipment not found');
    }
    return updated;
  }

  async updateShipmentStatus(id: string, status: string, eventData?: { message?: string, location?: string }) {
    const shipment = await shipmentRepository.findById(id);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    // Validate status transition
    try {
      validateStatusTransition(shipment.status as ShipmentStatus, status as ShipmentStatus);
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : 'Invalid status transition');
    }

    const event = {
      status,
      message: eventData?.message || `Status updated to ${status}`,
      location: eventData?.location,
      timestamp: new Date(),
    };

    const updated = await shipmentRepository.updateStatus(id, status, event);
    
    // If delivered, increment rider's delivery count and mark as available
    if (status === 'DELIVERED' && shipment.riderId) {
      await riderRepository.incrementDeliveries(shipment.riderId);
      await riderRepository.unassignParcel(shipment.riderId, id);
      // Explicitly mark rider as available
      await riderRepository.updateStatus(shipment.riderId, 'AVAILABLE');
    }

    return updated;
  }

  async addEvent(id: string, eventData: AddEventDTO) {
    const shipment = await shipmentRepository.findById(id);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    const event = {
      ...eventData,
      timestamp: new Date(),
    };

    const updated = await shipmentRepository.addEvent(id, event);
    return updated;
  }

  async assignRiderToShipment(shipmentId: string, riderId: string) {
    const shipment = await shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    const rider = await riderRepository.findById(riderId);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    if (!rider.isActive) {
      throw new HttpError(400, 'Rider is not active');
    }

    // Validate status transition to PICKED_UP
    const targetStatus = 'PICKED_UP';
    try {
      validateStatusTransition(shipment.status as ShipmentStatus, targetStatus as ShipmentStatus);
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : 'Invalid status transition');
    }

    // Assign rider to shipment
    const updated = await shipmentRepository.assignRider(shipmentId, riderId);
    
    // Update rider status and assign parcel
    await riderRepository.assignParcel(riderId, shipmentId);

    // Add event
    await shipmentRepository.addEvent(shipmentId, {
      status: targetStatus,
      message: `Assigned to rider ${rider.name}`,
      timestamp: new Date(),
    });

    // Update status to PICKED_UP
    await shipmentRepository.update(shipmentId, { status: targetStatus });

    return updated;
  }

  /**
   * Assign a shipment to a rider with ASSIGNED status
   * @param shipmentId The ID of the shipment
   * @param riderId The ID of the rider
   * @returns Updated shipment with rider assigned
   * @throws HttpError if shipment not found, rider not found/inactive, or invalid status transition
   */
  async assignShipmentToRider(shipmentId: string, riderId: string) {
    // Validate shipment exists
    const shipment = await shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    // Validate rider exists
    const rider = await riderRepository.findById(riderId);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    // Check rider is active
    if (!rider.isActive) {
      throw new HttpError(400, 'Rider is not active');
    }

    // Validate status transition - when rider is assigned, shipment moves to IN_TRANSIT
    const targetStatus = 'IN_TRANSIT';
    try {
      validateStatusTransition(shipment.status as ShipmentStatus, targetStatus as ShipmentStatus);
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : 'Invalid status transition');
    }

    // Attach rider reference to shipment
    const updated = await shipmentRepository.assignRider(shipmentId, riderId);

    // Mark rider as unavailable (BUSY)
    await riderRepository.updateStatus(riderId, 'BUSY');
    await riderRepository.assignParcel(riderId, shipmentId);

    // Add event to shipment
    await shipmentRepository.addEvent(shipmentId, {
      status: targetStatus,
      message: `Shipment assigned to rider ${rider.name}`,
      timestamp: new Date(),
    });

    // Update shipment status to IN_TRANSIT
    const finalShipment = await shipmentRepository.update(shipmentId, { status: targetStatus });

    return finalShipment;
  }

  async deleteShipment(id: string) {
    const deleted = await shipmentRepository.delete(id);
    if (!deleted) {
      throw new HttpError(404, 'Shipment not found');
    }
    return { success: true, message: 'Shipment deleted successfully' };
  }

  async getShipmentStats() {
    return await shipmentRepository.getStats();
  }

  async getRevenue() {
    return await shipmentRepository.getTotalRevenue();
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date) {
    return await shipmentRepository.getRevenueByDateRange(startDate, endDate);
  }

  async getRiderShipments(riderId: string) {
    return await shipmentRepository.findByRider(riderId);
  }
}
