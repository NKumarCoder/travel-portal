import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PassengerCount, Airport, NormalizedFlightResult } from "@/types";
import type { City } from "@/services/cityService";

interface SearchState {
  searchType: "flight" | "hotel" | "bus" | "activity" | "package";
  tripType: "oneWay" | "roundTrip";
  from: string;
  to: string;
  fromCity: City | null;
  toCity: City | null;
  fromAirport: Airport | null;
  toAirport: Airport | null;
  destination: string;
  departDate: string;
  returnDate: string;
  passengers: PassengerCount;
  travelClass: string;
  isSearching: boolean;
  hasSearched: boolean;

  // Flight search results & selection
  onwardFlightResults: NormalizedFlightResult[];
  returnFlightResults: NormalizedFlightResult[];
  flightTraceId: string | null;
  selectedOnwardFlight: NormalizedFlightResult | null;
  selectedReturnFlight: NormalizedFlightResult | null;
  flightSearchError: string | null;

  setSearchType: (type: SearchState["searchType"]) => void;
  setTripType: (tripType: "oneWay" | "roundTrip") => void;
  setFrom: (from: string) => void;
  setTo: (to: string) => void;
  setFromCity: (city: City | null) => void;
  setToCity: (city: City | null) => void;
  setFromAirport: (airport: Airport | null) => void;
  setToAirport: (airport: Airport | null) => void;
  setDestination: (destination: string) => void;
  setDepartDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setPassengers: (passengers: PassengerCount) => void;
  setTravelClass: (travelClass: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setHasSearched: (hasSearched: boolean) => void;

  setOnwardFlightResults: (results: NormalizedFlightResult[]) => void;
  setReturnFlightResults: (results: NormalizedFlightResult[]) => void;
  setFlightTraceId: (traceId: string | null) => void;
  setSelectedOnwardFlight: (flight: NormalizedFlightResult | null) => void;
  setSelectedReturnFlight: (flight: NormalizedFlightResult | null) => void;
  setFlightSearchError: (error: string | null) => void;
  clearFlightResults: () => void;

  resetSearch: () => void;
  swapFromTo: () => void;
}

const initialState = {
  searchType: "flight" as const,
  tripType: "oneWay" as const,
  from: "",
  to: "",
  fromCity: null as City | null,
  toCity: null as City | null,
  fromAirport: null as Airport | null,
  toAirport: null as Airport | null,
  destination: "",
  departDate: "",
  returnDate: "",
  passengers: { adults: 1, children: 0, infants: 0 },
  travelClass: "economy",
  isSearching: false,
  hasSearched: false,
  onwardFlightResults: [] as NormalizedFlightResult[],
  returnFlightResults: [] as NormalizedFlightResult[],
  flightTraceId: null as string | null,
  selectedOnwardFlight: null as NormalizedFlightResult | null,
  selectedReturnFlight: null as NormalizedFlightResult | null,
  flightSearchError: null as string | null,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchType: (searchType) => set({ searchType }),
      setTripType: (tripType) => set({ tripType }),
      setFrom: (from) => set({ from }),
      setTo: (to) => set({ to }),
      setFromCity: (city) =>
        set({ fromCity: city, from: city?.name || "" }),
      setToCity: (city) =>
        set({ toCity: city, to: city?.name || "" }),
      setFromAirport: (airport) =>
        set({
          fromAirport: airport,
          from: airport
            ? airport.showCity || `${airport.city} (${airport.airportCode})`
            : "",
        }),
      setToAirport: (airport) =>
        set({
          toAirport: airport,
          to: airport
            ? airport.showCity || `${airport.city} (${airport.airportCode})`
            : "",
        }),
      setDestination: (destination) => set({ destination }),
      setDepartDate: (departDate) => set({ departDate }),
      setReturnDate: (returnDate) => set({ returnDate }),
      setPassengers: (passengers) => set({ passengers }),
      setTravelClass: (travelClass) => set({ travelClass }),
      setIsSearching: (isSearching) => set({ isSearching }),
      setHasSearched: (hasSearched) => set({ hasSearched }),

      setOnwardFlightResults: (onwardFlightResults) => set({ onwardFlightResults }),
      setReturnFlightResults: (returnFlightResults) => set({ returnFlightResults }),
      setFlightTraceId: (flightTraceId) => set({ flightTraceId }),
      setSelectedOnwardFlight: (selectedOnwardFlight) => set({ selectedOnwardFlight }),
      setSelectedReturnFlight: (selectedReturnFlight) => set({ selectedReturnFlight }),
      setFlightSearchError: (flightSearchError) => set({ flightSearchError }),
      clearFlightResults: () =>
        set({
          onwardFlightResults: [],
          returnFlightResults: [],
          flightTraceId: null,
          selectedOnwardFlight: null,
          selectedReturnFlight: null,
          flightSearchError: null,
        }),

      resetSearch: () => set(initialState),
      swapFromTo: () =>
        set((state) => ({
          from: state.to,
          to: state.from,
          fromCity: state.toCity,
          toCity: state.fromCity,
          fromAirport: state.toAirport,
          toAirport: state.fromAirport,
        })),
    }),
    {
      name: "travel-search-store",
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          if (typeof window === "undefined") return null;
          try {
            return localStorage.getItem(name) || sessionStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.setItem(name, value);
          } catch {
            try {
              sessionStorage.setItem(name, value);
            } catch (e) {
              console.warn("[STORAGE] Quota exceeded on both localStorage and sessionStorage", e);
            }
          }
        },
        removeItem: (name: string) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
          } catch {
            // ignore
          }
        },
      })),
      partialize: (state) => ({
        searchType: state.searchType,
        tripType: state.tripType,
        from: state.from,
        to: state.to,
        fromCity: state.fromCity,
        toCity: state.toCity,
        fromAirport: state.fromAirport,
        toAirport: state.toAirport,
        destination: state.destination,
        departDate: state.departDate,
        returnDate: state.returnDate,
        passengers: state.passengers,
        travelClass: state.travelClass,
        hasSearched: state.hasSearched,
        onwardFlightResults: state.onwardFlightResults,
        returnFlightResults: state.returnFlightResults,
        flightTraceId: state.flightTraceId,
        selectedOnwardFlight: state.selectedOnwardFlight,
        selectedReturnFlight: state.selectedReturnFlight,
      }),
    }
  )
);
