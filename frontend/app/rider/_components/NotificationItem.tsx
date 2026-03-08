'use client';

import { useState } from 'react';
import { Notification } from '@/lib/services/notification.service';

interface NotificationItemProps {
  notification: Notification;
  onAccept: (notificationId: string) => Promise<void>;
  onReject: (notificationId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function NotificationItem({
  notification,
  onAccept,
  onReject,
  isLoading = false,
}: NotificationItemProps) {
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    try {
      setActionInProgress(true);
      setError('');
      await onAccept(notification._id);
    } catch (err) {
      const error = err as Record<string, any>;
      const message = error?.response?.data?.message as string | undefined;
      setError(message || 'Failed to accept delivery');
      setActionInProgress(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionInProgress(true);
      setError('');
      await onReject(notification._id);
    } catch (err) {
      const error = err as Record<string, any>;
      const message = error?.response?.data?.message as string | undefined;
      setError(message || 'Failed to reject delivery');
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

  return (
    <div className="bg-white border-l-4 border-green-500 rounded-lg shadow p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg"></span>
            {notification.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
        </div>
        {notification.status === 'PENDING' && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
            Action Required
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 text-sm">
        {notification.metadata?.pickupLocation && (
          <div>
            <p className="text-gray-600">
              <span className="font-semibold"> Pickup:</span> {notification.metadata.pickupLocation}
            </p>
          </div>
        )}
        {notification.metadata?.dropLocation && (
          <div>
            <p className="text-gray-600">
              <span className="font-semibold"> Drop:</span> {notification.metadata.dropLocation}
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
        {notification.metadata?.deliveryType && (
          <div>
            <p className="text-gray-600">
              <span className="font-semibold"> Type:</span> {notification.metadata.deliveryType}
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
            onClick={handleAccept}
            disabled={actionInProgress || isLoading}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded transition disabled:cursor-not-allowed"
          >
            {actionInProgress ? ' Processing...' : '✓ Accept'}
          </button>
          <button
            onClick={handleReject}
            disabled={actionInProgress || isLoading}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded transition disabled:cursor-not-allowed"
          >
            {actionInProgress ? ' Processing...' : '✕ Reject'}
          </button>
        </div>
      )}

      {/* Status Display for non-pending */}
      {notification.status !== 'PENDING' && (
        <div className="pt-3 border-t border-gray-200">
          <button disabled className="w-full px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded cursor-default">
            {notification.status === 'ACCEPTED' && '✓ Accepted'}
            {notification.status === 'REJECTED' && '✕ Rejected'}
            {notification.status === 'READ' && ' Viewed'}
          </button>
        </div>
      )}
    </div>
  );
}
