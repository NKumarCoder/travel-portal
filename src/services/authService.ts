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
  const loginUrl = "/api/auth/login";

  console.log("[API DEBUG] Login endpoint: /api/auth/login");
  console.log("[API DEBUG] FINAL LOGIN URL (Relative Proxy):", loginUrl);

  console.log("[AUTH DEBUG] LOGIN REQUEST START");
  console.log("[AUTH DEBUG] Method: POST");
  console.log("[AUTH DEBUG] URL:", loginUrl);
  console.log("[AUTH DEBUG] Username: avinash");
  console.log("[AUTH DEBUG] Password: [REDACTED]");
  console.log("[AUTH DEBUG] IP Address: ");
  console.log("[AUTH DEBUG] Login Type: Web");

  try {
    const { data: response, status, statusText } = await axios.post<LoginResponse>(
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

    console.log("[AUTH DEBUG] LOGIN RESPONSE RECEIVED");
    console.log("[AUTH DEBUG] Status:", status);
    console.log("[AUTH DEBUG] Status Text:", statusText);
    console.log("[AUTH DEBUG] Response URL:", loginUrl);

    // Validate response envelope
    if (!response.isSuccess || !response.data?.tokenId) {
      const reason = !response.isSuccess
        ? (response.message || "Login API returned isSuccess=false")
        : "Login API response missing tokenId";
      console.error("[AUTH DEBUG] Login envelope invalid:", reason);
      throw new Error(reason);
    }

    const token = response.data.tokenId;

    console.log("[AUTH DEBUG] Login successful");
    console.log("[AUTH DEBUG] tokenId available: true");
    console.log("[AUTH DEBUG] user available:", !!response.data?.user);

    // Store token + record login timestamp for background renewal
    storeToken(token);
    console.log("[AUTH DEBUG] Token stored successfully");
    console.log("[AUTH DEBUG] Authentication state updated");

    return token;
  } catch (error: unknown) {
    console.error("[AUTH DEBUG] LOGIN FAILED");

    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      console.error("[AUTH DEBUG] Status:", statusCode || "UNKNOWN");
      console.error("[AUTH DEBUG] URL:", loginUrl);
      console.error("[AUTH DEBUG] Error:", error.message);

      if (statusCode === 404) {
        console.error(
          "[AUTH DEBUG] LOGIN API 404 — CHECK ROUTE / ENVIRONMENT CONFIGURATION"
        );
        console.error("[AUTH DEBUG] Actual Response URL:", error.config?.url);
        console.error("[AUTH DEBUG] Configured Login URL:", loginUrl);
      }
    } else {
      console.error("[AUTH DEBUG] Error:", error);
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

let busAuthPromise: Promise<string> | null = null;

/**
 * Ensures valid authentication for Bus services.
 * Checks if a valid token already exists. If not, performs login on-demand.
 * Prevents concurrent duplicate login requests.
 */
export async function ensureBusAuthentication(): Promise<string> {
  console.log("[AUTH DEBUG] Checking existing authentication state");
  const existingToken = getAccessToken();
  const tokenExists = !!existingToken;
  console.log("[AUTH DEBUG] Token exists:", tokenExists);

  if (existingToken) {
    console.log("[AUTH DEBUG] Token valid: true");
    return existingToken;
  }

  console.log("[AUTH DEBUG] Token valid: false — initiating login");

  if (busAuthPromise) {
    return busAuthPromise;
  }

  busAuthPromise = (async () => {
    try {
      const token = await login();
      return token;
    } finally {
      busAuthPromise = null;
    }
  })();

  return busAuthPromise;
}

