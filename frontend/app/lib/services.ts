import axiosInstance from '@/lib/api/axios';
import { setAuthCookies, clearAuthCookies, readAuthFromCookies } from '@/lib/cookies';

/**
 * IMPORTANT: This file has been refactored to use the centralized axios instance
 * from lib/api/axios.ts. All API calls now go through the properly configured
 * axios interceptor with token refresh, error handling, and notifications.
 */

// Auth Service
export const authService = {
  // ⚠️ NO TOKEN NEEDED - Public endpoint
  register: async (data: any) => {
    console.log('📝 [AuthService] REGISTER - No token needed (public endpoint)');
    const response = await axiosInstance.post('/auth/register', data);
    
    // Store token and user data from response
    if (response.data?.data?.tokens?.accessToken) {
      const { accessToken } = response.data.data.tokens;
      const user = response.data.data.user;
      setAuthCookies(accessToken, user);
    }
    
    return response.data;
  },

  // ⚠️ NO TOKEN NEEDED - Public endpoint
  login: async (email: string, password: string) => {
    console.log('🔐 [AuthService] LOGIN - No token needed (public endpoint), email:', email);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      
      console.log('📨 [AuthService] Full response:', {
        status: response.status,
        dataKeys: Object.keys(response.data || {}),
      });

      // Check various possible response structures
      let accessToken = null;
      let user = null;

      // Try structure 1: { data: { tokens: {...}, user: {...} } }
      if (response.data?.data?.tokens?.accessToken) {
        accessToken = response.data.data.tokens.accessToken;
        user = response.data.data.user;
        console.log('✅ [AuthService] Token found in data.data.tokens');
      }
      // Try structure 2: { tokens: {...}, user: {...} } 
      else if (response.data?.tokens?.accessToken) {
        accessToken = response.data.tokens.accessToken;
        user = response.data.user;
        console.log('✅ [AuthService] Token found in data.tokens');
      }
      // Try structure 3: Direct token in response
      else if (response.data?.accessToken) {
        accessToken = response.data.accessToken;
        user = response.data.user;
        console.log('✅ [AuthService] Token found in data');
      }

      if (!accessToken) {
        console.error('❌ [AuthService] No token found in response:', JSON.stringify(response.data));
        throw new Error('Login response does not contain valid token');
      }

      console.log('✅ [AuthService] Token extracted - storing in cookie');
      
      // Log user details including createdAt
      console.log('📝 [AuthService] User details being saved:', {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        role: user?.role,
        createdAt: user?.createdAt,
      });

      // Save to cookies
      setAuthCookies(accessToken, user);

      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Login error:', error);
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  logout: async () => {
    console.log('🔓 [AuthService] LOGOUT - Token required (protected endpoint). Clearing all authentication data...');
    clearAuthCookies();
    console.log('✅ [AuthService] Auth cookies cleared');
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getProfile: async () => {
    console.log('👤 [AuthService] GET PROFILE - Token required (protected endpoint)');
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updateProfile: async (userId: string, data: any) => {
    console.log('✏️ [AuthService] UPDATE PROFILE - Token required (protected endpoint), userId:', userId);
    const response = await axiosInstance.put(`/auth/${userId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updatePassword: async (currentPassword: string, newPassword: string) => {
    console.log('🔑 [AuthService] UPDATE PASSWORD - Token required (protected endpoint)');
    const response = await axiosInstance.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  createUserByAdmin: async (data: any) => {
    console.log('👥 [AuthService] CREATE USER BY ADMIN - Token required (admin-only endpoint)');
    const response = await axiosInstance.post('/auth/user', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Parcel Service
export const parcelService = {
  // ✅ TOKEN NEEDED - Protected endpoint
  createParcel: async (data: any) => {
    console.log('📦 [ParcelService] CREATE - Token required (protected endpoint)');
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [ParcelService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.post('/parcels', data);
      console.log('✅ [ParcelService] Parcel created successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [ParcelService] Error creating parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getAllParcels: async (page = 1, limit = 10, filters?: any) => {
    console.log('📋 [ParcelService] GET ALL - Token required (protected endpoint), page:', page);
    const response = await axiosInstance.get('/parcels', { params: { page, limit, ...filters } });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getUserParcels: async (options?: any) => {
    const { page = 1, limit = 10, status, search } = options || {};
    console.log('👤 [ParcelService] GET USER PARCELS - Token required (protected endpoint), filters:', { status, search });
    const filters: any = { page, limit };
    if (status) filters.status = status;
    if (search) filters.search = search;
    const response = await axiosInstance.get('/parcels', { params: filters });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getParcelById: async (id: string) => {
    console.log('🔍 [ParcelService] GET BY ID - Token required (protected endpoint), id:', id);
    const response = await axiosInstance.get(`/parcels/${id}`);
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  searchParcels: async (searchTerm: string, page = 1, limit = 10) => {
    console.log('🔎 [ParcelService] SEARCH - Token required (protected endpoint), search:', searchTerm);
    const response = await axiosInstance.get(`/parcels/search`, { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  // ⚠️ NO TOKEN NEEDED - Public endpoint
  trackParcel: async (trackingNumber: string) => {
    console.log('📍 [ParcelService] TRACK - No token needed (public endpoint), trackingNumber:', trackingNumber);
    const response = await axiosInstance.get(`/track/${trackingNumber}`);
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (only PENDING parcels, owner only)
  updateParcel: async (id: string, data: any) => {
    console.log('✏️ [ParcelService] UPDATE - Token required (protected endpoint), id:', id);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [ParcelService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.put(`/parcels/${id}`, data);
      console.log('✅ [ParcelService] Parcel updated successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [ParcelService] Error updating parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updateParcelStatus: async (id: string, status: string, message?: string) => {
    console.log('📊 [ParcelService] UPDATE STATUS - Token required (protected endpoint), id:', id, 'status:', status);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [ParcelService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.put(`/parcels/${id}/status`, { status, message });
      console.log('✅ [ParcelService] Parcel status updated successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [ParcelService] Error updating parcel status:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  assignRider: async (id: string, riderId: string) => {
    console.log('🏍️ [ParcelService] ASSIGN RIDER - Token required (admin-only endpoint), id:', id, 'riderId:', riderId);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [ParcelService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.post(`/admin/parcels/${id}/assign-rider`, { riderId });
      console.log('✅ [ParcelService] Rider assigned successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [ParcelService] Error assigning rider:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getParcelStats: async () => {
    console.log('📈 [ParcelService] GET STATS - Token required (protected endpoint)');
    const response = await axiosInstance.get('/parcels/stats');
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (only PENDING parcels, owner only)
  deleteParcel: async (id: string) => {
    console.log('🗑️ [ParcelService] DELETE - Token required (protected endpoint), id:', id);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [ParcelService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.delete(`/parcels/${id}`);
      console.log('✅ [ParcelService] Parcel deleted successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [ParcelService] Error deleting parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },
};

// Rider Service
export const riderService = {
  // ✅ TOKEN NEEDED - Protected endpoint
  createRider: async (data: any) => {
    console.log('🏍️ [RiderService] CREATE - Token required (protected endpoint)');
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [RiderService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.post('/riders', data);
      console.log('✅ [RiderService] Rider created successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [RiderService] Error creating rider:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getAllRiders: async (page = 1, limit = 10, filters?: any) => {
    console.log('📋 [RiderService] GET ALL - Token required (protected endpoint)');
    const response = await axiosInstance.get('/riders', { params: { page, limit, ...filters } });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getRiderById: async (id: string) => {
    console.log('🔍 [RiderService] GET BY ID - Token required (protected endpoint), id:', id);
    const response = await axiosInstance.get(`/riders/${id}`);
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getAvailableRiders: async () => {
    console.log('✅ [RiderService] GET AVAILABLE - Token required (protected endpoint)');
    const response = await axiosInstance.get('/riders/available');
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  searchRiders: async (searchTerm: string, page = 1, limit = 10) => {
    console.log('🔎 [RiderService] SEARCH - Token required (protected endpoint), search:', searchTerm);
    const response = await axiosInstance.get('/riders/search', { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updateRider: async (id: string, data: any) => {
    console.log('✏️ [RiderService] UPDATE - Token required (protected endpoint), id:', id);
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

  // ✅ TOKEN NEEDED - Protected endpoint
  getCurrentRider: async () => {
    console.log('👤 [RiderService] GET CURRENT - Token required (protected endpoint)');
    const response = await axiosInstance.get('/riders/me');
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updateMyProfile: async (data: any) => {
    console.log('✏️ [RiderService] UPDATE MY PROFILE - Token required (protected endpoint)');
    const response = await axiosInstance.put('/riders/me', data);
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getMyAssignedParcels: async (options?: any) => {
    const { page = 1, limit = 10, status } = options || {};
    console.log('📦 [RiderService] GET ASSIGNED PARCELS - Token required (protected endpoint)');
    const params: any = { page, limit };
    if (status) params.status = status;
    const response = await axiosInstance.get('/riders/me/parcels', { params });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getAvailableParcels: async (options?: any) => {
    const { page = 1, limit = 10 } = options || {};
    console.log('📋 [RiderService] GET AVAILABLE PARCELS - Token required (protected endpoint)');
    const params = { page, limit };
    const response = await axiosInstance.get('/riders/me/available-parcels', { params });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  acceptParcel: async (shipmentId: string, reason?: string) => {
    console.log(`✅ [RiderService] ACCEPT PARCEL - Token required (protected endpoint), shipmentId: ${shipmentId}`);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [RiderService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.post(`/riders/me/parcels/${shipmentId}/accept`, { reason });
      console.log(`✅ [RiderService] Parcel accepted successfully`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [RiderService] Error accepting parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  rejectParcel: async (shipmentId: string, reason?: string) => {
    console.log(`❌ [RiderService] REJECT PARCEL - Token required (protected endpoint), shipmentId: ${shipmentId}, reason: ${reason || 'Not provided'}`);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [RiderService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.post(`/riders/me/parcels/${shipmentId}/reject`, { reason });
      console.log(`✅ [RiderService] Parcel rejected - remains available for other riders`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [RiderService] Error rejecting parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  getMyParcelDetails: async (shipmentId: string) => {
    console.log('📦 [RiderService] Fetching parcel details for:', shipmentId);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [RiderService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.get(`/riders/me/parcels/${shipmentId}`);
      console.log('✅ [RiderService] Parcel details fetched:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [RiderService] Error fetching parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updateMyParcelStatus: async (shipmentId: string, status: string, message?: string, location?: string) => {
    console.log('📊 [RiderService] UPDATE MY PARCEL STATUS - Token required (protected endpoint), shipmentId:', shipmentId, 'status:', status);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [RiderService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.put(`/riders/me/parcels/${shipmentId}/status`, {
        status,
        message,
        location,
      });
      console.log('✅ [RiderService] Parcel status updated successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [RiderService] Error updating parcel status:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updateMyLocation: async (latitude: number, longitude: number, address?: string) => {
    console.log('📍 [RiderService] UPDATE MY LOCATION - Token required (protected endpoint), lat:', latitude, 'lng:', longitude);
    const response = await axiosInstance.put('/riders/me/location', {
      latitude,
      longitude,
      address,
    });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  updateMyStatus: async (status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => {
    console.log('🟢 [RiderService] UPDATE MY STATUS - Token required (protected endpoint), status:', status);
    const response = await axiosInstance.put('/riders/me/status', { status });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint
  getMyStats: async () => {
    console.log('📈 [RiderService] GET MY STATS - Token required (protected endpoint)');
    const response = await axiosInstance.get('/riders/me/stats');
    return response.data;
  },
};

// Admin Service
export const adminService = {
  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  createUser: async (data: any) => {
    console.log('👥 [AdminService] CREATE USER - Token required (admin-only endpoint)');
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [AdminService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.post('/admin/users', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ [AdminService] User created successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminService] Error creating user:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getAllUsers: async (options: any = {}) => {
    const { page = 1, limit = 10, role, search } = options;
    console.log('📋 [AdminService] GET ALL USERS - Token required (admin-only endpoint)');
    const response = await axiosInstance.get('/admin/users', { 
      params: { page, limit, role, search } 
    });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  searchUsers: async (searchTerm: string, page = 1, limit = 10) => {
    console.log('🔎 [AdminService] SEARCH USERS - Token required (admin-only endpoint), search:', searchTerm);
    const response = await axiosInstance.get('/admin/users/search', { params: { search: searchTerm, page, limit } });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getUserById: async (id: string) => {
    console.log('🔍 [AdminService] GET USER BY ID - Token required (admin-only endpoint), id:', id);
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  updateUser: async (id: string, data: any) => {
    console.log('✏️ [AdminService] UPDATE USER - Token required (admin-only endpoint), id:', id);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [AdminService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.put(`/admin/users/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ [AdminService] User updated successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminService] Error updating user:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  deleteUser: async (id: string) => {
    console.log('🗑️ [AdminService] DELETE USER - Token required (admin-only endpoint), id:', id);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [AdminService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.delete(`/admin/users/${id}`);
      console.log('✅ [AdminService] User deleted successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminService] Error deleting user:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getUserStats: async () => {
    console.log('📈 [AdminService] GET USER STATS - Token required (admin-only endpoint)');
    const response = await axiosInstance.get('/admin/users/stats');
    return response.data;
  },

  // Analytics
  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getDashboardStats: async () => {
    console.log('📊 [AdminService] GET DASHBOARD STATS - Token required (admin-only endpoint)');
    const response = await axiosInstance.get('/admin/analytics/stats');
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getRevenueByDateRange: async (startDate: string, endDate: string) => {
    console.log('💰 [AdminService] GET REVENUE - Token required (admin-only endpoint), dateRange:', startDate, 'to', endDate);
    const response = await axiosInstance.get('/admin/analytics/revenue/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getRecentParcels: async () => {
    console.log('📦 [AdminService] GET RECENT PARCELS - Token required (admin-only endpoint)');
    const response = await axiosInstance.get('/admin/analytics/parcels/recent');
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getParcelsByStatus: async (status: string) => {
    console.log('📊 [AdminService] GET PARCELS BY STATUS - Token required (admin-only endpoint), status:', status);
    const response = await axiosInstance.get(`/admin/analytics/parcels/status/${status}`);
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getParcelsByDateRange: async (startDate: string, endDate: string) => {
    console.log('📅 [AdminService] GET PARCELS BY DATE RANGE - Token required (admin-only endpoint), dateRange:', startDate, 'to', endDate);
    const response = await axiosInstance.get('/admin/analytics/parcels/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Admin Parcels
  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getAllAdminParcels: async (page = 1, limit = 10, filters?: any) => {
    console.log('📋 [AdminService] GET ALL PARCELS - Token required (admin-only endpoint)');
    const response = await axiosInstance.get('/admin/parcels', { params: { page, limit, ...filters } });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getAdminParcelById: async (id: string) => {
    console.log('🔍 [AdminService] GET PARCEL BY ID - Token required (admin-only endpoint), id:', id);
    const response = await axiosInstance.get(`/admin/parcels/${id}`);
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  searchAdminParcels: async (searchTerm: string, page = 1, limit = 10) => {
    console.log('🔎 [AdminService] SEARCH PARCELS - Token required (admin-only endpoint), search:', searchTerm);
    const response = await axiosInstance.get('/admin/parcels/search', {
      params: { search: searchTerm, page, limit },
    });
    return response.data;
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only, can edit any parcel status)
  updateAdminParcel: async (id: string, data: any) => {
    console.log('✏️ [AdminService] UPDATE PARCEL - Token required (admin-only endpoint), id:', id);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [AdminService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.put(`/admin/parcels/${id}`, data);
      console.log('✅ [AdminService] Parcel updated successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminService] Error updating parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  updateAdminParcelStatus: async (id: string, status: string) => {
    console.log('📊 [AdminService] UPDATE PARCEL STATUS - Token required (admin-only endpoint), id:', id, 'status:', status);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [AdminService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.put(`/admin/parcels/${id}/status`, { status });
      console.log('✅ [AdminService] Parcel status updated successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminService] Error updating parcel status:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  addParcelEvent: async (id: string, event: any) => {
    console.log('📝 [AdminService] ADD PARCEL EVENT - Token required (admin-only endpoint), id:', id);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [AdminService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.post(`/admin/parcels/${id}/events`, event);
      console.log('✅ [AdminService] Parcel event added successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminService] Error adding parcel event:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  deleteAdminParcel: async (id: string) => {
    console.log('🗑️ [AdminService] DELETE PARCEL - Token required (admin-only endpoint), id:', id);
    
    // Verify token is present before making request
    const { token, user } = readAuthFromCookies();
    console.log(`🔐 [AdminService] Token status:`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20),
      userRole: user?.role,
    });
    
    try {
      const response = await axiosInstance.delete(`/admin/parcels/${id}`);
      console.log('✅ [AdminService] Parcel deleted successfully:', { status: response.status });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminService] Error deleting parcel:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        headerPresent: !!error.config?.headers?.Authorization,
      });
      throw error;
    }
  },

  // ✅ TOKEN NEEDED - Protected endpoint (admin only)
  getAdminParcelStats: async () => {
    console.log('📈 [AdminService] GET PARCEL STATS - Token required (admin-only endpoint)');
    const response = await axiosInstance.get('/admin/parcels/stats');
    return response.data;
  },
};
