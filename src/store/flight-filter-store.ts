import { create } from "zustand";

export type FlightSortOption =
  | "recommended"
  | "cheapest"
  | "fastest"
  | "earliest"
  | "latest";

export interface FlightFilterState {
  stops: number[]; // e.g. [0, 1, 2]
  airlines: string[];
  departureTimes: string[]; // e.g. ["early_morning", "morning", "afternoon", "evening"]
  cabinClasses: string[];
  refundableOnly: boolean;
  checkinBaggageOnly: boolean;
  priceRange: [number, number];
  sortBy: FlightSortOption;

  toggleStop: (stop: number) => void;
  toggleAirline: (airline: string) => void;
  toggleDepartureTime: (timeSlot: string) => void;
  toggleCabinClass: (cabinClass: string) => void;
  setRefundableOnly: (val: boolean) => void;
  setCheckinBaggageOnly: (val: boolean) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sortBy: FlightSortOption) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialFilterState = {
  stops: [],
  airlines: [],
  departureTimes: [],
  cabinClasses: [],
  refundableOnly: false,
  checkinBaggageOnly: false,
  priceRange: [0, 2500] as [number, number],
  sortBy: "recommended" as FlightSortOption,
};

export const useFlightFilterStore = create<FlightFilterState>((set, get) => ({
  ...initialFilterState,

  toggleStop: (stop) =>
    set((state) => ({
      stops: state.stops.includes(stop)
        ? state.stops.filter((s) => s !== stop)
        : [...state.stops, stop],
    })),

  toggleAirline: (airline) =>
    set((state) => ({
      airlines: state.airlines.includes(airline)
        ? state.airlines.filter((a) => a !== airline)
        : [...state.airlines, airline],
    })),

  toggleDepartureTime: (timeSlot) =>
    set((state) => ({
      departureTimes: state.departureTimes.includes(timeSlot)
        ? state.departureTimes.filter((t) => t !== timeSlot)
        : [...state.departureTimes, timeSlot],
    })),

  toggleCabinClass: (cabinClass) =>
    set((state) => ({
      cabinClasses: state.cabinClasses.includes(cabinClass)
        ? state.cabinClasses.filter((c) => c !== cabinClass)
        : [...state.cabinClasses, cabinClass],
    })),

  setRefundableOnly: (refundableOnly) => set({ refundableOnly }),

  setCheckinBaggageOnly: (checkinBaggageOnly) => set({ checkinBaggageOnly }),

  setPriceRange: (priceRange) => set({ priceRange }),

  setSortBy: (sortBy) => set({ sortBy }),

  resetFilters: () =>
    set({
      stops: [],
      airlines: [],
      departureTimes: [],
      cabinClasses: [],
      refundableOnly: false,
      checkinBaggageOnly: false,
      priceRange: [0, 2500],
      sortBy: "recommended",
    }),

  hasActiveFilters: () => {
    const s = get();
    return (
      s.stops.length > 0 ||
      s.airlines.length > 0 ||
      s.departureTimes.length > 0 ||
      s.cabinClasses.length > 0 ||
      s.refundableOnly ||
      s.checkinBaggageOnly ||
      s.priceRange[0] > 0 ||
      s.priceRange[1] < 2500 ||
      s.sortBy !== "recommended"
    );
  },
}));
