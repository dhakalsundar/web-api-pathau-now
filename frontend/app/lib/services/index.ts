import axiosInstance from '../api/axios';
import { API } from '../api/endpoints';
import { setAuthCookies } from '@/lib/cookies';

export const adminService = {
  async getAllUsers(params: any) {
    return axiosInstance.get('/admin/users', { params });
  },
  async deleteUser(userId: string) {
    return axiosInstance.delete(`/admin/users/${userId}`);
  },
  // Add more admin-related API calls as needed
};

export const authService = {
  async login(email: string, password: string) {
    const response = await axiosInstance.post(API.LOGIN, { email, password });
    // Save token and user to cookies if needed
    const { accessToken, user } = response.data?.data?.tokens ? {
      accessToken: response.data.data.tokens.accessToken,
      user: response.data.data.user,
    } : { accessToken: null, user: null };
    if (accessToken && user) {
      setAuthCookies(accessToken, user);
    }
    return response.data.data;
  },
  // Add more auth-related API calls as needed
};
