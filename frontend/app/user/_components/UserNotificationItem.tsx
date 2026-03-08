'use client';

import { useState } from 'react';
import { Notification } from '@/lib/services/notification.service';

interface UserNotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function UserNotificationItem({
  notification,
  onMarkAsRead,
  isLoading = false,
}: UserNotificationItemProps) {
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState('');

  const handleMarkAsRead = async () => {
    try {
      setActionInProgress(true);
      setError('');
      await onMarkAsRead(notification._id);
    } catch (err) {
      const error = err as Record<string, any>;
      const message = error?.response?.data?.message as string | undefined;
      setError(message || 'Failed to dismiss notification');
      setActionInProgress(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'NEW_PARCEL_AVAILABLE':
        return '';
      case 'PARCEL_ASSIGNED':
        return '';
      case 'PARCEL_CANCELLED':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border-l-4 border-amber-500 rounded-lg shadow p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">{getIconForType(notification.type)}</span>
            {notification.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
        </div>
        {notification.status === 'PENDING' && (
          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
            New
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 text-sm">
        {notification.metadata?.trackingNumber && (
          <div>
            <p className="text-gray-600">
              <span className="font-semibold"> Tracking:</span> {notification.metadata.trackingNumber}
            </p>
          </div>
        )}
        {notification.metadata?.pickupLocation && (
          <div>
            <p className="text-gray-600">
              <span className="font-semibold"> From:</span> {notification.metadata.pickupLocation}
            </p>
          </div>
        )}
        {notification.metadata?.dropLocation && (
          <div>
            <p className="text-gray-600">
              <span className="font-semibold"> To:</span> {notification.metadata.dropLocation}
            </p>
          </div>
        )}
        {notification.metadata?.weight && (
          <div>
            <p className="text-gray-600">
              <span className="font-semibold"> Weight:</span> {notification.metadata.weight} kg
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
           {error}
        </div>
      )}

      {/* Actions */}
      {notification.status === 'PENDING' && (
        <div className="flex gap-3 pt-3 border-t border-gray-200">
          <button
            onClick={handleMarkAsRead}
            disabled={actionInProgress || isLoading}
            className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-semibold rounded transition disabled:cursor-not-allowed"
          >
            {actionInProgress ? ' Processing...' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Status Display for non-pending */}
      {notification.status !== 'PENDING' && (
        <div className="pt-3 border-t border-gray-200">
          <button disabled className="w-full px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded cursor-default">
            {notification.status === 'READ' && '✓ Dismissed'}
          </button>
        </div>
      )}
    </div>
  );
}
