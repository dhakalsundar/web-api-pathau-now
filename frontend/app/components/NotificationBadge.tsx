/**
 * Real-Time Notifications Display Component
 * Shows incoming notifications from socket events
 */

'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/app/context/NotificationContext';
import { Bell, X, CheckCircle, AlertCircle, InfoIcon, Package } from 'lucide-react';

interface NotificationBadgeProps {
  className?: string;
}

/**
 * NotificationBadge Component
 * Shows a floating badge with notification count
 * Can be placed in navbar or header
 */
export function NotificationBadge({ className = '' }: NotificationBadgeProps) {
  const { unreadCount, notifications, getLatestNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const latestNotifications = getLatestNotifications(5);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'parcel:created':
        return <Package className="w-4 h-4" />;
      case 'shipment:accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'shipment:status_updated':
        return <InfoIcon className="w-4 h-4 text-blue-500" />;
      case 'shipment:cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'parcel:created':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'shipment:accepted':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'shipment:status_updated':
        return 'bg-cyan-50 border-l-4 border-cyan-500';
      case 'shipment:cancelled':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title={`${unreadCount} unread notifications`}
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 bg-red-600 text-white text-xs font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {latestNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              latestNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1 truncate">
                        {notification.message}
                      </p>
                      {notification.trackingNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.trackingNumber}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * NotificationToast Component
 * Shows a small notification toast (already handled by useSocketEventListeners with showToast)
 * This is here as reference for custom styling if needed
 */
export function NotificationToast() {
  return null; // Handled by showToast from useToast hook
}
