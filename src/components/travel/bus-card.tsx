"use client";

import React from "react";
import type { Bus } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AmenitiesGrid } from "@/components/travel/amenities-grid";
import { BusDetailsTabs } from "@/components/travel/bus-details-tabs";
import { FavoriteButton } from "@/components/travel/favorite-button";
import { useBusCompareStore } from "@/store/bus-compare-store";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { debugLog } from "@/lib/debug";
import { cn } from "@/lib/utils";
import {
  Bus as BusIcon,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Users,
  ArrowRight,
} from "lucide-react";

interface BusCardProps {
  bus: Bus;
}

export function BusCard({ bus }: BusCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { compareIds, toggleCompare } = useBusCompareStore();
  const { openSeatModal } = useBusBookingStore();
  const isInCompare = compareIds.includes(bus.id);
  const canAddMore = compareIds.length < 3;

  const formatPrice = (price: number, currency: string) => {
    if (currency === "INR") return `₹${price.toLocaleString("en-IN")}`;
    return `$${price}`;
  };

  const isAc = bus.busType.toLowerCase().includes("ac");
  const isSleeper = bus.busType.toLowerCase().includes("sleeper");

  return (
    <Card
      className={cn(
        "p-0 rounded-2xl border border-slate-200/90 bg-white transition-all duration-200 hover:shadow-md hover:border-slate-300 relative overflow-hidden",
        isInCompare && "ring-2 ring-emerald-500 border-emerald-500"
      )}
    >
      {/* Main card content */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Operator info + Badges */}
          <div className="flex items-start justify-between lg:w-52">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100/80">
                <BusIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900">
                  {bus.operator}
                </p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {/* Semantic Bus Type Pill */}
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
                      isAc && isSleeper
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : isAc
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                    )}
                  >
                    {bus.busType.replace("_", " ")}
                  </span>

                  {/* Rating Badge */}
                  {bus.rating > 0 && (
                    <div className="flex items-center gap-0.5 rounded bg-amber-50 px-1 py-0.5 text-amber-700">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold">{bus.rating}</span>
                      {bus.reviewCount > 0 && (
                        <span className="text-[10px] text-amber-600/80">
                          ({bus.reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite button (mobile layout) */}
            <div className="lg:hidden">
              <FavoriteButton busId={bus.id} />
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="flex flex-1 items-center justify-between gap-3 px-1 lg:justify-center lg:gap-6">
            {/* Departure */}
            <div className="text-left lg:text-center">
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                {bus.departure.time}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 max-w-[110px] truncate">
                {bus.departure.city}
              </p>
            </div>

            {/* Journey Line & Duration */}
            <div className="flex flex-col items-center flex-1 max-w-[140px]">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <Clock className="h-3 w-3 text-slate-400" />
                {bus.duration}
              </div>
              <div className="my-1 flex items-center w-full justify-center">
                <div className="h-[2px] w-full bg-slate-200" />
                <div className="h-2 w-2 rounded-full border-2 border-emerald-500 bg-white shrink-0 -mx-1" />
                <div className="h-[2px] w-full bg-slate-200" />
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right lg:text-center">
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                {bus.arrival.time}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 max-w-[110px] truncate">
                {bus.arrival.city}
              </p>
            </div>
          </div>

          {/* Price & CTA Block */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 lg:w-44 lg:flex-col lg:items-end lg:gap-2 lg:border-t-0 lg:pt-0">
            <div className="hidden lg:block">
              <FavoriteButton busId={bus.id} />
            </div>

            <div className="text-left lg:text-right">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Starting from
              </span>
              <p className="text-xl font-extrabold text-slate-900">
                {formatPrice(bus.price, bus.currency)}
              </p>
            </div>

            <Button
              size="sm"
              className="gap-1.5 px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs hover:shadow-emerald-600/20 transition-all cursor-pointer"
              onClick={() => {
                openSeatModal(bus);
                debugLog("SELECT_SEATS_CLICKED", {
                  busId: bus.id,
                  operator: bus.operator,
                  route: `${bus.departure.city} → ${bus.arrival.city}`,
                  price: bus.price,
                  seatsAvailable: bus.seatsAvailable,
                });
              }}
            >
              Select Seats
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer Info Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          {/* Left: Compare checkbox & Amenities */}
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={isInCompare}
                onChange={() => toggleCompare(bus.id)}
                disabled={!isInCompare && !canAddMore}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs font-medium text-slate-600">
                {isInCompare ? "Added to compare" : "Compare"}
              </span>
            </label>

            {bus.amenities && bus.amenities.length > 0 && (
              <>
                <div className="hidden h-3.5 w-px bg-slate-200 sm:block" />
                <AmenitiesGrid amenities={bus.amenities} maxVisible={3} />
              </>
            )}
          </div>

          {/* Right: Seats Left + View Details */}
          <div className="flex items-center gap-3.5 ml-auto sm:ml-0">
            <span className="flex items-center gap-1 text-xs">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {bus.seatsAvailable <= 10 ? (
                <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  {bus.seatsAvailable} seats left
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {bus.seatsAvailable} available
                </span>
              )}
            </span>

            <div className="h-3.5 w-px bg-slate-200" />

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              {isExpanded ? "Hide Details" : "View Details"}
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="border-t border-slate-100 px-4 pb-4 sm:px-5 sm:pb-5 bg-slate-50/50">
          <BusDetailsTabs bus={bus} />
        </div>
      )}
    </Card>
  );
}

