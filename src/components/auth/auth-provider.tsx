"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { startTokenScheduler, stopTokenScheduler } from "@/services/auth";

/**
 * AuthProvider — handles silent authentication on app startup
 * and starts the background token renewal scheduler.
 *
 * Renders a loading spinner while authenticating, an error banner on failure,
 * or children when authenticated.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { authenticated } = useAuthStore();

  // Start/stop token scheduler based on auth state
  useEffect(() => {
    if (authenticated) {
      startTokenScheduler();
    } else {
      stopTokenScheduler();
    }

    return () => {
      stopTokenScheduler();
    };
  }, [authenticated]);

  // Register service worker (production only)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
    }

    // In development, unregister existing service workers to avoid caching issues
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "development"
    ) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister());
      });
    }
  }, []);

  return <>{children}</>;
}
