import {
  shouldRefreshFlightToken,
  getFlightTokenAgeMinutes,
} from "./flightTokenManager";
import { flightLogin } from "@/services/flightAuthService";

/**
 * Flight Auth Scheduler
 *
 * Manages background Flight token renewal with a periodic 60-second check.
 * Renews the token proactively when it reaches 18 minutes of age (before the 20-min expiry).
 * Completely isolated from the Bus auth scheduler.
 */

const REFRESH_THRESHOLD_MINUTES = 18;
const CHECK_INTERVAL_MS = 60_000; // Check every 60 seconds

let intervalId: ReturnType<typeof setInterval> | null = null;
let isRenewing = false;

/**
 * Start the background Flight token renewal scheduler.
 * Called after flight login succeeds.
 */
export function startFlightTokenScheduler(): void {
  if (typeof window === "undefined") return;
  if (intervalId !== null) return; // Don't duplicate intervals

  if (process.env.NODE_ENV === "development") {
    console.log("[FlightAuthScheduler] Started — checking every 60s, renewing at 18min");
  }

  intervalId = setInterval(checkAndRenew, CHECK_INTERVAL_MS);
}

/**
 * Stop the background Flight scheduler.
 */
export function stopFlightTokenScheduler(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[FlightAuthScheduler] Stopped");
  }
}

/**
 * Force an immediate token renewal.
 */
export async function forceFlightTokenRenewal(): Promise<string> {
  return performRenewal();
}

async function checkAndRenew(): Promise<void> {
  if (isRenewing) return;

  if (!shouldRefreshFlightToken(REFRESH_THRESHOLD_MINUTES)) {
    return; // Token is still fresh
  }

  if (process.env.NODE_ENV === "development") {
    const age = getFlightTokenAgeMinutes().toFixed(1);
    console.log(`[FlightAuthScheduler] Token age: ${age} mins. Proactively renewing...`);
  }

  try {
    await performRenewal();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[FlightAuthScheduler] Proactive renewal failed:", error);
    }
  }
}

async function performRenewal(): Promise<string> {
  if (isRenewing) {
    // Wait for ongoing renewal
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (!isRenewing) {
          clearInterval(check);
          import("./flightTokenManager").then(({ getFlightToken }) => {
            const token = getFlightToken();
            if (token) resolve(token);
            else reject(new Error("Flight renewal finished but no token found"));
          });
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error("Flight token renewal timeout"));
      }, 15000);
    });
  }

  isRenewing = true;
  try {
    const newToken = await flightLogin();
    if (process.env.NODE_ENV === "development") {
      console.log("[FlightAuthScheduler] Proactive renewal successful. New token cached.");
    }
    return newToken;
  } finally {
    isRenewing = false;
  }
}
