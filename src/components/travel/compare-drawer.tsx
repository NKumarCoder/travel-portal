"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBusCompareStore } from "@/store/bus-compare-store";
import type { Bus } from "@/types";
import {
  X,
  Star,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompareDrawerProps {
  buses: Bus[];
}

export function CompareDrawer({ buses }: CompareDrawerProps) {
  const {
    compareIds,
    isCompareDrawerOpen,
    setCompareDrawerOpen,
    removeFromCompare,
    clearCompare,
  } = useBusCompareStore();

  const selectedBuses = React.useMemo(
    () => buses.filter((bus) => compareIds.includes(bus.id)),
    [buses, compareIds]
  );

  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Sticky bottom bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-lg transition-transform",
          isCompareDrawerOpen ? "translate-y-full" : "translate-y-0"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {compareIds.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              bus{compareIds.length > 1 ? "es" : ""} selected for comparison
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-xs text-gray-500"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setCompareDrawerOpen(true)}
              disabled={compareIds.length < 2}
              className="gap-1"
            >
              Compare
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Full compare overlay */}
      {isCompareDrawerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCompareDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl md:inset-x-4 md:bottom-4 md:rounded-2xl lg:inset-x-auto lg:left-1/2 lg:w-full lg:max-w-4xl lg:-translate-x-1/2">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Compare Buses
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompare}
                  className="gap-1 text-xs text-gray-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </Button>
                <button
                  onClick={() => setCompareDrawerOpen(false)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close comparison"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Compare content */}
            <div className="p-5">
              <CompareTable buses={selectedBuses} onRemove={removeFromCompare} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CompareTable({
  buses,
  onRemove,
}: {
  buses: Bus[];
  onRemove: (id: string) => void;
}) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
    return `$${price}`;
  };

  const rows: {
    label: string;
    render: (bus: Bus) => React.ReactNode;
  }[] = [
    {
      label: "Price",
      render: (bus) => (
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(bus.price, bus.currency)}
        </span>
      ),
    },
    {
      label: "Duration",
      render: (bus) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{bus.duration}</span>
        </div>
      ),
    },
    {
      label: "Rating",
      render: (bus) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{bus.rating}</span>
          <span className="text-xs text-gray-400">({bus.reviewCount})</span>
        </div>
      ),
    },
    {
      label: "Seats Available",
      render: (bus) => (
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span
            className={cn(
              "text-sm font-medium",
              bus.seatsAvailable <= 10 ? "text-orange-600" : "text-green-600"
            )}
          >
            {bus.seatsAvailable}
          </span>
        </div>
      ),
    },
    {
      label: "Bus Type",
      render: (bus) => (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase text-gray-600">
          {bus.busType.replace("_", " ")}
        </span>
      ),
    },
    {
      label: "Amenities",
      render: (bus) => (
        <div className="flex flex-wrap gap-1">
          {bus.amenities.map((a) => (
            <span
              key={a}
              className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-600"
            >
              {a}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "Departure",
      render: (bus) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{bus.departure.time}</p>
          <p className="text-xs text-gray-500">{bus.departure.city}</p>
        </div>
      ),
    },
    {
      label: "Arrival",
      render: (bus) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{bus.arrival.time}</p>
          <p className="text-xs text-gray-500">{bus.arrival.city}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="w-28 py-2 text-left text-xs font-medium text-gray-500" />
            {buses.map((bus) => (
              <th key={bus.id} className="px-3 py-2 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {bus.operator}
                    </p>
                    <p className="text-xs text-gray-500">
                      {bus.departure.city} → {bus.arrival.city}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(bus.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${bus.operator} from compare`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-gray-100">
              <td className="py-3 pr-3 text-xs font-medium text-gray-500">
                {row.label}
              </td>
              {buses.map((bus) => (
                <td key={bus.id} className="px-3 py-3">
                  {row.render(bus)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
