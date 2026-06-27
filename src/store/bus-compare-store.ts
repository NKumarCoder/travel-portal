import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BusCompareState {
  compareIds: string[];
  favorites: string[];
  isCompareDrawerOpen: boolean;

  toggleCompare: (busId: string) => void;
  removeFromCompare: (busId: string) => void;
  clearCompare: () => void;
  setCompareDrawerOpen: (open: boolean) => void;

  toggleFavorite: (busId: string) => void;
  isFavorite: (busId: string) => boolean;
}

export const useBusCompareStore = create<BusCompareState>()(
  persist(
    (set, get) => ({
      compareIds: [],
      favorites: [],
      isCompareDrawerOpen: false,

      toggleCompare: (busId) =>
        set((state) => {
          if (state.compareIds.includes(busId)) {
            return { compareIds: state.compareIds.filter((id) => id !== busId) };
          }
          if (state.compareIds.length >= 3) return state;
          return { compareIds: [...state.compareIds, busId] };
        }),

      removeFromCompare: (busId) =>
        set((state) => ({
          compareIds: state.compareIds.filter((id) => id !== busId),
        })),

      clearCompare: () => set({ compareIds: [], isCompareDrawerOpen: false }),

      setCompareDrawerOpen: (open) => set({ isCompareDrawerOpen: open }),

      toggleFavorite: (busId) =>
        set((state) => {
          if (state.favorites.includes(busId)) {
            return { favorites: state.favorites.filter((id) => id !== busId) };
          }
          return { favorites: [...state.favorites, busId] };
        }),

      isFavorite: (busId) => get().favorites.includes(busId),
    }),
    {
      name: "bus-compare-store",
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
