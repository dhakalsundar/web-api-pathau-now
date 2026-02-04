import axios from "axios";
import { clearAuthCookies, readAuthFromCookies } from "../cookies";


const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BASE_URL = `${API_HOST}/api`; 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});


axiosInstance.interceptors.request.use((config) => {
  const { token } = readAuthFromCookies();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  

  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthCookies();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
