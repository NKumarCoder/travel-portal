import { TOKEN_KEY } from "@/lib/api";

/**
 * Token Manager
 *
 * Centralized token storage with login timestamp tracking.
 * Provides age calculation for proactive renewal.
 */

const LOGIN_TIMESTAMP_KEY = "bus_login_timestamp";

/**
 * Store a new token and record the login time.
 */
export function storeToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
}

/**
 * Get the current stored token.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove token and timestamp (logout/clear).
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
}

/**
 * Get the age of the current token in milliseconds.
 * Returns Infinity if no timestamp exists (forces refresh).
 */
export function getTokenAgeMs(): number {
  if (typeof window === "undefined") return Infinity;
  const ts = localStorage.getItem(LOGIN_TIMESTAMP_KEY);
  if (!ts) return Infinity;
  return Date.now() - parseInt(ts, 10);
}

/**
 * Get the age of the token in minutes.
 */
export function getTokenAgeMinutes(): number {
  return getTokenAgeMs() / (1000 * 60);
}

/**
 * Check if the token needs renewal.
 *
 * @param thresholdMinutes - Refresh when token is older than this (default 18 min)
 */
export function shouldRefreshToken(thresholdMinutes: number = 18): boolean {
  return getTokenAgeMinutes() >= thresholdMinutes;
}
