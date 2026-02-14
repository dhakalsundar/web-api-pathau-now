import axiosInstance from '@/lib/api/axios';
import { setAuthCookies, clearAuthCookies } from '@/lib/cookies';

/**
 * IMPORTANT: This file has been refactored to use the centralized axios instance
 * from lib/api/axios.ts. All API calls now go through the properly configured
 * axios interceptor with token refresh, error handling, and notifications.
 */

// Auth Service
export const authService = {
  register: async (data: any) => {
    const response = await axiosInstance.post('/auth/register', data);
    
    // Store tokens and user data from response
    if (response.data?.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      const user = response.data.data.user;
      setAuthCookies(accessToken, refreshToken, user);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    
    // Store tokens and user data from response
    if (response.data?.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      const user = response.data.data.user;
      setAuthCookies(accessToken, refreshToken, user);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },

  logout: async () => {
    clearAuthCookies();
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await axiosInstance.put(`/auth/${userId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await axiosInstance.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },

  createUserByAdmin: async (data: any) => {
    const response = await axiosInstance.post('/auth/user', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Shipment Service
export const shipmentService = {
  createShipment: async (data: any) => {
    const response = await axiosInstance.post('/shipments', data);
    return response.data;
  },

  getAllShipments: async (page = 1, limit = 10, filters?: any) => {
    const response = await axiosInstance.get('/shipments', { params: { page, limit, ...filters } });
    return response.data;
  },

  getUserShipments: async (options?: any) => {
    const { page = 1, limit = 10, status, search } = options || {};
    const filters: any = { page, limit };
    if (status) filters.status = status;
    const response = await axiosInstance.get('/shipments', { params: filters });
    return response.data;
  },

  getShipmentById: async (id: string) => {
    const response = await axiosInstance.get(`/shipments/${id}`);
    return response.data;
  },

  searchShipments: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/shipments/search`, { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  trackShipment: async (trackingNumber: string) => {
    const response = await axiosInstance.get(`/track/${trackingNumber}`);
    return response.data;
  },

  updateShipment: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/shipments/${id}`, data);
    return response.data;
  },

  updateShipmentStatus: async (id: string, status: string, message?: string) => {
    const response = await axiosInstance.put(`/shipments/${id}/status`, { status, message });
    return response.data;
  },

  assignRider: async (id: string, riderId: string) => {
    const response = await axiosInstance.post(`/admin/shipments/${id}/assign-rider`, { riderId });
    return response.data;
  },

  getShipmentStats: async () => {
    const response = await axiosInstance.get('/shipments/stats');
    return response.data;
  },

  deleteShipment: async (id: string) => {
    const response = await axiosInstance.delete(`/shipments/${id}`);
    return response.data;
  },
};

// Rider Service
export const riderService = {
  createRider: async (data: any) => {
    const response = await axiosInstance.post('/riders', data);
    return response.data;
  },

  getAllRiders: async (page = 1, limit = 10, filters?: any) => {
    const response = await axiosInstance.get('/riders', { params: { page, limit, ...filters } });
    return response.data;
  },

  getRiderById: async (id: string) => {
    const response = await axiosInstance.get(`/riders/${id}`);
    return response.data;
  },

  getAvailableRiders: async () => {
    const response = await axiosInstance.get('/riders/available');
    return response.data;
  },

  searchRiders: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await axiosInstance.get('/riders/search', { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  updateRider: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/riders/${id}`, data);
    return response.data;
  },

  updateRiderStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/riders/${id}/status`, { status });
    return response.data;
  },

  updateRiderLocation: async (id: string, location: any) => {
    const response = await axiosInstance.put(`/riders/${id}/location`, location);
    return response.data;
  },

  updateRiderRating: async (id: string, rating: number) => {
    const response = await axiosInstance.put(`/riders/${id}/rating`, { rating });
    return response.data;
  },

  deactivateRider: async (id: string) => {
    const response = await axiosInstance.patch(`/riders/${id}/deactivate`);
    return response.data;
  },

  activateRider: async (id: string) => {
    const response = await axiosInstance.patch(`/riders/${id}/activate`);
    return response.data;
  },

  deleteRider: async (id: string) => {
    const response = await axiosInstance.delete(`/riders/${id}`);
    return response.data;
  },

  getRiderStats: async () => {
    const response = await axiosInstance.get('/riders/stats');
    return response.data;
  },

  getCurrentRider: async () => {
    const response = await axiosInstance.get('/riders/me');
    return response.data;
  },

  getMyAssignedShipments: async (options?: any) => {
    const { page = 1, limit = 10, status } = options || {};
    const params: any = { page, limit };
    if (status) params.status = status;
    const response = await axiosInstance.get('/riders/me/shipments', { params });
    return response.data;
  },

  getMyShipmentDetails: async (shipmentId: string) => {
    const response = await axiosInstance.get(`/riders/me/shipments/${shipmentId}`);
    return response.data;
  },

  updateMyShipmentStatus: async (shipmentId: string, status: string, message?: string, location?: string) => {
    const response = await axiosInstance.put(`/riders/me/shipments/${shipmentId}/status`, {
      status,
      message,
      location,
    });
    return response.data;
  },

  updateMyLocation: async (latitude: number, longitude: number, address?: string) => {
    const response = await axiosInstance.put('/riders/me/location', {
      latitude,
      longitude,
      address,
    });
    return response.data;
  },

  updateMyStatus: async (status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => {
    const response = await axiosInstance.put('/riders/me/status', { status });
    return response.data;
  },

  getMyStats: async () => {
    const response = await axiosInstance.get('/riders/me/stats');
    return response.data;
  },
};

// Admin Service
export const adminService = {
  createUser: async (data: any) => {
    const response = await axiosInstance.post('/admin/users', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllUsers: async (options: any = {}) => {
    const { page = 1, limit = 10, role, search } = options;
    const response = await axiosInstance.get('/admin/users', { 
      params: { page, limit, role, search } 
    });
    return response.data;
  },

  searchUsers: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await axiosInstance.get('/admin/users/search', { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await axiosInstance.get('/admin/users/stats');
    return response.data;
  },

  // Analytics
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/analytics/stats');
    return response.data;
  },

  getRevenueByDateRange: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/admin/analytics/revenue/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getRecentShipments: async () => {
    const response = await axiosInstance.get('/admin/analytics/shipments/recent');
    return response.data;
  },

  getShipmentsByStatus: async (status: string) => {
    const response = await axiosInstance.get(`/admin/analytics/shipments/status/${status}`);
    return response.data;
  },

  getShipmentsByDateRange: async (startDate: string, endDate: string) => {
    const response = await axiosInstance.get('/admin/analytics/shipments/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Admin Shipments
  getAllAdminShipments: async (page = 1, limit = 10, filters?: any) => {
    const response = await axiosInstance.get('/admin/shipments', { params: { page, limit, ...filters } });
    return response.data;
  },

  getAdminShipmentById: async (id: string) => {
    const response = await axiosInstance.get(`/admin/shipments/${id}`);
    return response.data;
  },

  searchAdminShipments: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await axiosInstance.get('/admin/shipments/search', {
      params: { search: searchTerm, page, limit },
    });
    return response.data;
  },

  updateAdminShipment: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/admin/shipments/${id}`, data);
    return response.data;
  },

  updateAdminShipmentStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/admin/shipments/${id}/status`, { status });
    return response.data;
  },

  addShipmentEvent: async (id: string, event: any) => {
    const response = await axiosInstance.post(`/admin/shipments/${id}/events`, event);
    return response.data;
  },

  deleteAdminShipment: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/shipments/${id}`);
    return response.data;
  },

  getAdminShipmentStats: async () => {
    const response = await axiosInstance.get('/admin/shipments/stats');
    return response.data;
  },
};
