"use client";

import React from "react";
import { useFlightFilterStore } from "@/store/flight-filter-store";
import { cn } from "@/lib/utils";
import { Filter, RotateCcw, Plane, Clock, Luggage, ShieldCheck } from "lucide-react";

interface FlightFilterSidebarProps {
  availableAirlines?: string[];
  className?: string;
}

export function FlightFilterSidebar({
  availableAirlines = [],
  className,
}: FlightFilterSidebarProps) {
  const {
    stops,
    airlines,
    departureTimes,
    cabinClasses,
    refundableOnly,
    checkinBaggageOnly,
    priceRange,
    toggleStop,
    toggleAirline,
    toggleDepartureTime,
    toggleCabinClass,
    setRefundableOnly,
    setCheckinBaggageOnly,
    setPriceRange,
    resetFilters,
    hasActiveFilters,
  } = useFlightFilterStore();

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
          <span className="font-extrabold text-slate-900">Price Per Person</span>
          <span className="font-bold text-emerald-600 text-[11px]">
            ${priceRange[0]} - ${priceRange[1]}+
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={2500}
          step={50}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
        />
      </div>

      {/* 2. Stops */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="font-extrabold text-slate-900 block">Stops</span>
        <div className="space-y-1.5">
          {[
            { label: "Non-stop", val: 0 },
            { label: "1 Stop", val: 1 },
            { label: "2+ Stops", val: 2 },
          ].map((item) => {
            const isSelected = stops.includes(item.val);
            return (
              <label
                key={item.val}
                className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStop(item.val)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Airlines (Dynamically List From Results) */}
      {availableAirlines.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="font-extrabold text-slate-900 block">Airlines</span>
          <div className="space-y-1.5">
            {availableAirlines.map((airlineName) => {
              const isSelected = airlines.includes(airlineName);
              return (
                <label
                  key={airlineName}
                  className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAirline(airlineName)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                  />
                  <span className="truncate">{airlineName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Departure Time Slot */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          Departure Time
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "early_morning", label: "00-06h", desc: "Early" },
            { id: "morning", label: "06-12h", desc: "Morning" },
            { id: "afternoon", label: "12-18h", desc: "Afternoon" },
            { id: "evening", label: "18-24h", desc: "Night" },
          ].map((slot) => {
            const isSelected = departureTimes.includes(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleDepartureTime(slot.id)}
                className={cn(
                  "p-2 rounded-xl border text-center transition-all cursor-pointer",
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                )}
              >
                <div className="text-[10px] font-extrabold">{slot.desc}</div>
                <div className="text-[9px] text-slate-400 font-medium">{slot.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Cabin Class */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="font-extrabold text-slate-900 block">Cabin Class</span>
        <div className="space-y-1.5">
          {[
            { id: "economy", label: "Economy" },
            { id: "premium_economy", label: "Premium Economy" },
            { id: "business", label: "Business" },
            { id: "first", label: "First Class" },
          ].map((item) => {
            const isSelected = cabinClasses.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCabinClass(item.id)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-3.5 w-3.5 accent-emerald-600 cursor-pointer"
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 6. Baggage & Refundability Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer select-none py-1">
          <span className="font-extrabold text-slate-900">Check-in Baggage Included</span>
          <input
            type="checkbox"
            checked={checkinBaggageOnly}
            onChange={(e) => setCheckinBaggageOnly(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4 accent-emerald-600 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer select-none py-1">
          <span className="font-extrabold text-slate-900">Refundable Flights Only</span>
          <input
            type="checkbox"
            checked={refundableOnly}
            onChange={(e) => setRefundableOnly(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4 accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
