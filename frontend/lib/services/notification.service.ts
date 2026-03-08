import axiosInstance from '../api/axios';

export interface Notification {
  _id: string;
  shipmentId: string;
  riderId: string;
  type: 'NEW_PARCEL_AVAILABLE' | 'PARCEL_ASSIGNED' | 'PARCEL_CANCELLED';
  status: 'PENDING' | 'READ' | 'ACCEPTED' | 'REJECTED';
  title: string;
  message: string;
  metadata: {
    pickupLocation?: string;
    dropLocation?: string;
    weight?: number;
    deliveryType?: string;
    trackingNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  respondedAt?: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: Notification | Notification[] | { unreadCount: number };
}

export interface PaginatedNotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
  };
}

export const notificationService = {
  /**
   * Get pending notifications (awaiting rider action)
   */
  async getPendingNotifications(): Promise<NotificationResponse> {
    const response = await axiosInstance.get<NotificationResponse>('/notifications/pending');
    return response.data;
  },

  /**
   * Get all notifications with pagination and filters
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedNotificationResponse> {
    const response = await axiosInstance.get<PaginatedNotificationResponse>('/notifications', {
      params,
    });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<NotificationResponse> {
    const response = await axiosInstance.get<NotificationResponse>('/notifications/count/unread');
    return response.data;
  },

  /**
   * Accept a delivery notification
   * This will assign the parcel to the rider and mark notification as accepted
   */
  async acceptDelivery(notificationId: string): Promise<NotificationResponse> {
    const response = await axiosInstance.post<NotificationResponse>(
      `/notifications/${notificationId}/accept`
    );
    return response.data;
  },

  /**
   * Reject a delivery notification
   * This will mark the notification as rejected for this rider only
   */
  async rejectDelivery(notificationId: string): Promise<NotificationResponse> {
    const response = await axiosInstance.post<NotificationResponse>(
      `/notifications/${notificationId}/reject`
    );
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const response = await axiosInstance.put<NotificationResponse>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },
};
