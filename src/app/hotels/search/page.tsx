"use client";

import React from "react";
import Link from "next/link";
import { useSearchStore } from "@/store/search-store";
import { useHotelFilterStore, type HotelSortOption } from "@/store/hotel-filter-store";
import { HotelFilterSidebar } from "@/components/travel/hotel-filter-sidebar";
import { HotelResultCard } from "@/components/travel/hotel-result-card";
import { SearchBox } from "@/components/ui/search-box";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import type { Hotel } from "@/types";
import hotelsData from "@/data/hotels.json";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  X,
  RotateCcw,
  Building2,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";

function calculateNights(checkInStr?: string, checkOutStr?: string): number {
  if (!checkInStr || !checkOutStr) return 1;
  const inDate = new Date(checkInStr);
  const outDate = new Date(checkOutStr);
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function HotelSearchResultsPage() {
  const {
    destination,
    departDate,
    returnDate,
    passengers,
    setDestination,
    setDepartDate,
    setReturnDate,
    setPassengers,
  } = useSearchStore();

  const {
    priceRange,
    starRating,
    propertyTypes,
    amenities,
    guestReviewScore,
    freeCancellationOnly,
    sortBy,
    setSortBy,
    resetFilters,
    hasActiveFilters,
    toggleStarRating,
    toggleAmenity,
    setFreeCancellationOnly,
  } = useHotelFilterStore();

  const [hotels, setHotels] = React.useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModifyOpen, setIsModifyOpen] = React.useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);

  const totalGuests = passengers.adults + passengers.children + passengers.infants;
  const nightsCount = calculateNights(departDate, returnDate);

  // Load initial hotel results
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHotels(hotelsData as Hotel[]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter & Sort Pipeline
  const filteredAndSortedHotels = React.useMemo(() => {
    let result = [...hotels];

    // Filter: Destination
    if (destination.trim()) {
      const q = destination.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.location.city.toLowerCase().includes(q) ||
          h.location.country.toLowerCase().includes(q)
      );
    }

    // Filter: Price Range
    result = result.filter(
      (h) => h.pricePerNight >= priceRange[0] && h.pricePerNight <= priceRange[1]
    );

    // Filter: Star Rating
    if (starRating.length > 0) {
      result = result.filter((h) => starRating.includes(h.starRating));
    }

    // Filter: Guest Review Score
    if (guestReviewScore !== null) {
      result = result.filter((h) => h.rating >= guestReviewScore);
    }

    // Filter: Property Types
    if (propertyTypes.length > 0) {
      result = result.filter((h) =>
        propertyTypes.some((pt) => h.name.toLowerCase().includes(pt.toLowerCase()))
      );
    }

    // Filter: Amenities
    if (amenities.length > 0) {
      result = result.filter((h) =>
        amenities.every((a) => h.amenities.includes(a))
      );
    }

    // Filter: Free Cancellation
    if (freeCancellationOnly) {
      result = result.filter((h) =>
        h.cancellationPolicy.toLowerCase().includes("free")
      );
    }

    // Sorting
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price_high":
        result.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "stars":
        result.sort((a, b) => b.starRating - a.starRating);
        break;
      case "recommended":
      default:
        // Default API order
        break;
    }

    return result;
  }, [
    hotels,
    destination,
    priceRange,
    starRating,
    guestReviewScore,
    propertyTypes,
    amenities,
    freeCancellationOnly,
    sortBy,
  ]);

  const activeFilters = hasActiveFilters();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* ===== 1. Compact Modify Search Header ===== */}
      <section className="sticky top-16 z-30 bg-slate-950 text-white border-b border-slate-800 shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/hotels"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shrink-0"
                aria-label="Back to hotels landing page"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                  <h1 className="text-sm sm:text-base font-extrabold text-white truncate">
                    {destination || "All Hotels & Stays"}
                  </h1>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <span>
                    {departDate ? formatDateShort(departDate) : "Check-in"} -{" "}
                    {returnDate ? formatDateShort(returnDate) : "Check-out"}
                  </span>
                  <span className="text-slate-500 font-bold">{" • "}</span>
                  <span className="text-emerald-400 font-bold">{nightsCount} Nights</span>
                  <span className="text-slate-500 font-bold">{" • "}</span>
                  <span>{totalGuests} Guests</span>
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
                <div className="lg:col-span-4">
                  <SearchBox
                    value={destination}
                    onChange={setDestination}
                    placeholder="Where are you going?"
                  />
                </div>
                <div className="lg:col-span-3">
                  <DatePicker label="Check-in" value={departDate} onChange={setDepartDate} />
                </div>
                <div className="lg:col-span-3">
                  <DatePicker
                    label="Check-out"
                    value={returnDate}
                    onChange={setReturnDate}
                    minDate={departDate}
                  />
                </div>
                <div className="lg:col-span-2">
                  <PassengerSelector value={passengers} onChange={setPassengers} />
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
              {filteredAndSortedHotels.length} hotel
              {filteredAndSortedHotels.length !== 1 ? "s" : ""} found
            </span>

            {/* Active Filter Chips */}
            {starRating.map((star) => (
              <button
                key={`chip-star-${star}`}
                type="button"
                onClick={() => toggleStarRating(star)}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span>{star}-Star</span>
                <X className="h-3 w-3" />
              </button>
            ))}

            {freeCancellationOnly && (
              <button
                type="button"
                onClick={() => setFreeCancellationOnly(false)}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <span>Free Cancellation</span>
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
              onChange={(e) => setSortBy(e.target.value as HotelSortOption)}
              className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 shadow-2xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Guest Rating: High to Low</option>
              <option value="stars">Star Rating: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== 3. Application 2-Pane Workspace ===== */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex gap-6 items-start">
        {/* LEFT PANE: Sticky Independent Scrolling Filter Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          <HotelFilterSidebar />
        </aside>

        {/* RIGHT PANE: Independent Scrolling Hotel Results List */}
        <main className="flex-1 min-w-0 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAndSortedHotels.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm my-4 max-w-md mx-auto">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">No hotels found</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed font-medium">
                No hotels match your current filters. Try resetting filters or choosing another destination.
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
            filteredAndSortedHotels.map((hotel) => (
              <HotelResultCard
                key={hotel.id}
                hotel={hotel}
                nightsCount={nightsCount}
                onSelect={(h) => {
                  // Navigation flow contract
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
            onChange={(e) => setSortBy(e.target.value as HotelSortOption)}
            className="bg-transparent text-xs font-extrabold text-white focus:outline-none cursor-pointer py-2"
          >
            <option value="recommended" className="bg-slate-900 text-white">Recommended</option>
            <option value="price_low" className="bg-slate-900 text-white">Price: Low</option>
            <option value="price_high" className="bg-slate-900 text-white">Price: High</option>
            <option value="rating" className="bg-slate-900 text-white">Rating</option>
          </select>
        </div>
      </div>

      {/* ===== Mobile Filter Modal Drawer ===== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm lg:hidden animate-in fade-in-50 duration-150">
          <div className="mt-auto max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Hotel Filters</h2>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <HotelFilterSidebar />

            <Button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm h-11 rounded-xl shadow-md cursor-pointer"
            >
              Apply Filters ({filteredAndSortedHotels.length} Hotels)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
