import type { FlightUserDetails } from "@/types";

/**
 * Flight Token Manager
 *
 * Centralized token and session storage for the Flight module.
 * Completely isolated from the Bus token keys.
 */

export const FLIGHT_TOKEN_KEY = "flight_access_token";
export const FLIGHT_LOGIN_TIMESTAMP_KEY = "flight_login_timestamp";
export const FLIGHT_USER_DETAILS_KEY = "flight_user_details";

/**
 * Store a new Flight token, optional user details, and record the login timestamp.
 */
export function storeFlightToken(
  token: string,
  userDetails?: FlightUserDetails
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FLIGHT_TOKEN_KEY, token);
  localStorage.setItem(FLIGHT_LOGIN_TIMESTAMP_KEY, Date.now().toString());

  if (userDetails) {
    try {
      localStorage.setItem(
        FLIGHT_USER_DETAILS_KEY,
        JSON.stringify(userDetails)
      );
    } catch {
      // Ignore JSON stringify errors
    }
  }
}

/**
 * Get the currently stored Flight token.
 */
export function getFlightToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FLIGHT_TOKEN_KEY);
}

/**
 * Get stored Flight user details.
 */
export function getFlightUserDetails(): FlightUserDetails | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(FLIGHT_USER_DETAILS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FlightUserDetails;
  } catch {
    return null;
  }
}

/**
 * Remove Flight token, timestamp, and user details (logout/reset).
 */
export function clearFlightToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FLIGHT_TOKEN_KEY);
  localStorage.removeItem(FLIGHT_LOGIN_TIMESTAMP_KEY);
  localStorage.removeItem(FLIGHT_USER_DETAILS_KEY);
}

/**
 * Get the age of the Flight token in milliseconds.
 * Returns Infinity if no timestamp exists (forcing re-auth).
 */
export function getFlightTokenAgeMs(): number {
  if (typeof window === "undefined") return Infinity;
  const ts = localStorage.getItem(FLIGHT_LOGIN_TIMESTAMP_KEY);
  if (!ts) return Infinity;
  const parsed = parseInt(ts, 10);
  if (isNaN(parsed)) return Infinity;
  return Date.now() - parsed;
}

/**
 * Get the age of the Flight token in minutes.
 */
export function getFlightTokenAgeMinutes(): number {
  return getFlightTokenAgeMs() / (1000 * 60);
}

/**
 * Check if the Flight token needs renewal.
 *
 * @param thresholdMinutes - Refresh when token is older than this (default 18 min for ~20 min expiry)
 */
export function shouldRefreshFlightToken(
  thresholdMinutes: number = 18
): boolean {
  return getFlightTokenAgeMinutes() >= thresholdMinutes;
}
