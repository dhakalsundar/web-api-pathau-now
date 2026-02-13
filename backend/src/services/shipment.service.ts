import { ShipmentRepository, ShipmentFilters } from '../repositories/shipment.repository';
import { RiderRepository } from '../repositories/rider.repository';
import { CreateShipmentDTO, AddEventDTO } from '../dtos/shipment.dto';
import { HttpError } from '../errors/http-error';
import { IShipment } from '../models/shipment.model';
import mongoose from 'mongoose';

const shipmentRepository = new ShipmentRepository();
const riderRepository = new RiderRepository();

export class ShipmentService {
  private generateTrackingNumber(): string {
    // Generate: PN + timestamp + random
    return 'PN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  async createShipment(data: any, customerId?: string) {
    // Generate tracking number if not provided
    const trackingNumber = data.trackingNumber || this.generateTrackingNumber();
    
    // Check if tracking number already exists
    const existing = await shipmentRepository.findByTrackingNumber(trackingNumber);
    if (existing) {
      throw new HttpError(409, 'Tracking number already exists');
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
          status: 'PENDING',
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

    const event = {
      status,
      message: eventData?.message || `Status updated to ${status}`,
      location: eventData?.location,
      timestamp: new Date(),
    };

    const updated = await shipmentRepository.updateStatus(id, status, event);
    
    // If delivered, increment rider's delivery count
    if (status === 'DELIVERED' && shipment.riderId) {
      await riderRepository.incrementDeliveries(shipment.riderId);
      await riderRepository.unassignParcel(shipment.riderId, id);
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

    // Assign rider to shipment
    const updated = await shipmentRepository.assignRider(shipmentId, riderId);
    
    // Update rider status and assign parcel
    await riderRepository.assignParcel(riderId, shipmentId);

    // Add event
    await shipmentRepository.addEvent(shipmentId, {
      status: 'PICKED_UP',
      message: `Assigned to rider ${rider.name}`,
      timestamp: new Date(),
    });

    // Update status to PICKED_UP
    await shipmentRepository.update(shipmentId, { status: 'PICKED_UP' });

    return updated;
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
