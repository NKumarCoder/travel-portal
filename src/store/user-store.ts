import { create } from "zustand";
import type { User } from "@/types";
import userData from "@/data/user.json";

interface UserState {
  user: User | null;
  isLoading: boolean;

  loadUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

/**
 * User profile store.
 *
 * Authentication is now handled by useAuthStore (src/store/auth-store.ts).
 * This store manages user profile data only.
 */
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,

  loadUser: () => {
    set({ isLoading: true });
    // Load user profile data (will be replaced with API call later)
    set({
      user: userData as User,
      isLoading: false,
    });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  logout: () =>
    set({
      user: null,
    }),
}));
