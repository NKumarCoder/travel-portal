import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BusTypeFilter = "all" | "ac" | "non_ac" | "sleeper" | "semi_sleeper" | "seater";
export type DepartureTimeFilter = "all" | "early_morning" | "morning" | "afternoon" | "evening" | "night";
export type ArrivalTimeFilter = "all" | "early_morning" | "morning" | "afternoon" | "evening" | "night";

interface BusFilterState {
  busType: BusTypeFilter[];
  departureTime: DepartureTimeFilter[];
  arrivalTime: ArrivalTimeFilter[];
  priceRange: [number, number];
  minRating: number;
  sortBy: "price_low" | "price_high" | "duration" | "rating" | "departure" | "departure_late";

  toggleBusType: (type: BusTypeFilter) => void;
  toggleDepartureTime: (time: DepartureTimeFilter) => void;
  toggleArrivalTime: (time: ArrivalTimeFilter) => void;
  setPriceRange: (range: [number, number]) => void;
  setMinRating: (rating: number) => void;
  setSortBy: (sort: BusFilterState["sortBy"]) => void;
  resetFilters: () => void;
}

const initialFilters = {
  busType: [] as BusTypeFilter[],
  departureTime: [] as DepartureTimeFilter[],
  arrivalTime: [] as ArrivalTimeFilter[],
  priceRange: [0, 5000] as [number, number],
  minRating: 0,
  sortBy: "price_low" as const,
};

export const useBusFilterStore = create<BusFilterState>()(
  persist(
    (set) => ({
      ...initialFilters,

      toggleBusType: (type) =>
        set((state) => ({
          busType: state.busType.includes(type)
            ? state.busType.filter((t) => t !== type)
            : [...state.busType, type],
        })),

      toggleDepartureTime: (time) =>
        set((state) => ({
          departureTime: state.departureTime.includes(time)
            ? state.departureTime.filter((t) => t !== time)
            : [...state.departureTime, time],
        })),

      toggleArrivalTime: (time) =>
        set((state) => ({
          arrivalTime: state.arrivalTime.includes(time)
            ? state.arrivalTime.filter((t) => t !== time)
            : [...state.arrivalTime, time],
        })),

      setPriceRange: (priceRange) => set({ priceRange }),
      setMinRating: (minRating) => set({ minRating }),
      setSortBy: (sortBy) => set({ sortBy }),
      resetFilters: () => set(initialFilters),
    }),
    {
      name: "bus-filter-store",
    }
  )
);

// Helper to categorize time into time slots
export function getTimeSlot(time: string): DepartureTimeFilter {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour >= 0 && hour < 6) return "early_morning";
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
