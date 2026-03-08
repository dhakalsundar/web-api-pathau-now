'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, Notification } from '@/lib/services/notification.service';
import { useSocket } from '@/app/context/SocketContext';
import NotificationItem from './NotificationItem';
import { notificationToast } from '@/lib/toast';

interface NotificationPanelProps {
  autoRefresh?: boolean;
  refetchInterval?: number; // milliseconds
}

export default function NotificationPanel({
  autoRefresh = true,
  refetchInterval = 10000, // 10 seconds default
}: NotificationPanelProps) {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedView, setExpandedView] = useState(false);
  const socketParcelCreatedListenerRef = useRef(false);

  // Fetch pending notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getPendingNotifications();
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
        setError('');
      }
    } catch (err) {
      const error = err as Record<string, unknown>;
      console.error(' Error fetching notifications:', err);
      // Don't set error state for auto-refresh to avoid UI flickering
      if (!autoRefresh) {
        setError(((error.response as Record<string, Record<string, string>>)?.data?.message) || 'Failed to load notifications');
      }
    }
  }, [autoRefresh]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data && typeof response.data === 'object' && 'unreadCount' in response.data) {
        // Use the unread count for potential future features
        // For now, we just rely on the pending notifications list
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Auto-refresh setup with socket event listener
  useEffect(() => {
    // Listen to real-time socket events for instant updates
    if (socket && isConnected && !socketParcelCreatedListenerRef.current) {
      socketParcelCreatedListenerRef.current = true;
      
      const handleParcelCreated = (data: any) => {
        console.log('[NotificationPanel] Real-time parcel:created event received:', data);
        // Trigger immediate refresh when new parcel is available
        fetchNotifications();
        notificationToast.info(`New delivery available: ${data.trackingNumber}`);
      };

      socket.on('parcel:created', handleParcelCreated);
      
      return () => {
        socket.off('parcel:created', handleParcelCreated);
        socketParcelCreatedListenerRef.current = false;
      };
    }
  }, [socket, isConnected, fetchNotifications]);

  // Polling as fallback (less frequent now with socket events)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchInterval, fetchNotifications, fetchUnreadCount]);

  const handleAccept = async (notificationId: string) => {
    try {
      setLoading(true);
      await notificationService.acceptDelivery(notificationId);
      notificationToast.success('Delivery accepted! Parcel assigned to you.');
      
      // Remove notification from list
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      await fetchUnreadCount();
    } catch (err) {
      const error = err as Record<string, unknown>;
      const message = ((error.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 'Failed to accept delivery';
      notificationToast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (notificationId: string) => {
    try {
      setLoading(true);
      await notificationService.rejectDelivery(notificationId);
      notificationToast.success('Delivery rejected. Notification dismissed.');
      
      // Remove notification from list
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      await fetchUnreadCount();
    } catch (err) {
      const error = err as Record<string, unknown>;
      const message = ((error.response as Record<string, unknown>)?.data as Record<string, unknown>)?.message as string || 'Failed to reject delivery';
      notificationToast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Compact view (notification bell with count)
  if (!expandedView) {
    return (
      <div className="relative">
        <button
          onClick={() => setExpandedView(true)}
          className="relative p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          title="View notifications"
        >
          <span className="text-2xl"></span>
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notifications.length > 99 ? '99+' : notifications.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Expanded view (full notification panel)
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900"> Notifications</h2>
          <p className="text-sm text-gray-600 mt-1">
            {notifications.length} pending delivery{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setExpandedView(false)}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-red-700 font-medium"> {error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onAccept={handleAccept}
              onReject={handleReject}
              isLoading={loading}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-3xl mb-2"></p>
            <p className="text-gray-600 font-medium">All caught up!</p>
            <p className="text-gray-500 text-sm">No pending deliveries right now</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={async () => {
            await fetchNotifications();
            await fetchUnreadCount();
            notificationToast.info('Notifications refreshed');
          }}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-semibold rounded transition disabled:cursor-not-allowed"
        >
          {loading ? ' Refreshing...' : ' Refresh'}
        </button>
      </div>
    </div>
  );
}
