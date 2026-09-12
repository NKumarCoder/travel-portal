import axios from "axios";
import type { FlightLoginResponse } from "@/types";
import {
  storeFlightToken,
  getFlightToken,
  clearFlightToken,
  shouldRefreshFlightToken,
} from "@/services/auth/flightTokenManager";
import {
  startFlightTokenScheduler,
  stopFlightTokenScheduler,
} from "@/services/auth/flightAuthScheduler";

const FLIGHT_LOGIN_API_URL =
  process.env.NEXT_PUBLIC_FLIGHT_LOGIN_API_URL ||
  process.env.FLIGHT_LOGIN_API_URL ||
  "https://stagingflightsadmin.etravos.in";

const FLIGHT_API_USERNAME =
  process.env.NEXT_PUBLIC_FLIGHT_API_USERNAME ||
  process.env.FLIGHT_API_USERNAME ||
  "rajini";

const FLIGHT_API_PASSWORD =
  process.env.NEXT_PUBLIC_FLIGHT_API_PASSWORD ||
  process.env.FLIGHT_API_PASSWORD ||
  "rajini123";

/**
 * Builds the canonical staging flight login URL without double slashes.
 */
function getFlightLoginUrl(): string {
  const baseUrl = FLIGHT_LOGIN_API_URL.replace(/\/+$/, "");
  return `${baseUrl}/api/Users/Login`;
}

/**
 * In-flight promise mutex to deduplicate concurrent login requests.
 */
let flightAuthPromise: Promise<string> | null = null;

/**
 * Authenticate with the Flight Login API directly against the staging endpoint.
 * Stores the returned access token and timestamp in localStorage.
 *
 * Endpoint: POST https://stagingflightsadmin.etravos.in/api/Users/Login
 */
export async function flightLogin(): Promise<string> {
  const loginUrl = getFlightLoginUrl();

  const payload = {
    username: FLIGHT_API_USERNAME,
    password: FLIGHT_API_PASSWORD,
    ipAddress: "",
    loginType: "Web",
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[FLIGHT AUTH] LOGIN REQUEST START");
    console.log("[FLIGHT AUTH] Method: POST");
    console.log("[FLIGHT AUTH] URL:", loginUrl);
    console.log("[FLIGHT AUTH] Username:", FLIGHT_API_USERNAME);
    console.log("[FLIGHT AUTH] Password: [REDACTED]");
    console.log("[FLIGHT AUTH] Login Type: Web");
  }

  try {
    const { data: response, status, statusText } =
      await axios.post<FlightLoginResponse | { success: boolean; data?: FlightLoginResponse; message?: string }>(
        loginUrl,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        }
      );

    if (process.env.NODE_ENV === "development") {
      console.log("[FLIGHT AUTH] Response status:", status, statusText);
    }

    // Support both direct response { tokenId, userDetails } and wrapped envelope { success: true, data: { tokenId, userDetails } }
    const raw = response as Record<string, any>;
    const token = raw?.tokenId || raw?.data?.tokenId;
    const userDetails = raw?.userDetails || raw?.data?.userDetails;

    if (!token) {
      const reason =
        raw?.message ||
        (raw?.success === false
          ? "Flight Login API returned success=false"
          : "Flight login response did not contain tokenId");
      console.error("[FLIGHT AUTH] Login invalid:", reason, {
        status,
        response: raw,
      });
      throw new Error(reason);
    }

    // Cache token + timestamp
    storeFlightToken(token, userDetails);

    // Start background renewal scheduler
    startFlightTokenScheduler();

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[FLIGHT AUTH] Login successful. Token cached under flight_access_token"
      );
      console.log("[FLIGHT AUTH] User details available:", !!userDetails);
    }

    return token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const isCorsOrNetwork = !error.response && error.code !== "ECONNABORTED";
      console.error("[FLIGHT AUTH] LOGIN FAILED", {
        loginUrl,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        errorType: isCorsOrNetwork
          ? "Network Error / CORS Error"
          : error.code === "ECONNABORTED"
          ? "Timeout Error"
          : "HTTP Error",
      });
    } else if (error instanceof Error) {
      console.error("[FLIGHT AUTH] LOGIN FAILED", {
        loginUrl,
        message: error.message,
      });
    } else {
      console.error("[FLIGHT AUTH] LOGIN FAILED", error);
    }
    throw error;
  }
}

/**
 * Ensures valid authentication for Flight services.
 *
 * Reuses the existing cached token if valid and unexpired.
 * If token is missing or expired, triggers a single flightLogin() call.
 * Uses flightAuthPromise to deduplicate simultaneous requests.
 */
export async function ensureFlightAuthentication(): Promise<string> {
  const existingToken = getFlightToken();
  const isExpired = shouldRefreshFlightToken();

  if (existingToken && !isExpired) {
    if (process.env.NODE_ENV === "development") {
      console.log("[FLIGHT AUTH] Valid cached Flight token found — reusing token");
    }
    // Ensure scheduler is running if token is valid
    startFlightTokenScheduler();
    return existingToken;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[FLIGHT AUTH] Token state: ${
        !existingToken ? "missing" : "expired"
      } — initiating Flight login`
    );
  }

  if (flightAuthPromise) {
    if (process.env.NODE_ENV === "development") {
      console.log("[FLIGHT AUTH] Deduplicating login request using in-flight promise");
    }
    return flightAuthPromise;
  }

  flightAuthPromise = (async () => {
    try {
      const token = await flightLogin();
      return token;
    } finally {
      flightAuthPromise = null;
    }
  })();

  return flightAuthPromise;
}

/**
 * Get the currently stored Flight access token (or null).
 */
export function getFlightAccessToken(): string | null {
  return getFlightToken();
}

/**
 * Check whether a valid Flight token exists.
 */
export function isFlightAuthenticated(): boolean {
  return !!getFlightToken() && !shouldRefreshFlightToken();
}

/**
 * Clear stored Flight credentials and stop the Flight scheduler.
 */
export function flightLogout(): void {
  stopFlightTokenScheduler();
  clearFlightToken();
  flightAuthPromise = null;

  if (process.env.NODE_ENV === "development") {
    console.log("[FLIGHT AUTH] Logged out — Flight token cleared");
  }
}
