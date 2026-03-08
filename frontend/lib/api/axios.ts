import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAuthCookies, readAuthFromCookies, updateAccessToken } from "../cookies";
import { notificationToast } from "../toast";

/**
 * API Configuration
 * 
 * NEXT_PUBLIC_API_URL is set via environment variables:
 * - Local: http://localhost:5000 (from .env.local)
 * - Staging: https://staging-api.example.com
 * - Production: https://api.example.com
 * 
 * The /api path is automatically appended by axios baseURL
 */
const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Ensure API_HOST is trimmed and doesn't end with /api (to avoid double /api)
const cleanedAPIHost = API_HOST.replace(/\/api\/?$/, "").trim();
const BASE_URL = `${cleanedAPIHost}/api`;

if (process.env.NODE_ENV === "development") {
  console.debug(" API Base URL:", BASE_URL);
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Track if we're already refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailed: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor: Attach access token to all requests
 */
axiosInstance.interceptors.request.use((config) => {
  const { token } = readAuthFromCookies();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log(` [AXIOS] Token attached to ${config.method?.toUpperCase()} ${config.url} (${token.length} bytes, starts: ${token.substring(0, 20)}...)`);
  } else {
    // Warn if no token found for protected endpoints
    if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
      console.warn(` [AXIOS] No token found for ${config.method?.toUpperCase()} ${config.url} - Request will fail if endpoint requires auth`);
    } else {
      console.log(` [AXIOS] No token needed for auth endpoint: ${config.method?.toUpperCase()} ${config.url}`);
    }
  }

  return config;
});

/**
 * Response Interceptor: Handle 401 errors and show success/error toasts
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Show success toast for successful responses (status 200-299)
    // Only show for POST, PUT, DELETE, PATCH requests (mutations)
    const method = response.config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const successMessage =
        response.data?.message || `Action completed successfully`;
      notificationToast.success(successMessage);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Show error toast for failed responses
    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      "An error occurred";
    
    // Only show error toast if not a 401 (handled separately below)
    if (error.response?.status !== 401) {
      notificationToast.error(errorMessage);
    }

    // Handle 401 Unauthorized - clear auth and redirect to login
    if (error.response?.status === 401) {
      console.log(' [AXIOS] 401 Unauthorized received - Session expired');
      clearAuthCookies();
      console.log(' [AXIOS] Auth cookies cleared after 401. Redirecting to login...');
      notificationToast.error("Session expired. Please login again.");
      redirectToLogin();
      return Promise.reject(error);
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

/**
 * Redirect to login page
 */
function redirectToLogin() {
  // Use window.location for client-side navigation
  if (typeof window !== "undefined") {
    // Store the return URL to redirect back after login
    const returnUrl = window.location.pathname + window.location.search;
    if (returnUrl !== "/login" && returnUrl !== "/login/admin") {
      sessionStorage.setItem("returnUrl", returnUrl);
    }
    const loginUrl = returnUrl.startsWith("/admin") ? "/login/admin" : "/login";
    window.location.href = loginUrl;
  }
}

export default axiosInstance;
