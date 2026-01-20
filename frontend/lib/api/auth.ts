import axiosInstance from "./axios";
import { API } from "./endpoints";

function extractErrorMessage(error: any, fallback: string) {
  const msg = error?.response?.data?.message;
  if (msg) return msg;

  const issues = error?.response?.data?.errors;
  if (Array.isArray(issues) && issues.length > 0) {
    return issues[0]?.message || fallback;
  }

  return error?.message || fallback;
}

export const register = async (registrationData: any) => {
  try {
    const response = await axiosInstance.post(API.REGISTER, registrationData);
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, "Registration failed"));
  }
};

export const login = async (loginData: any) => {
  try {
    const response = await axiosInstance.post(API.LOGIN, loginData);
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, "Login failed"));
  }
};
