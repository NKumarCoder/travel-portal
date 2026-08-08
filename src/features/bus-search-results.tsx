"use client";

import React from "react";
import { BusCard } from "@/components/travel/bus-card";
import { SortBar } from "@/components/travel/sort-bar";
import { CompareDrawer } from "@/components/travel/compare-drawer";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useBusFilterStore, getTimeSlot } from "@/store/bus-filter-store";
import type { Bus } from "@/types";
import { Bus as BusIcon } from "lucide-react";

interface BusSearchResultsProps {
  buses: Bus[];
  isLoading: boolean;
  onModifySearch: () => void;
}

export function BusSearchResults({
  buses,
  isLoading,
  onModifySearch,
}: BusSearchResultsProps) {
  const { busType, departureTime, arrivalTime, priceRange, minRating, sortBy } =
    useBusFilterStore();

  // Apply filters and sorting
  const filteredBuses = React.useMemo(() => {
    let result = [...buses];

    // Bus type filter
    if (busType.length > 0) {
      result = result.filter((bus) =>
        busType.includes(bus.busType as (typeof busType)[number])
      );
    }

    // Departure time filter
    if (departureTime.length > 0) {
      result = result.filter((bus) =>
        departureTime.includes(getTimeSlot(bus.departure.time))
      );
    }

    // Arrival time filter
    if (arrivalTime.length > 0) {
      result = result.filter((bus) =>
        arrivalTime.includes(getTimeSlot(bus.arrival.time))
      );
    }

    // Price range filter
    result = result.filter(
      (bus) => bus.price >= priceRange[0] && bus.price <= priceRange[1]
    );

    // Rating filter
    if (minRating > 0) {
      result = result.filter((bus) => bus.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "departure":
        result.sort((a, b) => a.departure.time.localeCompare(b.departure.time));
        break;
      case "departure_late":
        result.sort((a, b) => b.departure.time.localeCompare(a.departure.time));
        break;
      case "duration":
        result.sort((a, b) => {
          const durationToMinutes = (d: string) => {
            const match = d.match(/(\d+)h\s*(\d+)?m?/);
            return match
              ? parseInt(match[1]) * 60 + (parseInt(match[2]) || 0)
              : 0;
          };
          return durationToMinutes(a.duration) - durationToMinutes(b.duration);
        });
        break;
    }

    return result;
  }, [buses, busType, departureTime, arrivalTime, priceRange, minRating, sortBy]);

  if (isLoading) {
    return <ListSkeleton count={5} />;
  }

  if (filteredBuses.length === 0) {
    if (buses.length > 0) {
      // Filters are too restrictive
      return (
        <EmptyState
          icon={<BusIcon className="h-8 w-8" />}
          title="No buses match your filters"
          description="Try adjusting your filter criteria to see more results."
          actionLabel="Reset Filters"
          onAction={onModifySearch}
        />
      );
    }
    return (
      <EmptyState
        icon={<BusIcon className="h-8 w-8" />}
        title="No buses available for the selected route"
        description="Try changing your search dates or select a different route."
        actionLabel="Modify Search"
        onAction={onModifySearch}
      />
    );
  }

  return (
    <div className="pb-24">
      {/* Sort bar - Sticky relative to results scroll container */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs pb-3 pt-0.5">
        <SortBar resultCount={filteredBuses.length} />
      </div>

      {/* Results list */}
      <div className="space-y-3.5">
        {filteredBuses.map((bus) => (
          <BusCard key={bus.id} bus={bus} />
        ))}
      </div>

      {/* Compare Drawer */}
      <CompareDrawer buses={buses} />
    </div>
  );
}

