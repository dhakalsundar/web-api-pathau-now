import NotificationRepository from '../repositories/notification.repository';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';
import { ShipmentRepository } from '../repositories/shipment.repository';
import { socketEventManager } from './socket.event.manager';
import mongoose from 'mongoose';

const userRepository = new UserRepository();
const shipmentRepository = new ShipmentRepository();

export class NotificationService {
  /**
   * Create a notification for a new parcel available to riders
   * If riderId is not provided, broadcast to all riders
   */
  async notifyRidersOfNewParcel(
    shipmentId: string,
    pickupLocation?: string,
    dropLocation?: string,
    deliveryType?: string,
    weight?: number
  ) {
    try {
      // Get shipment details
      const shipment = await shipmentRepository.findById(shipmentId);
      if (!shipment) {
        throw new HttpError(404, 'Shipment not found');
      }

      // Get all active riders
      const allRidersResult = await userRepository.findRidersWithFilters({ isActive: true });

      // Create notifications for all riders
      const notifications = allRidersResult.riders.map((rider: any) => ({
        shipmentId: shipment._id,
        riderId: rider._id,
        type: 'NEW_PARCEL_AVAILABLE' as const,
        title: `New Delivery Available - ${shipment.trackingNumber}`,
        message: `A new parcel has been created and is available for delivery. ${shipment.sender.address} → ${shipment.recipient.address}`,
        metadata: {
          pickupLocation: pickupLocation || shipment.sender.address,
          dropLocation: dropLocation || shipment.recipient.address,
          weight,
          deliveryType,
        },
        status: 'PENDING' as const,
      }));

      // Bulk create notifications
      if (notifications.length > 0) {
        const created = await NotificationRepository.createBulk(notifications);
        console.log(` Created ${created.length} notifications for new parcel ${shipmentId}`);
        
        // Emit real-time socket event to all riders
        socketEventManager.emitParcelCreated({
          shipmentId: shipment._id.toString(),
          trackingNumber: shipment.trackingNumber,
          sender: {
            name: shipment.sender.name,
            address: shipment.sender.address,
            phoneNumber: shipment.sender.phoneNumber || '',
          },
          recipient: {
            name: shipment.recipient.name,
            address: shipment.recipient.address,
            phoneNumber: shipment.recipient.phoneNumber || '',
          },
          weight: weight || 0,
          deliveryType: deliveryType || 'PARCEL',
          price: shipment.price || 0,
          createdAt: shipment.createdAt?.toISOString() || new Date().toISOString(),
        });
        
        return created;
      }

      return [];
    } catch (error) {
      console.error('Error creating notifications:', error);
      throw error;
    }
  }

  /**
   * Get pending notifications for a rider
   */
  async getPendingNotificationsForRider(riderId: string) {
    try {
      return await NotificationRepository.findPendingByRiderId(riderId);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a rider with pagination
   */
  async getRiderNotifications(riderId: string, filters: any = {}) {
    try {
      return await NotificationRepository.findByRiderId(riderId, filters);
    } catch (error) {
      console.error('Error fetching rider notifications:', error);
      throw error;
    }
  }

  /**
   * Accept a delivery notification and assign shipment to rider
   */
  async acceptDelivery(notificationId: string, riderId: string) {
    try {
      // Get the notification
      const notification = await NotificationRepository.findById(notificationId);
      if (!notification) {
        throw new HttpError(404, 'Notification not found');
      }

      // Check if notification is still pending
      if (notification.status !== 'PENDING') {
        throw new HttpError(400, 'This notification can no longer be accepted');
      }

      // Get the shipment
      const shipment = await shipmentRepository.findById(notification.shipmentId.toString());
      if (!shipment) {
        throw new HttpError(404, 'Shipment not found');
      }

      // Check if shipment is still available (not assigned to another rider)
      if (shipment.riderUserId) {
        throw new HttpError(409, 'This shipment has already been assigned to another rider');
      }

      // Assign shipment to the accepting rider
      const riderObjectId = new (require('mongoose')).Types.ObjectId(riderId);
      const updatedShipment = await shipmentRepository.update(shipment._id.toString(), {
        riderUserId: riderObjectId,
        status: 'ASSIGNED',
      });

      // Update notification status
      await NotificationRepository.updateNotificationStatus(notificationId, 'ACCEPTED', riderId);

      // Mark all other notifications for this shipment as rejected
      await NotificationRepository.updateByShipmentId(
        notification.shipmentId.toString(),
        {
          status: 'REJECTED',
          respondedAt: new Date(),
          respondedBy: 'REJECTED',
        }
      );

      // Get the rider details for customer notification
      const rider = await userRepository.findById(riderId);
      const customerId = shipment.customerId?.toString();
      
      // Emit real-time socket event to customer
      if (customerId && rider) {
        const riderFullName = `${rider.firstName || ''} ${rider.lastName || ''}`.trim();
        socketEventManager.emitShipmentAccepted(customerId, {
          shipmentId: shipment._id.toString(),
          trackingNumber: shipment.trackingNumber,
          status: 'ASSIGNED',
          riderId: rider._id.toString(),
          riderName: riderFullName,
          riderPhoneNumber: rider.phoneNumber || '',
          message: `Your parcel is being picked up by ${riderFullName}`,
          acceptedAt: new Date().toISOString(),
        });
      }

      console.log(` Rider ${riderId} accepted delivery ${shipment.trackingNumber}`);

      return {
        success: true,
        message: 'Delivery accepted successfully',
        shipment: updatedShipment,
      };
    } catch (error) {
      console.error('Error accepting delivery:', error);
      throw error;
    }
  }

  /**
   * Reject a delivery notification
   */
  async rejectDelivery(notificationId: string, riderId: string) {
    try {
      // Get the notification
      const notification = await NotificationRepository.findById(notificationId);
      if (!notification) {
        throw new HttpError(404, 'Notification not found');
      }

      // Check if notification is still pending
      if (notification.status !== 'PENDING') {
        throw new HttpError(400, 'This notification can no longer be rejected');
      }

      // Update only this rider's notification
      await NotificationRepository.updateNotificationStatus(notificationId, 'REJECTED', riderId);

      // Emit socket event to indicate rider rejected - for potential reassignment
      const shipment = await shipmentRepository.findById(notification.shipmentId.toString());
      if (shipment && !shipment.riderUserId) {
        // Re-emit to other riders if shipment still needs a rider
        socketEventManager.emitParcelCreated({
          shipmentId: shipment._id.toString(),
          trackingNumber: shipment.trackingNumber,
          sender: {
            name: shipment.sender.name,
            address: shipment.sender.address,
            phoneNumber: shipment.sender.phoneNumber || '',
          },
          recipient: {
            name: shipment.recipient.name,
            address: shipment.recipient.address,
            phoneNumber: shipment.recipient.phoneNumber || '',
          },
          weight: 0,
          deliveryType: 'PARCEL',
          price: shipment.price || 0,
          createdAt: shipment.createdAt?.toISOString() || new Date().toISOString(),
        });
      }

      console.log(` Rider ${riderId} rejected delivery notification ${notificationId}`);

      return {
        success: true,
        message: 'Delivery rejected',
      };
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a rider
   */
  async getUnreadCount(riderId: string): Promise<number> {
    try {
      return await NotificationRepository.getUnreadCount(riderId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<any> {
    try {
      return await NotificationRepository.updateNotificationStatus(notificationId, 'READ');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export default new NotificationService();
