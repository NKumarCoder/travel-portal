"use client";

import React from "react";
import type { ParsedSeat, SeatUIStatus } from "./utils";

interface SeatTooltipProps {
  seat: ParsedSeat;
  effectiveStatus: SeatUIStatus;
}

/**
 * SeatTooltip — Floating tooltip that appears on seat hover.
 *
 * Displays:
 * - Seat number
 * - Fare
 * - Seat type (Seater/Sleeper)
 * - Position (Window/Aisle)
 * - Status
 * - Deck
 */
export function SeatTooltip({ seat, effectiveStatus }: SeatTooltipProps) {
  const typeLabel =
    seat.seatType === "seater"
      ? "Seater"
      : seat.seatType === "vertical_sleeper"
        ? "Sleeper"
        : "Sleeper";

  const positionLabel = seat.isWindow ? "Window" : "Aisle";
  const deckLabel = seat.deck === 0 ? "Lower Deck" : "Upper Deck";

  const statusLabels: Record<SeatUIStatus, string> = {
    available: "Available",
    booked: "Booked",
    selected: "Selected",
    ladies: "Ladies Only",
    blocked: "Blocked",
    partner_booked: "Partner Booked",
    reserved: "Reserved",
  };

  return (
    <div
      className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 animate-in fade-in-0 zoom-in-95 duration-150"
      role="tooltip"
    >
      <div className="rounded-xl border border-gray-200 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
        <div className="whitespace-nowrap text-center">
          <p className="text-xs font-bold text-gray-900">Seat {seat.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-blue-600">
            ₹{seat.fare.toLocaleString("en-IN")}
          </p>
          <div className="mt-1.5 space-y-0.5 text-[10px] text-gray-500">
            <p>{typeLabel} · {positionLabel}</p>
            <p>{statusLabels[effectiveStatus]}</p>
            <p>{deckLabel}</p>
          </div>
        </div>
      </div>
      {/* Arrow */}
      <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white" />
    </div>
  );
}
