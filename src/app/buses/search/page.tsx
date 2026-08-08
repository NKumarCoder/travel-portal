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
import { debugLog } from "@/lib/debug";
import { useRouter } from "next/navigation";
import type { Bus } from "@/types";
import {
  ArrowRightLeft,
  SlidersHorizontal,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Bus as BusIcon,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function BusSearchPage() {
  const router = useRouter();

  const {
    fromCity,
    toCity,
    departDate,
    passengers,
    setFromCity,
    setToCity,
    setDepartDate,
    setPassengers,
    swapFromTo,
  } = useSearchStore();

  const { resetFilters } = useBusFilterStore();
  const { setSearchContext } = useBusSearchContextStore();
  const { setSelectedBusData: clearSelectedBus } = useBusBookingStore();

  const [buses, setBuses] = React.useState<Bus[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const [isModifySearchOpen, setIsModifySearchOpen] = React.useState(false);

  const performSearch = async () => {
    if (!fromCity || !toCity || !departDate) return;

    setIsLoading(true);
    setSearchError(null);
    setBuses([]);

    // Clear previously selected bus
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

      // Store traceId for select calls
      if (traceId && typeof window !== "undefined") {
        localStorage.setItem("bus_search_traceId", traceId);
      }
    } catch (error: unknown) {
      let message = "Unable to fetch buses. Please try again.";

      if (error instanceof Error) {
        if (
          !error.message.includes("Network Error") &&
          !error.message.includes("ERR_NETWORK") &&
          !error.message.includes("timeout") &&
          !error.message.includes("ECONNABORTED") &&
          !error.message.includes("Request failed")
        ) {
          message = error.message;
        } else if (error.message.includes("Network Error") || error.message.includes("ERR_NETWORK")) {
          message = "Network error — unable to reach the server.";
        } else if (error.message.includes("timeout") || error.message.includes("ECONNABORTED")) {
          message = "Request timed out. Please try again.";
        }
      }

      setSearchError(message);
      setBuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run search on mount if parameters exist, else redirect back to landing page
  React.useEffect(() => {
    if (fromCity && toCity && departDate) {
      performSearch();
    } else {
      router.push("/buses");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModifySearchSubmit = () => {
    resetFilters();
    setIsModifySearchOpen(false);
    performSearch();
  };

  const handleResetSearch = () => {
    router.push("/buses");
  };

  const formattedDate = departDate
    ? new Date(departDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const totalPassengers =
    typeof passengers === "number"
      ? passengers
      : (passengers?.adults || 1) + (passengers?.children || 0) + (passengers?.infants || 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      {/* ===== 1. Ultra-Compact Journey Toolbar (Fixed Top: ~56-64px default height) ===== */}
      <section className="shrink-0 bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800 text-white shadow-sm z-20">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            {/* Origin -> Destination & Journey Summary */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <BusIcon className="h-4 w-4" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 min-w-0">
                {/* Primary Route */}
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  <span>{fromCity?.name || "Origin"}</span>
                  <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{toCity?.name || "Destination"}</span>
                </div>

                {/* Divider (Desktop) */}
                <span className="hidden sm:inline text-slate-700 font-normal">|</span>

                {/* Secondary Info */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                    {formattedDate}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400 shrink-0" />
                    {totalPassengers} Passenger{totalPassengers > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Modify Search Toggle + Mobile Filters Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModifySearchOpen(!isModifySearchOpen)}
                className="gap-1.5 border-slate-700 bg-slate-800/90 text-white hover:bg-slate-800 hover:text-white text-xs font-bold rounded-lg h-8 px-3 cursor-pointer shadow-2xs transition-all"
              >
                <Search className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{isModifySearchOpen ? "Close Search" : "Modify Search"}</span>
                <span className="sm:hidden">{isModifySearchOpen ? "Close" : "Modify"}</span>
                {isModifySearchOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 lg:hidden border-slate-700 bg-slate-800/90 text-white hover:bg-slate-800 text-xs font-bold rounded-lg h-8 px-2.5"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                Filters
              </Button>
            </div>
          </div>

          {/* Expandable Modify Search Form */}
          {isModifySearchOpen && (
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="rounded-2xl border border-white/10 bg-white/95 p-3.5 text-slate-900 shadow-xl backdrop-blur-md">
                {/* Desktop Expandable Form */}
                <div className="hidden items-end gap-3 lg:flex">
                  <div className="flex-[2] flex items-end gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div className="flex-1">
                      <CityAutocomplete
                        label="From"
                        value={fromCity}
                        onSelect={setFromCity}
                        placeholder="Source city"
                      />
                    </div>
                    <div className="flex items-center pb-0.5">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={swapFromTo}
                        aria-label="Swap source and destination"
                        className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 shadow-2xs"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <CityAutocomplete
                        label="To"
                        value={toCity}
                        onSelect={setToCity}
                        placeholder="Destination city"
                      />
                    </div>
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
                    onClick={handleModifySearchSubmit}
                    className="h-11 gap-2 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                    disabled={!fromCity || !toCity || !departDate || isLoading}
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {isLoading ? "Searching..." : "Update Search"}
                  </Button>
                </div>

                {/* Mobile Expandable Form */}
                <div className="space-y-3 lg:hidden">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                    <CityAutocomplete
                      label="From"
                      value={fromCity}
                      onSelect={setFromCity}
                      placeholder="Source city"
                    />
                    <div className="flex justify-center -my-1 relative z-10">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={swapFromTo}
                        aria-label="Swap source and destination"
                        className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
                      >
                        <ArrowRightLeft className="h-3 w-3" />
                      </Button>
                    </div>
                    <CityAutocomplete
                      label="To"
                      value={toCity}
                      onSelect={setToCity}
                      placeholder="Destination city"
                    />
                  </div>

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
                    onClick={handleModifySearchSubmit}
                    className="h-11 w-full gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                    disabled={!fromCity || !toCity || !departDate || isLoading}
                  >
                    <Search className="h-4 w-4" />
                    {isLoading ? "Searching..." : "Update Search"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== 2. Two-Pane Split Workspace Section (Desktop Independent Scroll) ===== */}
      <main className="flex-1 flex overflow-hidden min-h-0 mx-auto max-w-7xl w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-0 overflow-hidden">
          
          {/* LEFT PANE: Filters (Independent Scroll Pane on Desktop) */}
          <aside className="hidden lg:block w-72 lg:w-80 shrink-0 h-full min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <BusFilters />
          </aside>

          {/* RIGHT PANE: Results (Independent Scroll Pane on Desktop) */}
          <section className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto pl-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {/* Error banner */}
            {searchError && !isLoading && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-center shadow-xs">
                <div className="flex items-center justify-center gap-2 text-red-700 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{searchError}</span>
                </div>
                <button
                  onClick={performSearch}
                  className="mt-2 text-xs font-semibold text-red-700 hover:text-red-800 underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Try Again
                </button>
              </div>
            )}

            <BusSearchResults
              buses={buses}
              isLoading={isLoading}
              onModifySearch={handleResetSearch}
            />
          </section>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setShowMobileFilters(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] flex flex-col bg-slate-50 shadow-2xl">
              {/* Drawer Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">Filters</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filters"
                  className="rounded-lg h-8 w-8"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </Button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <BusFilters className="border-0 shadow-none bg-transparent p-0" />
              </div>

              {/* Sticky Drawer Footer */}
              <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 shadow-lg">
                <Button
                  className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Seat Selection Modal */}
      <BusSeatModal />
    </div>
  );
}


