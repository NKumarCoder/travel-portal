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

  return (
    <Card className={cn("p-0 transition-shadow hover:shadow-md", isInCompare && "ring-2 ring-blue-500")}>
      {/* Main card content */}
      <div className="p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Operator info + Favorite */}
          <div className="flex items-start justify-between md:w-48">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <BusIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {bus.operator}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                    {bus.busType.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {bus.rating}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({bus.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Favorite - visible on mobile next to operator */}
            <div className="md:hidden">
              <FavoriteButton busId={bus.id} />
            </div>
          </div>

          {/* Route & Time */}
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-center md:gap-4">
            {/* Departure */}
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {bus.departure.time}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 md:max-w-[120px] md:truncate">
                {bus.departure.city}
              </p>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center px-2">
              <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <Clock className="h-3 w-3" />
                {bus.duration}
              </div>
              <div className="my-1.5 flex items-center">
                <div className="h-[2px] w-8 bg-gray-300 md:w-14" />
                <div className="h-2 w-2 rounded-full border-2 border-green-500 bg-white" />
                <div className="h-[2px] w-8 bg-gray-300 md:w-14" />
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {bus.arrival.time}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 md:max-w-[120px] md:truncate">
                {bus.arrival.city}
              </p>
            </div>
          </div>

          {/* Price & Favorite (desktop) */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 md:w-40 md:flex-col md:items-end md:gap-1.5 md:border-t-0 md:pt-0">
            <div className="hidden md:block">
              <FavoriteButton busId={bus.id} />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(bus.price, bus.currency)}
              </p>
              <p className="text-[10px] text-gray-500">per seat</p>
            </div>
            <Button size="sm" className="mt-1" onClick={() => {
              openSeatModal(bus);
              debugLog("SELECT_SEATS_CLICKED", {
                busId: bus.id,
                operator: bus.operator,
                route: `${bus.departure.city} → ${bus.arrival.city}`,
                price: bus.price,
                seatsAvailable: bus.seatsAvailable,
              });
            }}>
              Select Seats
            </Button>
          </div>
        </div>

        {/* Footer: Amenities, seats, compare, expand */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          {/* Amenities preview */}
          <AmenitiesGrid amenities={bus.amenities} maxVisible={3} />

          {/* Seats available */}
          <span className="ml-auto flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            {bus.seatsAvailable <= 10 ? (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                {bus.seatsAvailable} seats left
              </span>
            ) : (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
                {bus.seatsAvailable} available
              </span>
            )}
          </span>
        </div>

        {/* Compare checkbox + View Details */}
        <div className="mt-3 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isInCompare}
              onChange={() => toggleCompare(bus.id)}
              disabled={!isInCompare && !canAddMore}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="text-xs text-gray-600">
              {isInCompare ? "Added to compare" : "Compare"}
            </span>
          </label>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
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

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 pb-4 md:px-5 md:pb-5">
          <BusDetailsTabs bus={bus} />
        </div>
      )}
    </Card>
  );
}
