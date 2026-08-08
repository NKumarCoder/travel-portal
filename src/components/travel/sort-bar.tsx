"use client";

import { cn } from "@/lib/utils";
import { useBusFilterStore } from "@/store/bus-filter-store";
import { ArrowUpDown } from "lucide-react";

export type SortOption = {
  value: string;
  label: string;
};

const sortOptions: SortOption[] = [
  { value: "price_low", label: "Cheapest" },
  { value: "duration", label: "Fastest" },
  { value: "rating", label: "Highest Rated" },
  { value: "departure", label: "Earliest Departure" },
  { value: "departure_late", label: "Latest Departure" },
];

interface SortBarProps {
  resultCount: number;
  className?: string;
}

export function SortBar({ resultCount, className }: SortBarProps) {
  const { sortBy, setSortBy } = useBusFilterStore();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <ArrowUpDown className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          <strong className="font-bold text-slate-900">{resultCount}</strong>{" "}
          bus{resultCount !== 1 ? "es" : ""} found
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <span className="text-xs font-semibold text-slate-400 mr-1 hidden md:inline">Sort:</span>
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSortBy(option.value as typeof sortBy)}
            className={cn(
              "whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer",
              sortBy === option.value
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

