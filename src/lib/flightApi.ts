import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getFlightToken, clearFlightToken } from "@/services/auth/flightTokenManager";
import { flightLogin } from "@/services/flightAuthService";

/**
 * Flight API Base URL — uses the relative Next.js proxy route:
 * /api/flights/backend -> https://stagingflightapi.etravos.in
 */
const FLIGHT_API_BASE_URL = "/api/flights/backend";

/**
 * Dedicated Axios instance configured for Flight APIs.
 * - Automatically injects Flight Bearer token from localStorage.
 * - Handles 401 Unauthorized responses with silent re-login and queued retry.
 * - Isolated completely from the Bus apiClient.
 */
const flightApiClient = axios.create({
  baseURL: FLIGHT_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
flightApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getFlightToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[FLIGHT API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[FLIGHT API] Request interceptor error:", error);
    }
    return Promise.reject(error);
  }
);

// ─── Response Interceptor (401 token refresh queue) ───────────────────────────
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

flightApiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[FLIGHT API] Response ${response.status} from ${response.config.url}`
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only handle 401 and prevent infinite retry loops
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue concurrent request while refresh is in progress
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[FLIGHT AUTH] Token expired (401) — performing silent re-authentication...");
      }

      // Re-login silently via proxy
      const newToken = await flightLogin();

      if (process.env.NODE_ENV === "development") {
        console.log("[FLIGHT AUTH] Token refreshed successfully after 401");
      }

      // Retry queued requests with the new token
      failedQueue.forEach(({ resolve, config }) => {
        config.headers.Authorization = `Bearer ${newToken}`;
        resolve(flightApiClient(config));
      });
      failedQueue = [];

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return flightApiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      clearFlightToken();
      if (process.env.NODE_ENV === "development") {
        console.error("[FLIGHT AUTH] Token refresh failed:", refreshError);
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { flightApiClient, FLIGHT_API_BASE_URL };
export default flightApiClient;
