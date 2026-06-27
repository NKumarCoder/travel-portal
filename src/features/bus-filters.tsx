"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useBusFilterStore,
  type BusTypeFilter,
  type DepartureTimeFilter,
  type ArrivalTimeFilter,
} from "@/store/bus-filter-store";
import { ChevronDown, ChevronUp, RotateCcw, Star } from "lucide-react";

// ===== Collapsible Section =====
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
        aria-expanded={isOpen}
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ===== Checkbox Item =====
function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ===== Bus Filters Panel =====
export function BusFilters({ className }: { className?: string }) {
  const {
    busType,
    departureTime,
    arrivalTime,
    priceRange,
    minRating,
    toggleBusType,
    toggleDepartureTime,
    toggleArrivalTime,
    setPriceRange,
    setMinRating,
    resetFilters,
  } = useBusFilterStore();

  const busTypeOptions: { value: BusTypeFilter; label: string }[] = [
    { value: "ac", label: "AC" },
    { value: "non_ac", label: "Non-AC" },
    { value: "sleeper", label: "Sleeper" },
    { value: "semi_sleeper", label: "Semi Sleeper" },
    { value: "seater", label: "Seater" },
  ];

  const timeOptions: { value: DepartureTimeFilter; label: string; desc: string }[] = [
    { value: "early_morning", label: "Early Morning", desc: "12am - 6am" },
    { value: "morning", label: "Morning", desc: "6am - 12pm" },
    { value: "afternoon", label: "Afternoon", desc: "12pm - 5pm" },
    { value: "evening", label: "Evening", desc: "5pm - 9pm" },
    { value: "night", label: "Night", desc: "9pm - 12am" },
  ];

  const ratingOptions = [4.5, 4.0, 3.5, 3.0];

  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-4", className)}>
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-xs">
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Bus Type */}
      <FilterSection title="Bus Type">
        <div className="space-y-0.5">
          {busTypeOptions.map((opt) => (
            <FilterCheckbox
              key={opt.value}
              label={opt.label}
              checked={busType.includes(opt.value)}
              onChange={() => toggleBusType(opt.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Departure Time */}
      <FilterSection title="Departure Time">
        <div className="space-y-0.5">
          {timeOptions.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={departureTime.includes(opt.value as DepartureTimeFilter)}
                onChange={() => toggleDepartureTime(opt.value as DepartureTimeFilter)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{opt.label}</span>
                <span className="text-xs text-gray-400">({opt.desc})</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Arrival Time */}
      <FilterSection title="Arrival Time">
        <div className="space-y-0.5">
          {timeOptions.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 py-1.5">
              <input
                type="checkbox"
                checked={arrivalTime.includes(opt.value as ArrivalTimeFilter)}
                onChange={() => toggleArrivalTime(opt.value as ArrivalTimeFilter)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">{opt.label}</span>
                <span className="text-xs text-gray-400">({opt.desc})</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-blue-600"
            aria-label="Maximum price"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Min</label>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="mt-0.5 h-8 w-full rounded border border-gray-300 px-2 text-xs focus:border-blue-500 focus:outline-none"
                min={0}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Max</label>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                className="mt-0.5 h-8 w-full rounded border border-gray-300 px-2 text-xs focus:border-blue-500 focus:outline-none"
                max={5000}
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-1">
          {ratingOptions.map((rating) => (
            <label key={rating} className="flex cursor-pointer items-center gap-2.5 py-1.5">
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-700">{rating}+</span>
              </div>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
            <input
              type="radio"
              name="rating"
              checked={minRating === 0}
              onChange={() => setMinRating(0)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Any rating</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
}
