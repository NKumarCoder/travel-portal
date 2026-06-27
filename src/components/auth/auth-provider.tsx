"use client";

import { useEffect, useRef } from "react";
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
  const { loading, authenticated, error, initialize, clearError } =
    useAuthStore();
  const initCalled = useRef(false);

  // Initialize auth on mount
  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
    initialize();
  }, [initialize]);

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

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Connecting...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-4 w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-3 text-2xl">&#9888;&#65039;</div>
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            Connection Error
          </h2>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <button
            onClick={() => {
              clearError();
              initCalled.current = false;
              initialize();
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
