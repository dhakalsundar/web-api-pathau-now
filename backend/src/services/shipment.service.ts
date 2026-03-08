import { ShipmentRepository, ShipmentFilters } from '../repositories/shipment.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserRiderService } from './user.rider.service';
import { CreateShipmentDTO, AddEventDTO } from '../dtos/shipment.dto';
import { HttpError } from '../errors/http-error';
import { IShipment } from '../models/shipment.model';
import { validateStatusTransition, ShipmentStatus } from '../utils/shipmentStatusTransition';
import { generateTrackingNumber } from '../utils/trackingNumberGenerator';
import NotificationService from './notification.service';
import { socketEventManager } from './socket.event.manager';
import mongoose from 'mongoose';

const shipmentRepository = new ShipmentRepository();
const userRepository = new UserRepository();
const userRiderService = new UserRiderService();

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

    console.log(` [Shipment] Creating shipment - tracking: ${trackingNumber}, customer: ${customerId}`);

    // Prepare shipment data WITHOUT auto-assigning to a rider
    // Riders will view as "Available Deliveries" and accept manually
    const shipmentData: Partial<IShipment> = {
      trackingNumber,
      status: 'PENDING',
      // riderId is NOT set - will be assigned when rider accepts
      sender: {
        name: data.sender?.name || '',
        address: data.sender?.address || '',
        phoneNumber: data.sender?.phoneNumber || '',
        email: data.sender?.email || '',
      },
      senderLocation: (data.sender?.latitude && data.sender?.longitude)
        ? {
            type: 'Point',
            coordinates: [data.sender.longitude, data.sender.latitude],
            address: data.sender?.address || '',
          }
        : undefined,
      recipient: {
        name: data.recipient?.name || '',
        address: data.recipient?.address || '',
        phoneNumber: data.recipient?.phoneNumber || '',
        email: data.recipient?.email || '',
      },
      recipientLocation: (data.recipient?.latitude && data.recipient?.longitude)
        ? {
            type: 'Point',
            coordinates: [data.recipient.longitude, data.recipient.latitude],
            address: data.recipient?.address || '',
          }
        : undefined,
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

    // Trigger notifications for all available riders
    try {
      await NotificationService.notifyRidersOfNewParcel(
        newShipment._id.toString(),
        newShipment.sender.address,
        newShipment.recipient.address,
        newShipment.deliveryType,
        newShipment.weight
      );
      console.log(` Notifications sent for shipment ${trackingNumber}`);
    } catch (error) {
      console.error('Failed to send notifications:', error);
      // Don't fail the shipment creation if notifications fail
    }

    // Emit real-time event to all connected riders
    try {
      socketEventManager.emitParcelCreated({
        shipmentId: newShipment._id.toString(),
        trackingNumber: newShipment.trackingNumber,
        sender: {
          name: newShipment.sender.name,
          address: newShipment.sender.address,
          phoneNumber: newShipment.sender.phoneNumber,
        },
        recipient: {
          name: newShipment.recipient.name,
          address: newShipment.recipient.address,
          phoneNumber: newShipment.recipient.phoneNumber,
        },
        weight: newShipment.weight ?? 0,
        deliveryType: newShipment.deliveryType?? "",
        price: newShipment.price ?? 0,
        metadata: {
          pickupLocation: newShipment.sender.address,
          dropLocation: newShipment.recipient.address,
        },
        createdAt: newShipment.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Failed to emit parcel:created event:', error);
      // Don't fail the shipment creation if socket emission fails
    }

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
    const shipment = await shipmentRepository.findById(id);
    if (!shipment) {
      throw new HttpError(404, 'Parcel not found');
    }

    // Only allow editing parcels in PENDING status
    // Once assigned to a rider (ASSIGNED status or beyond), editing is not allowed
    if (shipment.status !== 'PENDING') {
      throw new HttpError(409, `Cannot edit parcel with status "${shipment.status}". Only PENDING parcels can be edited`);
    }

    // Remove fields that should not be updated
    const protectedFields = ['_id', 'trackingNumber', 'customerId', 'riderUserId', 'status', 'events', 'createdAt', 'updatedAt'];
    const sanitizedData = { ...updateData };
    protectedFields.forEach(field => delete (sanitizedData as any)[field]);

    const updated = await shipmentRepository.update(id, sanitizedData);
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
    if (status === 'DELIVERED' && shipment.riderUserId) {
      await userRepository.incrementDeliveries(shipment.riderUserId);
      await userRepository.unassignParcel(shipment.riderUserId, id);
      // Explicitly mark rider as available
      await userRepository.updateRiderStatus(shipment.riderUserId, 'AVAILABLE');
    }

    // Emit real-time socket event to customer for status updates
    const customerId = shipment.customerId?.toString();
    if (customerId) {
      socketEventManager.emitShipmentStatusUpdated(customerId, {
        shipmentId: shipment._id.toString(),
        trackingNumber: shipment.trackingNumber,
        oldStatus: shipment.status,
        newStatus: status,
        message: eventData?.message || `Status updated to ${status.replace(/_/g, ' ')}`,
        location: eventData?.location,
        updatedAt: new Date().toISOString(),
        timeline: {
          status: status,
          message: eventData?.message || `Status updated to ${status.replace(/_/g, ' ')}`,
          timestamp: new Date().toISOString(),
          location: eventData?.location,
        },
      });
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

  async assignRiderToShipment(shipmentId: string, riderUserId: string) {
    const shipment = await shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    const rider = await userRepository.findById(riderUserId);
    if (!rider) {
      throw new HttpError(404, 'Rider not found');
    }

    if (!rider.isActive) {
      throw new HttpError(400, 'Rider is not active');
    }

    // Validate status transition to ASSIGNED
    const targetStatus = 'ASSIGNED';
    try {
      validateStatusTransition(shipment.status as ShipmentStatus, targetStatus as ShipmentStatus);
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : 'Invalid status transition');
    }

    // Assign rider to shipment
    const updated = await shipmentRepository.update(shipmentId, {
      riderUserId: new mongoose.Types.ObjectId(riderUserId),
      status: targetStatus,
    });
    
    // Update rider status and assign parcel
    await userRepository.assignParcel(riderUserId, shipmentId);
    await userRepository.updateRiderStatus(riderUserId, 'BUSY');

    // Add event
    const riderName = `${rider.firstName || ''} ${rider.lastName || ''}`.trim() || rider.email;
    await shipmentRepository.addEvent(shipmentId, {
      status: targetStatus,
      message: `Assigned to rider ${riderName}`,
      timestamp: new Date(),
    });

    return updated;
  }

  async deleteShipment(id: string) {
    const shipment = await shipmentRepository.findById(id);
    if (!shipment) {
      throw new HttpError(404, 'Parcel not found');
    }

    // Only allow deleting parcels in PENDING status
    // Once assigned to a rider (ASSIGNED status or beyond), deletion is not allowed
    if (shipment.status !== 'PENDING') {
      throw new HttpError(409, `Cannot delete parcel with status "${shipment.status}". Only PENDING parcels can be deleted`);
    }

    const deleted = await shipmentRepository.delete(id);
    if (!deleted) {
      throw new HttpError(404, 'Parcel not found');
    }
    return { success: true, message: 'Parcel deleted successfully' };
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

  async getRiderShipments(riderUserId: string) {
    return await shipmentRepository.findByRider(riderUserId);
  }

  /**
   * Accept a shipment - Rider claims an available delivery
   * Assigns the shipment to the rider and updates status to ASSIGNED
   */
  async acceptShipment(shipmentId: string, riderUserId: string) {
    const shipment = await shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    // Check if already assigned
    if (shipment.riderUserId) {
      throw new HttpError(409, 'This shipment has already been assigned to another rider');
    }

    // Check if not in PENDING status
    if (shipment.status !== 'PENDING') {
      throw new HttpError(400, `Cannot accept shipment with status: ${shipment.status}`);
    }

    console.log(`  [AcceptShipment] User ${riderUserId} accepting shipment ${shipmentId}`);
    console.log(` [AcceptShipment] Converting riderUserId to ObjectId: '${riderUserId}'`);

    // Assign shipment to rider AND change status to ASSIGNED
    // Rider can now update shipment status to PICKED_UP, IN_TRANSIT, etc.
    const userObjectId = new mongoose.Types.ObjectId(riderUserId);
    console.log(`  [AcceptShipment] ObjectId created: ${userObjectId.toString()}`);
    
    const updated = await shipmentRepository.update(shipmentId, {
      riderUserId: userObjectId,
      status: 'ASSIGNED',  // State change: PENDING → ASSIGNED
    });

    console.log(`  [AcceptShipment] Shipment updated - riderUserId now: ${updated?.riderUserId?.toString()}, status: ${updated?.status}`);

    // Add event for acceptance
    const eventData = {
      status: 'ACCEPTED',
      message: 'Parcel accepted by rider',
      timestamp: new Date(),
    };
    
    if (updated?.events) {
      updated.events.push(eventData);
      await shipmentRepository.update(shipmentId, { events: updated.events });
    }

    // Update rider status to BUSY
    try {
      await userRiderService.assignParcel(riderUserId, shipmentId);
      console.log(`[AcceptShipment] Shipment assigned to rider user ${riderUserId}`);
    } catch (error) {
      console.error('  [AcceptShipment] Error updating rider status:', error);
    }

    return updated;
  }

  /**
   * Reject a shipment - Rider declines an available delivery
   * Shipment remains unassigned and available for other riders
   */
  async rejectShipment(shipmentId: string, riderUserId: string, reason?: string) {
    const shipment = await shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    // Only allow rejection if shipment is still unassigned and pending
    if (shipment.riderUserId) {
      throw new HttpError(409, 'This shipment is already assigned');
    }

    if (shipment.status !== 'PENDING') {
      throw new HttpError(400, `Cannot reject shipment with status: ${shipment.status}`);
    }

    console.log(` [RejectShipment] Rider ${riderUserId} rejected shipment ${shipmentId}. Reason: ${reason || 'Not specified'}`);

    // Add rejection event (for audit trail)
    const eventData = {
      status: 'REJECTED',
      message: `Rejected by rider: ${reason || 'No reason provided'}`,
      timestamp: new Date(),
    };

    if (shipment.events) {
      shipment.events.push(eventData);
      await shipmentRepository.update(shipmentId, { events: shipment.events });
    }

    // Shipment stays unassigned and PENDING for other riders to accept
    return shipment;
  }

  /**
   * Update payment status - Only assigned rider can update
   * Allows: PENDING → PAID
   */
  async updatePaymentStatus(shipmentId: string, riderUserId: string, newPaymentStatus: string) {
    const shipment = await shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new HttpError(404, 'Shipment not found');
    }

    // Payment status can only be updated by the assigned rider
    if (!shipment.riderUserId) {
      throw new HttpError(403, 'Cannot update payment status - shipment not accepted yet');
    }

    if (shipment.riderUserId.toString() !== riderUserId) {
      throw new HttpError(403, 'Only the assigned rider can update payment status');
    }

    // Validate payment status
    if (!['PENDING', 'PAID', 'COD'].includes(newPaymentStatus)) {
      throw new HttpError(400, 'Invalid payment status. Must be PENDING, PAID, or COD');
    }

    // Only allow PENDING → PAID transition for rider
    if (shipment.paymentStatus === 'PAID' && newPaymentStatus === 'PENDING') {
      throw new HttpError(400, 'Cannot revert payment status from PAID to PENDING');
    }

    console.log(` [UpdatePaymentStatus] Rider ${riderUserId} updating payment status for shipment ${shipmentId} to ${newPaymentStatus}`);

    const updated = await shipmentRepository.update(shipmentId, {
      paymentStatus: newPaymentStatus as 'PENDING' | 'PAID' | 'COD',
    });

    // Add event for payment status change
    if (updated?.events) {
      updated.events.push({
        status: 'PAYMENT_UPDATED',
        message: `Payment status updated to ${newPaymentStatus}`,
        timestamp: new Date(),
      });
      await shipmentRepository.update(shipmentId, { events: updated.events });
    }

    return updated;
  }

  /**
   * Get available (unassigned) shipments for riders to accept
   */
  async getAvailableShipments(page: number = 1, limit: number = 10) {
    return await shipmentRepository.findAvailableShipments(page, limit);
  }
}
