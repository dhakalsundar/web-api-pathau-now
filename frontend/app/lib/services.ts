import api from './api';

// Auth Service
export const authService = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await api.put(`/auth/${userId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },

  createUserByAdmin: async (data: any) => {
    const response = await api.post('/auth/user', data, {
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
    const response = await api.post('/shipments', data);
    return response.data;
  },

  getAllShipments: async (page = 1, limit = 10, filters?: any) => {
    const response = await api.get('/shipments', { params: { page, limit, ...filters } });
    return response.data;
  },

  getShipmentById: async (id: string) => {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  },

  searchShipments: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await api.get(`/shipments/search`, { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  trackShipment: async (trackingNumber: string) => {
    const response = await api.get(`/track/${trackingNumber}`);
    return response.data;
  },

  updateShipment: async (id: string, data: any) => {
    const response = await api.put(`/shipments/${id}`, data);
    return response.data;
  },

  updateShipmentStatus: async (id: string, status: string, message?: string) => {
    const response = await api.put(`/shipments/${id}/status`, { status, message });
    return response.data;
  },

  assignRider: async (id: string, riderId: string) => {
    const response = await api.post(`/admin/shipments/${id}/assign-rider`, { riderId });
    return response.data;
  },

  getShipmentStats: async () => {
    const response = await api.get('/shipments/stats');
    return response.data;
  },

  deleteShipment: async (id: string) => {
    const response = await api.delete(`/shipments/${id}`);
    return response.data;
  },
};

// Rider Service
export const riderService = {
  createRider: async (data: any) => {
    const response = await api.post('/riders', data);
    return response.data;
  },

  getAllRiders: async (page = 1, limit = 10, filters?: any) => {
    const response = await api.get('/riders', { params: { page, limit, ...filters } });
    return response.data;
  },

  getRiderById: async (id: string) => {
    const response = await api.get(`/riders/${id}`);
    return response.data;
  },

  getAvailableRiders: async () => {
    const response = await api.get('/riders/available');
    return response.data;
  },

  searchRiders: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await api.get('/riders/search', { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  updateRider: async (id: string, data: any) => {
    const response = await api.put(`/riders/${id}`, data);
    return response.data;
  },

  updateRiderStatus: async (id: string, status: string) => {
    const response = await api.put(`/riders/${id}/status`, { status });
    return response.data;
  },

  updateRiderLocation: async (id: string, location: any) => {
    const response = await api.put(`/riders/${id}/location`, location);
    return response.data;
  },

  updateRiderRating: async (id: string, rating: number) => {
    const response = await api.put(`/riders/${id}/rating`, { rating });
    return response.data;
  },

  deactivateRider: async (id: string) => {
    const response = await api.patch(`/riders/${id}/deactivate`);
    return response.data;
  },

  activateRider: async (id: string) => {
    const response = await api.patch(`/riders/${id}/activate`);
    return response.data;
  },

  deleteRider: async (id: string) => {
    const response = await api.delete(`/riders/${id}`);
    return response.data;
  },

  getRiderStats: async () => {
    const response = await api.get('/riders/stats');
    return response.data;
  },
};

// Admin Service
export const adminService = {
  createUser: async (data: any) => {
    const response = await api.post('/admin/users', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllUsers: async (options: any = {}) => {
    const { page = 1, limit = 10, role, search } = options;
    const response = await api.get('/admin/users', { 
      params: { page, limit, role, search } 
    });
    return response.data;
  },

  searchUsers: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await api.get('/admin/users/search', { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/admin/users/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },

  // Analytics
  getDashboardStats: async () => {
    const response = await api.get('/admin/analytics/dashboard');
    return response.data;
  },

  getRevenueByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get('/admin/analytics/revenue/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getRecentShipments: async () => {
    const response = await api.get('/admin/analytics/shipments/recent');
    return response.data;
  },

  getShipmentsByStatus: async (status: string) => {
    const response = await api.get(`/admin/analytics/shipments/status/${status}`);
    return response.data;
  },

  getShipmentsByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get('/admin/analytics/shipments/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Admin Shipments
  getAllAdminShipments: async (page = 1, limit = 10, filters?: any) => {
    const response = await api.get('/admin/shipments', { params: { page, limit, ...filters } });
    return response.data;
  },

  getAdminShipmentById: async (id: string) => {
    const response = await api.get(`/admin/shipments/${id}`);
    return response.data;
  },

  searchAdminShipments: async (searchTerm: string, page = 1, limit = 10) => {
    const response = await api.get('/admin/shipments/search', {
      params: { search: searchTerm, page, limit },
    });
    return response.data;
  },

  updateAdminShipment: async (id: string, data: any) => {
    const response = await api.put(`/admin/shipments/${id}`, data);
    return response.data;
  },

  updateAdminShipmentStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/shipments/${id}/status`, { status });
    return response.data;
  },

  addShipmentEvent: async (id: string, event: any) => {
    const response = await api.post(`/admin/shipments/${id}/events`, event);
    return response.data;
  },

  deleteAdminShipment: async (id: string) => {
    const response = await api.delete(`/admin/shipments/${id}`);
    return response.data;
  },

  getAdminShipmentStats: async () => {
    const response = await api.get('/admin/shipments/stats');
    return response.data;
  },
};
