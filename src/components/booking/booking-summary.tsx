"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBusBookingStore } from "@/store/bus-booking-store";
import type { Bus } from "@/types";
import {
  Bus as BusIcon,
  MapPin,
  Clock,
  Calendar,
  Armchair,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BookingSummaryProps {
  bus: Bus;
  className?: string;
}

export function BookingSummary({ bus, className }: BookingSummaryProps) {
  const {
    selectedSeats,
    boardingPoint,
    droppingPoint,
    getBaseFare,
    getTaxes,
    getConvenienceFee,
    getTotalAmount,
  } = useBusBookingStore();

  const baseFare = getBaseFare();
  const taxes = getTaxes();
  const convenienceFee = getConvenienceFee();
  const total = getTotalAmount();

  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Booking Summary</h3>
      </div>

      <div className="space-y-4 p-4">
        {/* Operator */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50">
            <BusIcon className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{bus.operator}</p>
            <p className="text-xs text-gray-500 capitalize">{bus.busType.replace("_", " ")}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-700">{bus.departure.city}</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-700">{bus.arrival.city}</span>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Calendar className="h-3 w-3 text-gray-400" />
            {bus.departure.date}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="h-3 w-3 text-gray-400" />
            {bus.departure.time} - {bus.arrival.time}
          </div>
        </div>

        {/* Seats */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-500">
            <Armchair className="h-3 w-3" />
            Selected Seats ({selectedSeats.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedSeats.map((seat) => (
              <span
                key={seat.seatNo}
                className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
              >
                {seat.seatNo}
              </span>
            ))}
          </div>
        </div>

        {/* Boarding & Dropping */}
        {boardingPoint && (
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
            <span className="text-gray-600">
              Board: {boardingPoint.name} ({boardingPoint.time})
            </span>
          </div>
        )}
        {droppingPoint && (
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            <span className="text-gray-600">
              Drop: {droppingPoint.name} ({droppingPoint.time})
            </span>
          </div>
        )}

        {/* Fare breakdown */}
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""})</span>
            <span className="text-gray-700">₹{baseFare.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Taxes (5%)</span>
            <span className="text-gray-700">₹{taxes.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Convenience Fee</span>
            <span className="text-gray-700">₹{convenienceFee.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile collapsible version
export function MobileBookingSummary({ bus }: { bus: Bus }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { getTotalAmount, selectedSeats } = useBusBookingStore();
  const total = getTotalAmount();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <BusIcon className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            {bus.operator} · {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          <BookingSummaryContent bus={bus} />
        </div>
      )}
    </div>
  );
}

function BookingSummaryContent({ bus }: { bus: Bus }) {
  const {
    selectedSeats,
    boardingPoint,
    droppingPoint,
    getBaseFare,
    getTaxes,
    getConvenienceFee,
    getTotalAmount,
  } = useBusBookingStore();

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2 text-gray-600">
        <span>{bus.departure.city} → {bus.arrival.city}</span>
        <span>·</span>
        <span>{bus.departure.time} - {bus.arrival.time}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {selectedSeats.map((s) => (
          <span key={s.seatNo} className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
            {s.seatNo}
          </span>
        ))}
      </div>
      {boardingPoint && <p className="text-gray-500">Board: {boardingPoint.name}</p>}
      {droppingPoint && <p className="text-gray-500">Drop: {droppingPoint.name}</p>}
      <div className="flex justify-between pt-2 text-sm font-semibold">
        <span>Total</span>
        <span>₹{getTotalAmount().toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
