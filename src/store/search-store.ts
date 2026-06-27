import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PassengerCount } from "@/types";
import type { City } from "@/services/cityService";

interface SearchState {
  searchType: "flight" | "hotel" | "bus" | "activity" | "package";
  from: string;
  to: string;
  fromCity: City | null;
  toCity: City | null;
  destination: string;
  departDate: string;
  returnDate: string;
  passengers: PassengerCount;
  travelClass: string;
  isSearching: boolean;
  hasSearched: boolean;

  setSearchType: (type: SearchState["searchType"]) => void;
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  setFromCity: (city: City | null) => void;
  setToCity: (city: City | null) => void;
  setDestination: (destination: string) => void;
  setDepartDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setPassengers: (passengers: PassengerCount) => void;
  setTravelClass: (travelClass: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;
  resetSearch: () => void;
  swapFromTo: () => void;
}

const initialState = {
  searchType: "flight" as const,
  from: "",
  to: "",
  fromCity: null as City | null,
  toCity: null as City | null,
  destination: "",
  departDate: "",
  returnDate: "",
  passengers: { adults: 1, children: 0, infants: 0 },
  travelClass: "economy",
  isSearching: false,
  hasSearched: false,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchType: (searchType) => set({ searchType }),
      setFrom: (from) => set({ from }),
      setTo: (to) => set({ to }),
      setFromCity: (city) =>
        set({ fromCity: city, from: city?.name || "" }),
      setToCity: (city) =>
        set({ toCity: city, to: city?.name || "" }),
      setDestination: (destination) => set({ destination }),
      setDepartDate: (departDate) => set({ departDate }),
      setReturnDate: (returnDate) => set({ returnDate }),
      setPassengers: (passengers) => set({ passengers }),
      setTravelClass: (travelClass) => set({ travelClass }),
      setIsSearching: (isSearching) => set({ isSearching }),
      setHasSearched: (hasSearched) => set({ hasSearched }),
      resetSearch: () => set(initialState),
      swapFromTo: () =>
        set((state) => ({
          from: state.to,
          to: state.from,
          fromCity: state.toCity,
          toCity: state.fromCity,
        })),
    }),
    {
      name: "travel-search-store",
      partialize: (state) => ({
        searchType: state.searchType,
        from: state.from,
        to: state.to,
        fromCity: state.fromCity,
        toCity: state.toCity,
        destination: state.destination,
        departDate: state.departDate,
        returnDate: state.returnDate,
        passengers: state.passengers,
        travelClass: state.travelClass,
        hasSearched: state.hasSearched,
      }),
    }
  )
);
