"use client";

import React from "react";
import { useHotelFilterStore } from "@/store/hotel-filter-store";
import { cn } from "@/lib/utils";
import { Filter, RotateCcw, Star, Check } from "lucide-react";

export function HotelFilterSidebar({ className }: { className?: string }) {
  const {
    priceRange,
    starRating,
    propertyTypes,
    amenities,
    guestReviewScore,
    freeCancellationOnly,
    setPriceRange,
    toggleStarRating,
    togglePropertyType,
    toggleAmenity,
    setGuestReviewScore,
    setFreeCancellationOnly,
    resetFilters,
    hasActiveFilters,
  } = useHotelFilterStore();

  const isFiltered = hasActiveFilters();

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm space-y-5 text-xs text-slate-900",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h3 className="font-extrabold text-sm text-slate-900">Filters</h3>
        </div>
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer text-[11px]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* 1. Price Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-slate-900">Price Per Night</span>
          <span className="font-bold text-emerald-600 text-[11px]">
            ${priceRange[0]} - ${priceRange[1]}+
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1000}
          step={20}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
        />
      </div>

      {/* 2. Star Rating */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="font-extrabold text-slate-900 block">Star Rating</span>
        <div className="space-y-1.5">
          {[5, 4, 3].map((star) => {
            const isSelected = starRating.includes(star);
            return (
              <label
                key={star}
                className="flex items-center justify-between font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStarRating(star)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900">{star} Stars</span>
                </div>
                <div className="flex text-amber-400">
                  {"★".repeat(star)}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Guest Review Score */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="font-extrabold text-slate-900 block">Guest Review Rating</span>
        <div className="space-y-1.5">
          {[
            { label: "4.5+ Excellent", score: 4.5 },
            { label: "4.0+ Very Good", score: 4.0 },
            { label: "3.5+ Good", score: 3.5 },
          ].map((item) => {
            const isSelected = guestReviewScore === item.score;
            return (
              <label
                key={item.score}
                className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="guestReviewScore"
                  checked={isSelected}
                  onChange={() => setGuestReviewScore(isSelected ? null : item.score)}
                  className="border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Property Type */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="font-extrabold text-slate-900 block">Property Type</span>
        <div className="space-y-1.5">
          {["Resort", "Hotel", "Villa", "Lodge"].map((type) => {
            const isSelected = propertyTypes.includes(type);
            return (
              <label
                key={type}
                className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePropertyType(type)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                />
                <span>{type}s</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Amenities */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="font-extrabold text-slate-900 block">Popular Amenities</span>
        <div className="space-y-1.5">
          {["Pool", "Spa", "WiFi", "Restaurant", "Gym", "Beach Access"].map((amenity) => {
            const isSelected = amenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAmenity(amenity)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                />
                <span>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. Free Cancellation Policy Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer select-none py-1">
          <span className="font-extrabold text-slate-900">Free Cancellation Only</span>
          <input
            type="checkbox"
            checked={freeCancellationOnly}
            onChange={(e) => setFreeCancellationOnly(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4 accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
