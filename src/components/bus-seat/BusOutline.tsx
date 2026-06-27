"use client";

import React from "react";
import { DriverCabin } from "./DriverCabin";

interface BusOutlineProps {
  children: React.ReactNode;
}

/**
 * BusOutline — Horizontal bus body layout (left-to-right travel direction).
 *
 * Structure:
 * ┌─────────┬────────────────────────────────────────────┐
 * │  FRONT  │                                            │
 * │ Driver  │         Passenger Seating Area             │  → REAR
 * │  Door   │                                            │
 * └─────────┴────────────────────────────────────────────┘
 *
 * - Rounded left side (bus nose)
 * - Driver cabin at front-left
 * - Seat grid fills the passenger area
 * - REAR indicator on the right
 * - Horizontal travel direction: left → right
 */
export function BusOutline({ children }: BusOutlineProps) {
  return (
    <div className="relative">
      <div className="flex overflow-hidden rounded-l-[2rem] rounded-r-2xl border border-gray-200 bg-white shadow-sm">
        {/* ═══ Front Section (driver + nose) ═══ */}
        <div className="flex shrink-0 flex-col items-center justify-between border-r border-gray-200 bg-gradient-to-r from-gray-50 to-white px-2 py-3">
          {/* Front label */}
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Front
          </span>

          {/* Driver cabin */}
          <DriverCabin />

          {/* Spacer */}
          <div />
        </div>

        {/* ═══ Passenger Seating Area ═══ */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-3">
          {children}
        </div>

        {/* ═══ Rear Section ═══ */}
        <div className="flex shrink-0 flex-col items-center justify-center border-l border-gray-100 bg-gray-50/50 px-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.15em] text-gray-400 [writing-mode:vertical-lr] rotate-180">
            Rear
          </span>
        </div>
      </div>
    </div>
  );
}
