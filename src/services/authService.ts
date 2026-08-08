import axios from "axios";
import { LOGIN_API_BASE_URL, TOKEN_KEY } from "@/lib/api";
import { storeToken, clearToken } from "@/services/auth/tokenManager";

/**
 * User profile returned by the Login API.
 */
export interface LoginApiUser {
  id: number;
  roleId: number;
  membershipId: number;
  username: string;
  email: string;
  isd: string;
  phone: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  membership: string;
  balance: number;
  creditBalance: number;
  title: string;
  address: string;
  city: string;
  state: string;
  country: string;
  companyName: string;
  pincode: string;
  registeredIP: string;
  isActive: boolean;
  createdOn: string;
  apiType: string;
}

/**
 * Response envelope returned by the new Login API.
 *
 * POST /api/v1.0/user/login
 */
export interface LoginResponse {
  isSuccess: boolean;
  message: string;
  data: {
    tokenId: string;
    user: LoginApiUser;
  };
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
 * Endpoint: POST {LOGIN_API_BASE_URL}/api/v1.0/user/login
 * Body: { username, password, ipAddress, loginType: "Web" }
 */
export async function login(): Promise<string> {
  const loginUrl = `${LOGIN_API_BASE_URL}/api/v1.0/user/login`;

  if (process.env.NODE_ENV === "development") {
    console.log("[Auth] Login request started");
    console.log("[Auth] URL:", loginUrl);
  }

  try {
    const { data: response } = await axios.post<LoginResponse>(
      loginUrl,
      {
        username: "avinash",
        password: "abhi",
        ipAddress: "",
        loginType: "Web",
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    // Validate response envelope
    if (!response.isSuccess || !response.data?.tokenId) {
      const reason = !response.isSuccess
        ? (response.message || "Login API returned isSuccess=false")
        : "Login API response missing tokenId";
      throw new Error(reason);
    }

    const token = response.data.tokenId;

    // Store token + record login timestamp for background renewal
    storeToken(token);

    if (process.env.NODE_ENV === "development") {
      console.log("[Auth] Login successful");
      console.log("[Auth] Authentication token received");

      // Attempt to decode JWT expiry for logging — never log the token itself
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
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

    return token;
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
