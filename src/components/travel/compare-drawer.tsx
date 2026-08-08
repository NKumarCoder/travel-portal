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
  Trash2,
  GitCompare,
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
          "fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-900 text-white shadow-xl rounded-t-2xl transition-transform duration-200",
          isCompareDrawerOpen ? "translate-y-full" : "translate-y-0"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-xs">
              {compareIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              bus{compareIds.length > 1 ? "es" : ""} selected for comparison
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setCompareDrawerOpen(true)}
              disabled={compareIds.length < 2}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <GitCompare className="h-3.5 w-3.5" />
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setCompareDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl border border-slate-200 md:inset-x-4 md:bottom-4 md:rounded-2xl lg:inset-x-auto lg:left-1/2 lg:w-full lg:max-w-4xl lg:-translate-x-1/2">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Compare Buses ({selectedBuses.length})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompare}
                  className="gap-1 text-xs text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </Button>
                <button
                  onClick={() => setCompareDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
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
        <span className="text-lg font-extrabold text-slate-900">
          {formatPrice(bus.price, bus.currency)}
        </span>
      ),
    },
    {
      label: "Duration",
      render: (bus) => (
        <div className="flex items-center gap-1 text-slate-700">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold">{bus.duration}</span>
        </div>
      ),
    },
    {
      label: "Rating",
      render: (bus) => (
        <div className="flex items-center gap-1 text-slate-700">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold">{bus.rating}</span>
          <span className="text-[10px] text-slate-400">({bus.reviewCount})</span>
        </div>
      ),
    },
    {
      label: "Seats Available",
      render: (bus) => (
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span
            className={cn(
              "text-xs font-bold",
              bus.seatsAvailable <= 10 ? "text-amber-700" : "text-emerald-700"
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
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 border border-slate-200">
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
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
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
          <p className="text-sm font-bold text-slate-900">{bus.departure.time}</p>
          <p className="text-xs text-slate-500">{bus.departure.city}</p>
        </div>
      ),
    },
    {
      label: "Arrival",
      render: (bus) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{bus.arrival.time}</p>
          <p className="text-xs text-slate-500">{bus.arrival.city}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr>
            <th className="w-28 py-2 text-left text-xs font-bold uppercase tracking-wider text-slate-400" />
            {buses.map((bus) => (
              <th key={bus.id} className="px-3 py-2 text-left">
                <div className="flex items-start justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {bus.operator}
                    </p>
                    <p className="text-xs text-slate-500">
                      {bus.departure.city} → {bus.arrival.city}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(bus.id)}
                    className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
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
            <tr key={row.label} className="border-t border-slate-100">
              <td className="py-3 pr-3 text-xs font-bold uppercase tracking-wider text-slate-500">
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

