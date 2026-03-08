/**
 * Notification Context for Real-Time Updates
 * Manages notifications from Socket.IO events
 */

'use client'; // Next.js client component

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ParcelNotification {
  id: string;
  type: 'parcel:created' | 'shipment:accepted' | 'shipment:status_updated' | string;
  shipmentId: string;
  trackingNumber: string;
  title: string;
  message: string;
  status?: string;
  riderName?: string;
  riderPhoneNumber?: string;
  oldStatus?: string;
  newStatus?: string;
  location?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: ParcelNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<ParcelNotification, 'id' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  getLatestNotifications: (limit?: number) => ParcelNotification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * NotificationProvider Component
 * Wraps the app and provides notification management
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<ParcelNotification[]>([]);

  const addNotification = useCallback((notification: Omit<ParcelNotification, 'id' | 'read'>) => {
    const id = `${notification.shipmentId}-${Date.now()}`;
    const newNotification: ParcelNotification = {
      ...notification,
      id,
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Auto-read after 5 seconds if it's a status update
    if (notification.type === 'shipment:status_updated') {
      setTimeout(() => {
        markAsRead(id);
      }, 5000);
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getLatestNotifications = useCallback((limit: number = 10) => {
    return notifications.slice(0, limit);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getLatestNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use Notification context
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
