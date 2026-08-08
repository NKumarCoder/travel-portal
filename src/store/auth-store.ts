import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  login as authLogin,
  logout as authLogout,
  getAccessToken,
  ensureBusAuthentication as authEnsureBusAuth,
} from "@/services/authService";
import { stopTokenScheduler } from "@/services/auth/authScheduler";

interface AuthState {
  /** Whether the initial login request is in-flight */
  loading: boolean;
  /** Whether the user is authenticated (token exists) */
  authenticated: boolean;
  /** Error message if login fails */
  error: string | null;
  /** The stored access token (persisted) */
  accessToken: string | null;

  /** Perform silent login — called on demand */
  initialize: () => Promise<void>;
  /** Ensure bus authentication on-demand */
  ensureBusAuthentication: () => Promise<string>;
  /** Force logout and clear state */
  logout: () => void;
  /** Reset error state */
  clearError: () => void;
}

// Track initialization to prevent duplicate calls during Fast Refresh
let initPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      loading: false,
      authenticated: false,
      error: null,
      accessToken: null,

      initialize: async () => {
        // Prevent multiple concurrent login attempts (Fast Refresh, StrictMode, etc.)
        if (initPromise) {
          return initPromise;
        }

        // If already authenticated with a valid token, skip login
        if (get().authenticated && getAccessToken()) {
          if (process.env.NODE_ENV === "development") {
            console.log("[Auth] Already authenticated — skipping login");
          }
          return;
        }

        // Check if a token already exists in localStorage
        const existingToken = getAccessToken();
        if (existingToken) {
          if (process.env.NODE_ENV === "development") {
            console.log("[Auth] Existing token found — using stored token");
          }
          set({ authenticated: true, accessToken: existingToken, loading: false });
          return;
        }

        // If already loading, don't start another request
        if (get().loading) {
          return;
        }

        set({ loading: true, error: null });

        initPromise = (async () => {
          try {
            const token = await authLogin();
            set({
              authenticated: true,
              accessToken: token,
              loading: false,
              error: null,
            });
          } catch (error: unknown) {
            let message = "Authentication failed. Please try again.";

            if (error instanceof Error) {
              if (error.message.includes("Network Error") || error.message.includes("ERR_NETWORK")) {
                message = "Network error — unable to reach the server.";
              } else if (error.message.includes("timeout") || error.message.includes("ECONNABORTED")) {
                message = "Request timed out. Server may be unavailable.";
              } else if (error.message.includes("401") || error.message.includes("403")) {
                message = "Invalid credentials.";
              } else if (error.message.includes("500")) {
                message = "Server error (500). Please try again later.";
              }
            }

            set({
              authenticated: false,
              accessToken: null,
              loading: false,
              error: message,
            });
          } finally {
            initPromise = null;
          }
        })();

        return initPromise;
      },

      ensureBusAuthentication: async () => {
        const existingToken = getAccessToken();
        if (existingToken) {
          set({ authenticated: true, accessToken: existingToken });
          return existingToken;
        }

        set({ loading: true, error: null });

        try {
          const token = await authEnsureBusAuth();
          set({
            authenticated: true,
            accessToken: token,
            loading: false,
            error: null,
          });
          return token;
        } catch (error: unknown) {
          let message = "Authentication failed. Please try again.";
          if (error instanceof Error) {
            message = error.message;
          }
          set({
            authenticated: false,
            accessToken: null,
            loading: false,
            error: message,
          });
          throw error;
        }
      },

      logout: () => {
        stopTokenScheduler();
        authLogout();
        initPromise = null;
        set({
          authenticated: false,
          accessToken: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "bus_auth_store",
      partialize: (state) => ({
        accessToken: state.accessToken,
        authenticated: state.authenticated,
      }),
    }
  )
);
