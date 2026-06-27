"use client";

import { cn } from "@/lib/utils";
import { useBusFilterStore } from "@/store/bus-filter-store";

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
        "flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{resultCount}</span>{" "}
        bus{resultCount !== 1 ? "es" : ""} found
      </p>

      <div className="flex items-center gap-1 overflow-x-auto">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSortBy(option.value as typeof sortBy)}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              sortBy === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
