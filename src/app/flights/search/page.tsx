"use client";

import React from "react";
import Link from "next/link";
import { useSearchStore } from "@/store/search-store";
import { useFlightFilterStore, type FlightSortOption } from "@/store/flight-filter-store";
import { FlightFilterSidebar } from "@/components/travel/flight-filter-sidebar";
import { FlightCard } from "@/components/travel/flight-card";
import { SearchBox } from "@/components/ui/search-box";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import type { Flight } from "@/types";
import flightsData from "@/data/flights.json";
import { cn } from "@/lib/utils";
import {
  Plane,
  ArrowRightLeft,
  Search,
  Filter,
  ArrowUpDown,
  X,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
  Users,
  MapPin,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function parseDurationMinutes(durationStr: string): number {
  const parts = durationStr.match(/(\d+)h\s*(\d+)?m?/);
  if (!parts) return 0;
  const hours = parseInt(parts[1] || "0", 10);
  const minutes = parseInt(parts[2] || "0", 10);
  return hours * 60 + minutes;
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
    departDate,
    passengers,
    travelClass,
    setFrom,
    setTo,
    setDepartDate,
    setPassengers,
    setTravelClass,
    swapFromTo,
  } = useSearchStore();

  const {
    stops,
    airlines,
    departureTimes,
    cabinClasses,
    refundableOnly,
    checkinBaggageOnly,
    priceRange,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    toggleStop,
    toggleAirline,
    setRefundableOnly,
  } = useFlightFilterStore();

  const [flights, setFlights] = React.useState<Flight[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModifyOpen, setIsModifyOpen] = React.useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  // Simulate flight loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFlights(flightsData as Flight[]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Dynamically extract unique available airlines from results
  const availableAirlines = React.useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f) => set.add(f.airline));
    return Array.from(set);
  }, [flights]);

  // Filtering & Sorting Pipeline
  const filteredAndSortedFlights = React.useMemo(() => {
    let result = [...flights];

    // Origin Filter
    if (from.trim()) {
      const q = from.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.departure.city.toLowerCase().includes(q) ||
          f.departure.code.toLowerCase().includes(q) ||
          f.departure.airport.toLowerCase().includes(q)
      );
    }

    // Destination Filter
    if (to.trim()) {
      const q = to.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.arrival.city.toLowerCase().includes(q) ||
          f.arrival.code.toLowerCase().includes(q) ||
          f.arrival.airport.toLowerCase().includes(q)
      );
    }

    // Filter: Stops
    if (stops.length > 0) {
      result = result.filter((f) => stops.includes(f.stops));
    }

    // Filter: Airlines
    if (airlines.length > 0) {
      result = result.filter((f) => airlines.includes(f.airline));
    }

    // Filter: Departure Time Slot
    if (departureTimes.length > 0) {
      result = result.filter((f) => departureTimes.includes(getTimeSlot(f.departure.time)));
    }

    // Filter: Cabin Class
    if (cabinClasses.length > 0) {
      result = result.filter((f) => cabinClasses.includes(f.class));
    }

    // Filter: Refundable Only
    if (refundableOnly) {
      result = result.filter((f) => f.refundable);
    }

    // Filter: Check-in Baggage Included
    if (checkinBaggageOnly) {
      result = result.filter(
        (f) => f.baggage.checkin && f.baggage.checkin.toLowerCase() !== "0kg"
      );
    }

    // Filter: Price Range
    result = result.filter(
      (f) => f.price >= priceRange[0] && f.price <= priceRange[1]
    );

    // Sorting
    switch (sortBy) {
      case "cheapest":
        result.sort((a, b) => a.price - b.price);
        break;
      case "fastest":
        result.sort(
          (a, b) => parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration)
        );
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
  }, [
    flights,
    from,
    to,
    stops,
    airlines,
    departureTimes,
    cabinClasses,
    refundableOnly,
    checkinBaggageOnly,
    priceRange,
    sortBy,
  ]);

  const activeFilters = hasActiveFilters();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
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
                    {from || "Origin"} <span className="text-slate-400 font-normal">⇄</span>{" "}
                    {to || "Destination"}
                  </h1>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <span>{departDate ? formatDateShort(departDate) : "Departure Date"}</span>
                  <span className="text-slate-500 font-bold">{" • "}</span>
                  <span>
                    {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-500 font-bold">{" • "}</span>
                  <span className="capitalize text-emerald-400 font-bold">
                    {travelClass.replace("_", " ")}
                  </span>
                </p>
              </div>
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

          {/* Expanded Inline Modify Search Form */}
          {isModifyOpen && (
            <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-3">
                  <SearchBox
                    value={from}
                    onChange={setFrom}
                    placeholder="From (city or airport)"
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
                  <SearchBox value={to} onChange={setTo} placeholder="To (city or airport)" />
                </div>
                <div className="lg:col-span-2">
                  <DatePicker label="Departure" value={departDate} onChange={setDepartDate} />
                </div>
                <div className="lg:col-span-2">
                  <PassengerSelector value={passengers} onChange={setPassengers} />
                </div>
                <div className="lg:col-span-1">
                  <Button
                    onClick={() => setIsModifyOpen(false)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== 2. Workspace Toolbar ===== */}
      <div className="bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          {/* Result Count & Active Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-900">
              {filteredAndSortedFlights.length} flight
              {filteredAndSortedFlights.length !== 1 ? "s" : ""} found
            </span>

            {/* Active Filter Chips */}
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

            {activeFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Sort Dropdown Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FlightSortOption)}
              className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 shadow-2xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="cheapest">Cheapest</option>
              <option value="fastest">Fastest Duration</option>
              <option value="earliest">Earliest Departure</option>
              <option value="latest">Latest Departure</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== 3. Application 2-Pane Workspace ===== */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex gap-6 items-start">
        {/* LEFT PANE: Sticky Independent Scrolling Filter Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          <FlightFilterSidebar availableAirlines={availableAirlines} />
        </aside>

        {/* RIGHT PANE: Independent Scrolling Flight Results List */}
        <main className="flex-1 min-w-0 space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-3">
              <ListSkeleton count={4} />
            </div>
          ) : filteredAndSortedFlights.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm my-4 max-w-md mx-auto">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                <Plane className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">No flights found</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">
                No flights match your current filters or route. Try clearing filters or searching for different cities.
              </p>
              <Button
                onClick={resetFilters}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 rounded-xl shadow-xs cursor-pointer"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            /* Results Cards List */
            filteredAndSortedFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onSelect={(selectedFlight) => {
                  // Preserved selection contract
                }}
              />
            ))
          )}
        </main>
      </div>

      {/* ===== 4. Mobile Floating Bottom Bar ===== */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden flex gap-2 bg-slate-950/95 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl border border-slate-800">
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <FlightFilterSidebar availableAirlines={availableAirlines} />

            <Button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm h-11 rounded-xl shadow-md cursor-pointer"
            >
              Apply Filters ({filteredAndSortedFlights.length} Flights)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
