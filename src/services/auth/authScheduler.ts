import axios from "axios";
import { LOGIN_API_BASE_URL, TOKEN_KEY } from "@/lib/api";
import { storeToken, getTokenAgeMinutes, shouldRefreshToken, clearToken } from "./tokenManager";
import { useAuthStore } from "@/store/auth-store";

/**
 * Auth Scheduler
 *
 * Manages background token renewal with a periodic check.
 * Runs every 60 seconds and renews the token proactively
 * when it reaches 18 minutes of age (before the 20-min expiry).
 *
 * Features:
 * - Only one refresh at a time (mutex)
 * - Silent — no UI disruption
 * - Resets timer after each successful renewal
 * - Stops cleanly on logout
 */

/** Token lifetime config */
const TOKEN_LIFETIME_MINUTES = 20;
const REFRESH_THRESHOLD_MINUTES = 18;
const CHECK_INTERVAL_MS = 60_000; // Check every 60 seconds

/** Internal state */
let intervalId: ReturnType<typeof setInterval> | null = null;
let isRenewing = false;

/**
 * Start the background token renewal scheduler.
 * Should be called once after initial login succeeds.
 */
export function startTokenScheduler(): void {
  // Don't double-start
  if (intervalId !== null) return;

  if (process.env.NODE_ENV === "development") {
    console.log("[AuthScheduler] Started — checking every 60s, renewing at 18min");
  }

  intervalId = setInterval(checkAndRenew, CHECK_INTERVAL_MS);
}

/**
 * Stop the background scheduler.
 * Should be called on logout or unmount.
 */
export function stopTokenScheduler(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[AuthScheduler] Stopped");
  }
}

/**
 * Force an immediate token renewal (used by 401 interceptor fallback).
 * Returns the new token or throws.
 */
export async function forceTokenRenewal(): Promise<string> {
  return performRenewal();
}

// ─── Internal ────────────────────────────────────────────────────────────────────

async function checkAndRenew(): Promise<void> {
  if (isRenewing) return; // Already in progress

  if (!shouldRefreshToken(REFRESH_THRESHOLD_MINUTES)) {
    return; // Token is still fresh
  }

  if (process.env.NODE_ENV === "development") {
    const age = getTokenAgeMinutes().toFixed(1);
    console.log("========== TOKEN RENEWAL ==========");
    console.log(`Current Token Age: ${age} minutes`);
    console.log("Refreshing Access Token...");
  }

  try {
    await performRenewal();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[AuthScheduler] Background renewal failed:", error);
      console.log("==================================");
    }
  }
}

async function performRenewal(): Promise<string> {
  if (isRenewing) {
    // Wait for existing renewal to complete
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (!isRenewing) {
          clearInterval(check);
          const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
          if (token) resolve(token);
          else reject(new Error("Renewal completed but no token found"));
        }
      }, 100);
      // Timeout after 15s
      setTimeout(() => {
        clearInterval(check);
        reject(new Error("Token renewal timeout"));
      }, 15000);
    });
  }

  isRenewing = true;

  try {
    // Call login proxy directly (bypass apiClient to avoid interceptor loop)
    const { data } = await axios.post("/api/auth/login", {
      username: "avinash",
      password: "abhi",
      ipAddress: "",
      loginType: "Web",
    }, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    // New API returns: { isSuccess, message, data: { tokenId, user } }
    const newToken: string = data?.data?.tokenId;

    if (!data?.isSuccess || !newToken) {
      throw new Error(data?.message || "No tokenId in renewal response");
    }

    // Update storage (token + timestamp)
    storeToken(newToken);

    // Update Zustand auth store
    useAuthStore.getState().accessToken = newToken;

    if (process.env.NODE_ENV === "development") {
      console.log("Login Successful");
      console.log("New Token Stored");
      console.log("Authorization Header Updated");
      console.log(`Next Refresh Scheduled in ~${REFRESH_THRESHOLD_MINUTES} minutes`);
      console.log("==================================");
    }

    return newToken;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[AuthScheduler] Renewal failed:", error);
    }
    throw error;
  } finally {
    isRenewing = false;
  }
}
