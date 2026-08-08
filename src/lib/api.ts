import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storeToken } from "@/services/auth/tokenManager";

/**
 * API Base URLs — read from environment variables.
 * Set both variables in .env.local:
 *   NEXT_PUBLIC_API_BASE_URL       = http://46.62.206.214:1621  (all APIs except login)
 *   NEXT_PUBLIC_LOGIN_API_BASE_URL = http://46.62.206.214:1678  (login only)
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://46.62.206.214:1621";
const LOGIN_API_BASE_URL = process.env.NEXT_PUBLIC_LOGIN_API_BASE_URL || "http://46.62.206.214:1678";

const TOKEN_KEY = "bus_access_token";

/**
 * Axios instance configured for the Bus API.
 * - Attaches Bearer token from localStorage automatically.
 * - Handles 401 responses with silent re-login and request retry.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Request interceptor error:", error);
    }
    return Promise.reject(error);
  }
);

// ─── Response Interceptor (401 token refresh) ──────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ reject }) => reject(error));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Response ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Detailed error logging in development
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Request failed:", {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        message: error.message,
        code: error.code,
      });
    }

    // Only handle 401 and avoid infinite loops
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request while refresh is in progress
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Clear old token
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[Auth] Token expired — re-authenticating...");
      }

      // Re-login silently (use plain axios, not apiClient to avoid interceptor loop)
      // Login uses the dedicated LOGIN_API_BASE_URL (port 1678)
      const { data } = await axios.post(`${LOGIN_API_BASE_URL}/api/v1.0/user/login`, {
        username: "avinash",
        password: "abhi",
        ipAddress: "",
        loginType: "Web",
      });

      // New API returns: { isSuccess, message, data: { tokenId, user } }
      if (!data?.isSuccess || !data?.data?.tokenId) {
        throw new Error(data?.message || "Re-authentication failed: token not received");
      }

      const newToken: string = data.data.tokenId;

      // Store with timestamp reset
      storeToken(newToken);

      if (process.env.NODE_ENV === "development") {
        console.log("[Auth] Token refreshed after 401");
      }

      // Retry queued requests
      failedQueue.forEach(({ resolve, config }) => {
        config.headers.Authorization = `Bearer ${newToken}`;
        resolve(apiClient(config));
      });
      failedQueue = [];

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
      }
      if (process.env.NODE_ENV === "development") {
        console.error("[Auth] Token refresh failed:", refreshError);
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { apiClient, API_BASE_URL, LOGIN_API_BASE_URL, TOKEN_KEY };
export default apiClient;
