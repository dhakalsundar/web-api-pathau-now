/**
 * Hook to Setup Socket Event Listeners
 * Connects real-time socket events to notification management
 */

'use client';
import { useEffect } from 'react';
import { useSocket } from '@/app/context/SocketContext';
import { useNotifications } from '@/app/context/NotificationContext';
import { notificationToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

/**
 * useSocketEventListeners Hook
 * Sets up all socket event listeners
 * Should be called once per app lifecycle
 */
export function useSocketEventListeners() {
  const { socket, isConnected } = useSocket();
  const { addNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('🎧 [SocketEventListeners] Setting up event listeners');

  
    const handleParcelCreated = (data: any) => {
      console.log(' [SocketListener] parcel:created event received:', data);

      addNotification({
        type: 'parcel:created',
        shipmentId: data.shipmentId,
        trackingNumber: data.trackingNumber,
        title: `New Delivery Available - ${data.trackingNumber}`,
        message: `New parcel from ${data.sender.name} to ${data.recipient.address}`,
        status: 'PENDING',
        metadata: {
          sender: data.sender,
          recipient: data.recipient,
          weight: data.weight,
          deliveryType: data.deliveryType,
          price: data.price,
        },
        timestamp: data.createdAt || new Date().toISOString(),
      });

      notificationToast.info(
        `New Delivery: ${data.trackingNumber} from ${data.sender.name}`
      );
    };

    socket.on('parcel:created', handleParcelCreated);

   
    const handleShipmentAccepted = (data: any) => {
      console.log(' [SocketListener] shipment:accepted event received:', data);

      addNotification({
        type: 'shipment:accepted',
        shipmentId: data.shipmentId,
        trackingNumber: data.trackingNumber,
        title: 'Delivery Accepted',
        message: data.message || `Your parcel has been accepted by ${data.riderName}`,
        status: data.status,
        riderName: data.riderName,
        riderPhoneNumber: data.riderPhoneNumber,
        timestamp: data.acceptedAt || new Date().toISOString(),
      });

      notificationToast.success(
        `${data.riderName} accepted your delivery ${data.trackingNumber}`
      );

      // Optionally navigate to shipment tracking
      // router.push(`/user/parcels/${data.shipmentId}`);
    };

    socket.on('shipment:accepted', handleShipmentAccepted);

   
    const handleShipmentStatusUpdated = (data: any) => {
      console.log(' [SocketListener] shipment:status_updated event received:', data);

      const statusMessages: Record<string, string> = {
        PICKED_UP: 'Your parcel has been picked up',
        IN_TRANSIT: 'Your parcel is on the way',
        OUT_FOR_DELIVERY: 'Your parcel is out for delivery',
        DELIVERED: 'Your parcel has been delivered',
        FAILED: 'Delivery failed',
        CANCELLED: 'Delivery cancelled',
      };

      addNotification({
        type: 'shipment:status_updated',
        shipmentId: data.shipmentId,
        trackingNumber: data.trackingNumber,
        title: `Status: ${data.newStatus.replace(/_/g, ' ')}`,
        message: data.message || statusMessages[data.newStatus] || `Status updated to ${data.newStatus}`,
        status: data.newStatus,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        location: data.location,
        timestamp: data.updatedAt || new Date().toISOString(),
      });

      notificationToast.info(
        data.message || statusMessages[data.newStatus]
      );

      // Optionally refresh parcel details page
      // router.refresh();
    };

    socket.on('shipment:status_updated', handleShipmentStatusUpdated);

  
    const handleShipmentCancelled = (data: any) => {
      console.log(' [SocketListener] shipment:cancelled event received:', data);

      addNotification({
        type: 'shipment:cancelled' as any,
        shipmentId: data.shipmentId,
        trackingNumber: data.trackingNumber,
        title: 'Delivery Cancelled',
        message: data.reason || 'This delivery has been cancelled',
        status: 'CANCELLED',
        timestamp: data.cancelledAt || new Date().toISOString(),
      });

      notificationToast.error(
        `${data.trackingNumber}: ${data.reason || 'Delivery cancelled'}`
      );
    };

    socket.on('shipment:cancelled', handleShipmentCancelled);

    // Cleanup: Remove listeners on unmount
    return () => {
      console.log(' [SocketEventListeners] Removing event listeners');
      socket.off('parcel:created', handleParcelCreated);
      socket.off('shipment:accepted', handleShipmentAccepted);
      socket.off('shipment:status_updated', handleShipmentStatusUpdated);
      socket.off('shipment:cancelled', handleShipmentCancelled);
    };
  }, [socket, isConnected, addNotification, router]);
}
