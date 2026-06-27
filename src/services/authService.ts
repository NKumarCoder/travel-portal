import axios from "axios";
import { API_BASE_URL, TOKEN_KEY } from "@/lib/api";
import { storeToken, clearToken } from "@/services/auth/tokenManager";

export interface LoginResponse {
  traceId: string;
  accessToken: string;
}

/**
 * Authentication Service
 *
 * Handles login, logout, token storage, and auth state checks
 * for the Bus API.
 */

/**
 * Authenticate with the Bus Login API.
 * Stores the returned access token in localStorage.
 *
 * Endpoint: POST {API_BASE_URL}/api/bus/login
 * Body: { username: "avinash", password: "abhi" }
 */
export async function login(): Promise<string> {
  const loginUrl = `${API_BASE_URL}/api/bus/login`;

  if (process.env.NODE_ENV === "development") {
    console.log("[Auth] Login request started");
    console.log("[Auth] URL:", loginUrl);
  }

  try {
    const { data } = await axios.post<LoginResponse>(
      loginUrl,
      {
        username: "avinash",
        password: "abhi",
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    const { accessToken } = data;

    // Store token + record login timestamp for background renewal
    storeToken(accessToken);

    if (process.env.NODE_ENV === "development") {
      console.log("[Auth] Login successful");
      console.log("[Auth] Token stored in localStorage");

      // Attempt to decode JWT expiry for logging
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        if (payload.exp) {
          console.log(
            "[Auth] Token expiry:",
            new Date(payload.exp * 1000).toISOString()
          );
        }
      } catch {
        // Token may not be a standard JWT — skip expiry log
      }
    }

    return accessToken;
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Auth] Login failed");
      console.error("[Auth] Request URL:", loginUrl);

      if (axios.isAxiosError(error)) {
        console.error("[Auth] Status Code:", error.response?.status);
        console.error("[Auth] Response Body:", error.response?.data);
        console.error("[Auth] Axios Message:", error.message);
        console.error("[Auth] Error Code:", error.code);

        if (error.code === "ECONNABORTED") {
          console.error("[Auth] Timeout — server did not respond in time");
        }
        if (error.code === "ERR_NETWORK") {
          console.error("[Auth] Network Error — server may be unreachable");
        }
      } else {
        console.error("[Auth] Error:", error);
      }
    }
    throw error;
  }
}

/**
 * Clear stored credentials and log out.
 */
export function logout(): void {
  clearToken();

  if (process.env.NODE_ENV === "development") {
    console.log("[Auth] Logged out — token cleared");
  }
}

/**
 * Get the currently stored access token (or null if not authenticated).
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Check whether a stored access token exists.
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
