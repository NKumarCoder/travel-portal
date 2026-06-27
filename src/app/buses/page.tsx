"use client";

import React from "react";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { BusFilters } from "@/features/bus-filters";
import { BusSearchResults } from "@/features/bus-search-results";
import { BusSeatModal } from "@/components/bus/BusSeatModal";
import { useSearchStore } from "@/store/search-store";
import { useBusFilterStore } from "@/store/bus-filter-store";
import { useBusSearchContextStore } from "@/store/bus-search-context-store";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { searchBuses } from "@/services/busService";
import { buildBusSearchPayload } from "@/services/payloadBuilders/busSearchPayload";
import { debugLog, debugValidation } from "@/lib/debug";
import type { Bus } from "@/types";
import {
  ArrowRightLeft,
  Bus as BusIcon,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

export default function BusesPage() {
  const {
    from,
    to,
    fromCity,
    toCity,
    departDate,
    passengers,
    hasSearched,
    setFromCity,
    setToCity,
    setDepartDate,
    setPassengers,
    setHasSearched,
    swapFromTo,
  } = useSearchStore();

  const { resetFilters } = useBusFilterStore();
  const { setSearchContext } = useBusSearchContextStore();
  const { setSelectedBusData: clearSelectedBus } = useBusBookingStore();

  const [buses, setBuses] = React.useState<Bus[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // If already searched (persistence), load results on mount
  React.useEffect(() => {
    if (hasSearched && fromCity && toCity && departDate) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performSearch = async () => {
    if (!fromCity || !toCity || !departDate) return;

    setIsLoading(true);
    setSearchError(null);
    setBuses([]);

    // Clear previously selected bus — never reuse an old Bus ID from a previous search
    clearSelectedBus(null);

    try {
      const { buses: results, traceId } = await searchBuses({
        fromCity,
        toCity,
        departDate,
      });
      setBuses(results);

      // Persist full search context for TraceId recovery
      if (traceId) {
        const payload = buildBusSearchPayload({ fromCity, toCity, departDate });
        setSearchContext({
          traceId,
          payload,
          sourceCity: fromCity,
          destinationCity: toCity,
          journeyDate: departDate,
          busList: results,
        });
      }

      // Store traceId for subsequent bus select calls
      if (traceId && typeof window !== "undefined") {
        localStorage.setItem("bus_search_traceId", traceId);
      }
    } catch (error: unknown) {
      let message = "Unable to fetch buses. Please try again.";

      if (error instanceof Error) {
        // If the backend returned a specific message, show it
        if (
          !error.message.includes("Network Error") &&
          !error.message.includes("ERR_NETWORK") &&
          !error.message.includes("timeout") &&
          !error.message.includes("ECONNABORTED") &&
          !error.message.includes("Request failed")
        ) {
          // Backend-provided message
          message = error.message;
        } else if (error.message.includes("Network Error") || error.message.includes("ERR_NETWORK")) {
          message = "Network error — unable to reach the server.";
        } else if (error.message.includes("timeout") || error.message.includes("ECONNABORTED")) {
          message = "Request timed out. Please try again.";
        }
      }

      setSearchError(message);
      setBuses([]);

      if (process.env.NODE_ENV === "development") {
        console.error("[BusSearch] Error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!fromCity || !toCity) {
      debugValidation("Search fields empty", { from, to, fromCity, toCity });
      return;
    }

    if (!departDate) {
      debugValidation("Journey date not selected", { departDate });
      return;
    }

    debugLog("SEARCH_BUTTON_CLICKED", {
      source: fromCity.name,
      sourceCode: fromCity.code,
      destination: toCity.name,
      destinationCode: toCity.code,
      date: departDate,
      passengers,
    });

    resetFilters();
    setHasSearched(true);
    performSearch();
  };

  const handleModifySearch = () => {
    setHasSearched(false);
    setBuses([]);
    setSearchError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Search Section ===== */}
      <section className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <BusIcon className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Bus Search
              </h1>
              <p className="text-sm text-gray-500">
                Find and compare buses across popular routes
              </p>
            </div>
          </div>

          {/* Search Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            {/* Desktop: Single row */}
            <div className="hidden items-end gap-3 lg:flex">
              <div className="flex-1">
                <CityAutocomplete
                  label="From"
                  value={fromCity}
                  onSelect={setFromCity}
                  placeholder="Enter source city"
                />
              </div>

              <div className="flex items-center pb-0.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapFromTo}
                  aria-label="Swap source and destination"
                  className="h-11 w-11 rounded-full"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <CityAutocomplete
                  label="To"
                  value={toCity}
                  onSelect={setToCity}
                  placeholder="Enter destination city"
                />
              </div>

              <div className="w-44">
                <DatePicker
                  label="Journey Date"
                  value={departDate}
                  onChange={setDepartDate}
                  minDate={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="w-44">
                <PassengerSelector value={passengers} onChange={setPassengers} />
              </div>

              <Button
                onClick={handleSearch}
                className="h-11 gap-2 px-6"
                disabled={!fromCity || !toCity || !departDate || isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isLoading ? "Searching..." : "Search Buses"}
              </Button>
            </div>

            {/* Mobile/Tablet: Stacked */}
            <div className="space-y-4 lg:hidden">
              <div className="relative">
                <CityAutocomplete
                  label="From"
                  value={fromCity}
                  onSelect={setFromCity}
                  placeholder="Enter source city"
                />
                {/* Swap button overlaid between fields */}
                <div className="absolute -bottom-5 right-4 z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapFromTo}
                    aria-label="Swap source and destination"
                    className="h-8 w-8 rounded-full border-2 bg-white shadow-sm"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <CityAutocomplete
                label="To"
                value={toCity}
                onSelect={setToCity}
                placeholder="Enter destination city"
              />

              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  label="Journey Date"
                  value={departDate}
                  onChange={setDepartDate}
                  minDate={new Date().toISOString().split("T")[0]}
                />
                <PassengerSelector value={passengers} onChange={setPassengers} />
              </div>

              <Button
                onClick={handleSearch}
                className="h-11 w-full gap-2"
                disabled={!fromCity || !toCity || !departDate || isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isLoading ? "Searching..." : "Search Buses"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Results Section ===== */}
      {hasSearched && (
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Route summary + mobile filter toggle */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{from}</span>
              <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium text-gray-900">{to}</span>
              {departDate && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>
                    {new Date(departDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </>
              )}
            </div>

            {/* Sticky mobile filter button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 lg:hidden"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Error state */}
          {searchError && !isLoading && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm text-red-600">{searchError}</p>
              <button
                onClick={performSearch}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* Two-column layout */}
          <div className="flex gap-6">
            {/* Left: Filters (desktop) */}
            <aside className="hidden w-72 shrink-0 lg:block">
              <div className="sticky top-20">
                <BusFilters />
              </div>
            </aside>

            {/* Right: Results */}
            <div className="min-w-0 flex-1">
              <BusSearchResults
                buses={buses}
                isLoading={isLoading}
                onModifySearch={handleModifySearch}
              />
            </div>
          </div>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-50 lg:hidden"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
                aria-hidden="true"
              />
              <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-gray-50 shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Close filters"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <BusFilters className="border-0 shadow-none" />
                </div>
                <div className="sticky bottom-0 border-t bg-white p-4">
                  <Button
                    className="w-full"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Seat Selection Modal */}
      <BusSeatModal />
    </div>
  );
}
