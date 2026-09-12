"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/search-store";
import { useFlightBookingStore } from "@/store/flight-booking-store";
import { useFlightFilterStore, type FlightSortOption } from "@/store/flight-filter-store";
import { FlightFilterSidebar } from "@/components/travel/flight-filter-sidebar";
import { FlightCard } from "@/components/travel/flight-card";
import { AirportAutocomplete } from "@/components/ui/airport-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import type { NormalizedFlightResult } from "@/types";
import { searchFlights } from "@/services/flightSearchService";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Plane,
  ArrowRightLeft,
  Search,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function parseTimeMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function getTimeSlot(timeStr: string): string {
  const hours = parseInt(timeStr.split(":")[0] || "0", 10);
  if (hours >= 0 && hours < 6) return "early_morning";
  if (hours >= 6 && hours < 12) return "morning";
  if (hours >= 12 && hours < 18) return "afternoon";
  return "evening";
}

export default function FlightSearchResultsPage() {
  const {
    from,
    to,
    tripType,
    fromAirport,
    toAirport,
    departDate,
    returnDate,
    passengers,
    travelClass,
    isSearching,
    onwardFlightResults,
    returnFlightResults,
    selectedOnwardFlight,
    selectedReturnFlight,
    flightSearchError,
    setFrom,
    setTo,
    setTripType,
    setFromAirport,
    setToAirport,
    setDepartDate,
    setReturnDate,
    setPassengers,
    setTravelClass,
    setIsSearching,
    setOnwardFlightResults,
    setReturnFlightResults,
    setFlightTraceId,
    setSelectedOnwardFlight,
    setSelectedReturnFlight,
    setFlightSearchError,
    swapFromTo,
  } = useSearchStore();

  const {
    stops,
    airlines,
    departureTimes,
    cabinClasses,
    refundableOnly,
    priceRange,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    toggleStop,
    toggleAirline,
    setRefundableOnly,
  } = useFlightFilterStore();

  const router = useRouter();
  const { initializeBooking } = useFlightBookingStore();
  const [isProceedingToBooking, setIsProceedingToBooking] = React.useState(false);

  const [isModifyOpen, setIsModifyOpen] = React.useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const [modifyError, setModifyError] = React.useState<string | null>(null);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const handleProceedToBook = () => {
    if (!selectedOnwardFlight) return;
    if (tripType === "roundTrip" && !selectedReturnFlight) return;

    setIsProceedingToBooking(true);

    try {
      initializeBooking(selectedOnwardFlight, selectedReturnFlight, {
        tripType,
        fromAirport,
        toAirport,
        departDate,
        returnDate,
        passengers,
        travelClass,
        traceId: null,
      });

      router.push("/flights/customer-information");
    } catch (err) {
      console.error("Failed to initialize flight customer information", err);
      setIsProceedingToBooking(false);
    }
  };

  // Auto-fetch if results are empty but search parameters exist (e.g. direct page refresh)
  React.useEffect(() => {
    if (
      onwardFlightResults.length === 0 &&
      fromAirport?.airportCode &&
      toAirport?.airportCode &&
      departDate &&
      !isSearching
    ) {
      setIsSearching(true);
      searchFlights({
        fromAirport,
        toAirport,
        departDate,
        returnDate: tripType === "roundTrip" ? returnDate : undefined,
        tripType,
        passengers,
        travelClass,
      })
        .then(({ onwardResults, returnResults, traceId }) => {
          setOnwardFlightResults(onwardResults);
          setReturnFlightResults(returnResults);
          setFlightTraceId(traceId);
        })
        .catch((err) => {
          setFlightSearchError(err instanceof Error ? err.message : "Search failed");
        })
        .finally(() => {
          setIsSearching(false);
        });
    }
  }, []);

  // Handle Modify Search Execution
  const handleModifySearch = async () => {
    setModifyError(null);
    if (!fromAirport?.airportCode || !toAirport?.airportCode) {
      setModifyError("Please select both origin and destination airports.");
      return;
    }
    if (!departDate) {
      setModifyError("Please select a departure date.");
      return;
    }
    if (tripType === "roundTrip" && !returnDate) {
      setModifyError("Please select a return date for Round Trip.");
      return;
    }

    setIsSearching(true);
    setSelectedOnwardFlight(null);
    setSelectedReturnFlight(null);

    try {
      const { onwardResults, returnResults, traceId } = await searchFlights({
        fromAirport,
        toAirport,
        departDate,
        returnDate: tripType === "roundTrip" ? returnDate : undefined,
        tripType,
        passengers,
        travelClass,
      });

      setOnwardFlightResults(onwardResults);
      setReturnFlightResults(returnResults);
      setFlightTraceId(traceId);
      setIsModifyOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Search failed. Please try again.";
      setModifyError(msg);
      setFlightSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  // Dynamically extract unique available airlines from results
  const availableAirlines = React.useMemo(() => {
    const set = new Set<string>();
    onwardFlightResults.forEach((f) => set.add(f.airlineName));
    returnFlightResults.forEach((f) => set.add(f.airlineName));
    return Array.from(set);
  }, [onwardFlightResults, returnFlightResults]);

  // Generic Filter & Sort pipeline
  const applyFilterAndSort = (flights: NormalizedFlightResult[]): NormalizedFlightResult[] => {
    let result = [...flights];

    // Filter: Stops
    if (stops.length > 0) {
      result = result.filter((f) => stops.includes(f.stops));
    }

    // Filter: Airlines
    if (airlines.length > 0) {
      result = result.filter((f) => airlines.includes(f.airlineName));
    }

    // Filter: Departure Time Slot
    if (departureTimes.length > 0) {
      result = result.filter((f) => departureTimes.includes(getTimeSlot(f.departure.time)));
    }

    // Filter: Refundable Only
    if (refundableOnly) {
      result = result.filter((f) => f.refundable);
    }

    // Filter: Price Range
    if (priceRange && (priceRange[0] > 0 || (priceRange[1] > 0 && priceRange[1] < 100000))) {
      result = result.filter(
        (f) => f.price >= priceRange[0] && f.price <= priceRange[1]
      );
    }

    // Sorting
    switch (sortBy) {
      case "cheapest":
        result.sort((a, b) => a.price - b.price);
        break;
      case "fastest":
        result.sort((a, b) => a.durationMinutes - b.durationMinutes);
        break;
      case "earliest":
        result.sort(
          (a, b) => parseTimeMinutes(a.departure.time) - parseTimeMinutes(b.departure.time)
        );
        break;
      case "latest":
        result.sort(
          (a, b) => parseTimeMinutes(b.departure.time) - parseTimeMinutes(a.departure.time)
        );
        break;
      case "recommended":
      default:
        break;
    }

    return result;
  };

  const filteredOnwardFlights = React.useMemo(
    () => applyFilterAndSort(onwardFlightResults),
    [onwardFlightResults, stops, airlines, departureTimes, refundableOnly, priceRange, sortBy]
  );

  const filteredReturnFlights = React.useMemo(
    () => applyFilterAndSort(returnFlightResults),
    [returnFlightResults, stops, airlines, departureTimes, refundableOnly, priceRange, sortBy]
  );

  const activeFilters = hasActiveFilters();

  const isRoundTrip = tripType === "roundTrip";
  const totalFound = isRoundTrip
    ? filteredOnwardFlights.length + filteredReturnFlights.length
    : filteredOnwardFlights.length;

  const combinedPrice =
    (selectedOnwardFlight?.price || 0) + (selectedReturnFlight?.price || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* ===== 1. Compact Flight Journey Header ===== */}
      <section className="sticky top-16 z-30 bg-slate-950 text-white border-b border-slate-800 shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/flights"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
                aria-label="Back to flights landing page"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-emerald-400 shrink-0" />
                  <h1 className="text-sm sm:text-base font-extrabold text-white truncate">
                    {fromAirport?.airportCode || from || "Origin"}{" "}
                    <span className="text-slate-400 font-normal">
                      {isRoundTrip ? "⇄" : "→"}
                    </span>{" "}
                    {toAirport?.airportCode || to || "Destination"}
                  </h1>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                    {isRoundTrip ? "Round Trip" : "One Way"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <span>
                    Depart: {departDate ? formatDateShort(departDate) : "--"}
                  </span>
                  {isRoundTrip && (
                    <>
                      <span className="text-slate-500 font-bold">•</span>
                      <span>
                        Return: {returnDate ? formatDateShort(returnDate) : "--"}
                      </span>
                    </>
                  )}
                  <span className="text-slate-500 font-bold">•</span>
                  <span>
                    {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-500 font-bold">•</span>
                  <span className="capitalize text-emerald-400 font-bold">
                    {travelClass.replace("_", " ")}
                  </span>
                </p>

                {/* Mobile Result Count */}
                <div className="sm:hidden text-[11px] font-bold text-emerald-400 mt-1">
                  {totalFound} flight option{totalFound !== 1 ? "s" : ""} found{" "}
                  {isRoundTrip && (
                    <span className="text-slate-300 font-normal">
                      ({filteredOnwardFlights.length} Onward + {filteredReturnFlights.length} Return)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right: Result Count & Modify Search Action */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs sm:text-sm font-extrabold text-white whitespace-nowrap">
                  {totalFound} flight option{totalFound !== 1 ? "s" : ""} found
                </div>
                {isRoundTrip ? (
                  <div className="text-[11px] text-emerald-400 font-semibold whitespace-nowrap">
                    ({filteredOnwardFlights.length} Onward + {filteredReturnFlights.length} Return)
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    All available options
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModifyOpen((prev) => !prev)}
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-xs font-extrabold h-9 px-4 rounded-xl shrink-0 cursor-pointer"
              >
                {isModifyOpen ? "Close" : "Modify Search"}
              </Button>
            </div>
          </div>

          {/* Expanded Inline Modify Search Form */}
          {isModifyOpen && (
            <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 animate-in fade-in-50 duration-150">
              {modifyError && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-200">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{modifyError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setTripType("oneWay")}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-extrabold transition-all cursor-pointer",
                    tripType === "oneWay"
                      ? "bg-emerald-500 text-slate-950 font-black"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("roundTrip")}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-extrabold transition-all cursor-pointer",
                    tripType === "roundTrip"
                      ? "bg-emerald-500 text-slate-950 font-black"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                >
                  Round Trip
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-3">
                  <AirportAutocomplete
                    label="From"
                    value={fromAirport}
                    onSelect={setFromAirport}
                    placeholder="From airport"
                  />
                </div>
                <div className="flex items-center justify-center lg:col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={swapFromTo}
                    aria-label="Swap cities"
                    className="text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="lg:col-span-3">
                  <AirportAutocomplete
                    label="To"
                    value={toAirport}
                    onSelect={setToAirport}
                    placeholder="To airport"
                  />
                </div>
                <div className={cn(isRoundTrip ? "lg:col-span-2" : "lg:col-span-3")}>
                  <DatePicker label="Departure" value={departDate} onChange={setDepartDate} />
                </div>
                {isRoundTrip && (
                  <div className="lg:col-span-2">
                    <DatePicker label="Return" value={returnDate} onChange={setReturnDate} />
                  </div>
                )}
                <div className="lg:col-span-1">
                  <Button
                    onClick={handleModifySearch}
                    disabled={isSearching}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl cursor-pointer disabled:opacity-75"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== 2. Application Workspace (Flight Results & Filters immediately below Header) ===== */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex gap-6 items-start">
        {/* LEFT PANE: Sticky Filter Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          <FlightFilterSidebar availableAirlines={availableAirlines} />
        </aside>

        {/* RIGHT PANE: Flight Results */}
        <main className="flex-1 min-w-0">
          {/* Active Filter Chips bar - only rendered when filters are actually active */}
          {activeFilters && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-white border border-slate-200/90 px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-extrabold text-slate-500 mr-1">Active:</span>
              {stops.map((stop) => (
                <button
                  key={`chip-stop-${stop}`}
                  type="button"
                  onClick={() => toggleStop(stop)}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <span>{stop === 0 ? "Non-stop" : `${stop} Stop`}</span>
                  <X className="h-3 w-3" />
                </button>
              ))}
              {airlines.map((airline) => (
                <button
                  key={`chip-airline-${airline}`}
                  type="button"
                  onClick={() => toggleAirline(airline)}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <span>{airline}</span>
                  <X className="h-3 w-3" />
                </button>
              ))}
              {refundableOnly && (
                <button
                  type="button"
                  onClick={() => setRefundableOnly(false)}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <span>Refundable</span>
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 underline ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
          {isSearching ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-emerald-900">
                  Searching live airfares from all airlines...
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Consolidating best fares for{" "}
                  {fromAirport?.airportCode || from} → {toAirport?.airportCode || to}
                </p>
              </div>
              <ListSkeleton count={4} />
            </div>
          ) : totalFound === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm my-4 max-w-md mx-auto">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                <Plane className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">No flights found</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">
                {flightSearchError ||
                  "No flights match your route or active filters. Try adjusting your dates or resetting filters."}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="text-xs font-bold px-4 rounded-xl"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={() => setIsModifyOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 rounded-xl shadow-xs"
                >
                  Modify Search
                </Button>
              </div>
            </div>
          ) : isRoundTrip ? (
            /* ===== DOMESTIC ROUND TRIP: SEPARATE ONWARD AND RETURN COLUMNS ===== */
            <div className="space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* ─── Column 1: Onward Flights ──────────────────────────── */}
                <section className="space-y-3">
                  <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                          Onward
                        </span>
                        <h2 className="text-sm font-extrabold text-slate-900">
                          {fromAirport?.airportCode || from} → {toAirport?.airportCode || to}
                        </h2>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {formatDateShort(departDate)} · {filteredOnwardFlights.length} options
                      </p>
                    </div>
                    {selectedOnwardFlight && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                        <Check className="h-3 w-3 stroke-[3]" /> Selected
                      </span>
                    )}
                  </div>

                  {filteredOnwardFlights.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                      No onward flights match current filters.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-10.5rem)] overflow-y-auto pr-1">
                      {filteredOnwardFlights.map((flight) => (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          isSelected={selectedOnwardFlight?.id === flight.id}
                          onSelect={() => setSelectedOnwardFlight(flight)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* ─── Column 2: Return Flights ──────────────────────────── */}
                <section className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                          Return
                        </span>
                        <h2 className="text-sm font-extrabold text-slate-900">
                          {toAirport?.airportCode || to} → {fromAirport?.airportCode || from}
                        </h2>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {formatDateShort(returnDate)} · {filteredReturnFlights.length} options
                      </p>
                    </div>
                    {selectedReturnFlight && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                        <Check className="h-3 w-3 stroke-[3]" /> Selected
                      </span>
                    )}
                  </div>

                  {filteredReturnFlights.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
                      No return flights match current filters.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-10.5rem)] overflow-y-auto pr-1">
                      {filteredReturnFlights.map((flight) => (
                        <FlightCard
                          key={flight.id}
                          flight={flight}
                          isSelected={selectedReturnFlight?.id === flight.id}
                          onSelect={() => setSelectedReturnFlight(flight)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : (
            /* ===== ONE WAY: SINGLE ONWARD RESULTS LIST ===== */
            <div className="space-y-3 max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-1">
              {filteredOnwardFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  isSelected={selectedOnwardFlight?.id === flight.id}
                  onSelect={() => setSelectedOnwardFlight(flight)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ===== 4. Sticky Bottom Round-Trip / One-Way Selection Drawer ===== */}
      {(selectedOnwardFlight || selectedReturnFlight) && (
        <aside
          aria-label="Flight booking summary"
          className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md text-white border-t border-slate-800 py-3.5 px-4 shadow-2xl animate-in slide-in-from-bottom-6 duration-200"
        >
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Selected Onward Summary */}
              {selectedOnwardFlight ? (
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                  <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[9px] font-black uppercase">
                    Onward
                  </span>
                  <span className="font-extrabold text-white">
                    {selectedOnwardFlight.airlineName} {selectedOnwardFlight.flightNumber}
                  </span>
                  <span className="text-slate-400">
                    {selectedOnwardFlight.departure.time} → {selectedOnwardFlight.arrival.time}
                  </span>
                  <span className="font-black text-emerald-400">
                    {formatCurrency(selectedOnwardFlight.price, selectedOnwardFlight.currency)}
                  </span>
                </div>
              ) : isRoundTrip ? (
                <span className="text-slate-400 text-xs italic">
                  Select an onward flight
                </span>
              ) : null}

              {/* Selected Return Summary */}
              {isRoundTrip && (
                selectedReturnFlight ? (
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                    <span className="rounded bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 text-[9px] font-black uppercase">
                      Return
                    </span>
                    <span className="font-extrabold text-white">
                      {selectedReturnFlight.airlineName} {selectedReturnFlight.flightNumber}
                    </span>
                    <span className="text-slate-400">
                      {selectedReturnFlight.departure.time} → {selectedReturnFlight.arrival.time}
                    </span>
                    <span className="font-black text-emerald-400">
                      {formatCurrency(selectedReturnFlight.price, selectedReturnFlight.currency)}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs italic">
                    Select a return flight
                  </span>
                )
              )}
            </div>

            {/* Total Fare & Booking Action */}
            <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Grand Total</span>
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {formatCurrency(combinedPrice, selectedOnwardFlight?.currency || "INR")}
                </span>
              </div>

              <Button
                disabled={
                  isProceedingToBooking ||
                  (isRoundTrip ? !selectedOnwardFlight || !selectedReturnFlight : !selectedOnwardFlight)
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 h-10 rounded-xl shadow-md hover:shadow-emerald-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                onClick={handleProceedToBook}
              >
                {isProceedingToBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing booking...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Book</span>
                    <Check className="h-4 w-4 stroke-[3]" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* ===== 5. Mobile Floating Filter Trigger ===== */}
      <div className="fixed bottom-4 left-4 right-4 z-30 lg:hidden flex gap-2 bg-slate-950/95 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl border border-slate-800">
        <Button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs h-10 rounded-xl gap-2 cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
          <span>Filters</span>
          {activeFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px]">
              !
            </span>
          )}
        </Button>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400 mr-1" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as FlightSortOption)}
            className="bg-transparent text-xs font-extrabold text-white focus:outline-none cursor-pointer py-2"
          >
            <option value="recommended" className="bg-slate-900 text-white">Recommended</option>
            <option value="cheapest" className="bg-slate-900 text-white">Cheapest</option>
            <option value="fastest" className="bg-slate-900 text-white">Fastest</option>
            <option value="earliest" className="bg-slate-900 text-white">Earliest</option>
          </select>
        </div>
      </div>

      {/* ===== Mobile Filter Modal Drawer ===== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm lg:hidden animate-in fade-in-50 duration-150">
          <div className="mt-auto max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Flight Filters</h2>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <FlightFilterSidebar availableAirlines={availableAirlines} />

            <Button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm h-11 rounded-xl shadow-md cursor-pointer"
            >
              Apply Filters ({totalFound} Flights)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
