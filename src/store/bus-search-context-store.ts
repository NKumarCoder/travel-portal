import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bus } from "@/types";
import type { City } from "@/services/cityService";
import type { BusSearchPayload } from "@/services/payloadBuilders/busSearchPayload";

/**
 * Bus Search Context Store
 *
 * Persists everything needed to re-run a search and recover from
 * an expired TraceId without user intervention.
 */

interface BusSearchContextState {
  /** The traceId returned from the last successful search */
  traceId: string | null;
  /** The payload used for the last search (for automatic re-search) */
  lastSearchPayload: BusSearchPayload | null;
  /** Source city object */
  sourceCity: City | null;
  /** Destination city object */
  destinationCity: City | null;
  /** Journey date */
  journeyDate: string | null;
  /** Full bus list from the last search response */
  busList: Bus[];

  // Actions
  setSearchContext: (ctx: {
    traceId: string;
    payload: BusSearchPayload;
    sourceCity: City;
    destinationCity: City;
    journeyDate: string;
    busList: Bus[];
  }) => void;
  updateTraceId: (traceId: string) => void;
  updateBusList: (buses: Bus[]) => void;
  clearSearchContext: () => void;

  /** Check if a busId exists in the stored bus list */
  hasBus: (busId: string) => boolean;
}

export const useBusSearchContextStore = create<BusSearchContextState>()(
  persist(
    (set, get) => ({
      traceId: null,
      lastSearchPayload: null,
      sourceCity: null,
      destinationCity: null,
      journeyDate: null,
      busList: [],

      setSearchContext: (ctx) => {
        set({
          traceId: ctx.traceId,
          lastSearchPayload: ctx.payload,
          sourceCity: ctx.sourceCity,
          destinationCity: ctx.destinationCity,
          journeyDate: ctx.journeyDate,
          busList: ctx.busList,
        });
      },

      updateTraceId: (traceId) => {
        set({ traceId });
        // Also update localStorage for the detail page
        if (typeof window !== "undefined") {
          localStorage.setItem("bus_search_traceId", traceId);
        }
      },

      updateBusList: (buses) => {
        set({ busList: buses });
      },

      clearSearchContext: () => {
        set({
          traceId: null,
          lastSearchPayload: null,
          sourceCity: null,
          destinationCity: null,
          journeyDate: null,
          busList: [],
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("bus_search_traceId");
        }
      },

      hasBus: (busId) => {
        return get().busList.some((b) => b.id === busId);
      },
    }),
    {
      name: "bus-search-context",
      partialize: (state) => ({
        traceId: state.traceId,
        lastSearchPayload: state.lastSearchPayload,
        sourceCity: state.sourceCity,
        destinationCity: state.destinationCity,
        journeyDate: state.journeyDate,
        busList: state.busList,
      }),
    }
  )
);
