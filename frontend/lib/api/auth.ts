import axiosInstance from './axios';
import { API } from './endpoints';

export const register = async (registrationData: any) => {
  try {
    const response = await axiosInstance.post(API.REGISTER, registrationData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Registration failed');
  }
};

export const login = async (loginData: any) => {
    try {
    const response = await axiosInstance.post(API.LOGIN, loginData);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message 
        || error.message || 'Login failed');
  }
}