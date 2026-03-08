/**
 * Socket Event Manager
 * Centralized service for emitting real-time events via Socket.IO
 * Ensures consistent event payloads and prevents duplicate emissions
 */

import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export type NotificationEventType = 
  | 'parcel:created' 
  | 'shipment:accepted' 
  | 'shipment:status_updated';

export interface SocketEventPayload {
  type: NotificationEventType;
  [key: string]: any;
}

class SocketEventManager {
  private io: SocketIOServer | null = null;

  /**
   * Initialize the event manager with Socket.IO instance
   */
  initialize(io: SocketIOServer) {
    this.io = io;
    logger.info(' Socket Event Manager initialized');
  }

  /**
   * Emit event to all riders
   * Event: parcel:created
   */
  emitParcelCreated(payload: {
    shipmentId: string;
    trackingNumber: string;
    sender: { name: string; address: string; phoneNumber: string };
    recipient: { name: string; address: string; phoneNumber: string };
    weight: number;
    deliveryType: string;
    price: number;
    metadata?: Record<string, any>;
    createdAt: string;
  }) {
    if (!this.io) {
      logger.warn(' [SocketEventManager] Socket.IO not initialized, skipping parcel:created emission');
      return;
    }

    try {
      const eventPayload = {
        type: 'parcel:created' as const,
        ...payload,
      };

      // Broadcast to all riders
      this.io.to('riders').emit('parcel:created', eventPayload);
      logger.info(` [SocketEventManager] Emitted parcel:created to riders - Tracking: ${payload.trackingNumber}`);
    } catch (error) {
      logger.error('[SocketEventManager] Error emitting parcel:created:', error);
    }
  }

  /**
   * Emit event to customer when rider accepts parcel
   * Event: shipment:accepted
   */
  emitShipmentAccepted(customerId: string, payload: {
    shipmentId: string;
    trackingNumber: string;
    status: string;
    riderId: string;
    riderName: string;
    riderPhoneNumber: string;
    message: string;
    acceptedAt: string;
  }) {
    if (!this.io) {
      logger.warn(' [SocketEventManager] Socket.IO not initialized, skipping shipment:accepted emission');
      return;
    }

    try {
      const eventPayload = {
        type: 'shipment:accepted' as const,
        ...payload,
      };

      // Send to specific customer
      this.io.to(`user:${customerId}`).emit('shipment:accepted', eventPayload);
      logger.info(` [SocketEventManager] Emitted shipment:accepted to user:${customerId} - Tracking: ${payload.trackingNumber}`);
    } catch (error) {
      logger.error(' [SocketEventManager] Error emitting shipment:accepted:', error);
    }
  }

  /**
   * Emit event to customer when rider updates shipment status
   * Event: shipment:status_updated
   */
  emitShipmentStatusUpdated(customerId: string, payload: {
    shipmentId: string;
    trackingNumber: string;
    oldStatus: string;
    newStatus: string;
    message: string;
    location?: string;
    updatedAt: string;
    timeline?: {
      status: string;
      message: string;
      timestamp: string;
      location?: string;
    };
  }) {
    if (!this.io) {
      logger.warn(' [SocketEventManager] Socket.IO not initialized, skipping shipment:status_updated emission');
      return;
    }

    try {
      const eventPayload = {
        type: 'shipment:status_updated' as const,
        ...payload,
      };

      // Send to specific customer
      this.io.to(`user:${customerId}`).emit('shipment:status_updated', eventPayload);
      logger.info(` [SocketEventManager] Emitted shipment:status_updated to user:${customerId} - Status: ${payload.newStatus}`);
    } catch (error) {
      logger.error('[SocketEventManager] Error emitting shipment:status_updated:', error);
    }
  }

  /**
   * Emit event to rider when parcel is rejected/cancelled
   * Event: shipment:cancelled
   */
  emitShipmentCancelled(riderId: string, payload: {
    shipmentId: string;
    trackingNumber: string;
    reason: string;
    cancelledAt: string;
  }) {
    if (!this.io) {
      logger.warn(' [SocketEventManager] Socket.IO not initialized, skipping shipment:cancelled emission');
      return;
    }

    try {
      const eventPayload = {
        type: 'shipment:cancelled' as const,
        ...payload,
      };

      // Send to specific rider
      this.io.to(`rider:${riderId}`).emit('shipment:cancelled', eventPayload);
      logger.info(` [SocketEventManager] Emitted shipment:cancelled to rider:${riderId} - Tracking: ${payload.trackingNumber}`);
    } catch (error) {
      logger.error(' [SocketEventManager] Error emitting shipment:cancelled:', error);
    }
  }

  /**
   * Get active connections count
   */
  getActiveConnectionsCount(): number {
    if (!this.io) return 0;
    return this.io.engine.clientsCount;
  }

  /**
   * Get rooms info
   */
  getRoomsInfo(): Record<string, number> {
    if (!this.io) return {};

    const result: Record<string, number> = {};
    this.io.sockets.adapter.rooms.forEach((room, roomName) => {
      if (!roomName.startsWith('/')) {
        result[roomName] = room.size;
      }
    });
    return result;
  }
}

export const socketEventManager = new SocketEventManager();
