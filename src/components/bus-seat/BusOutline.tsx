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
      <div className="flex overflow-hidden rounded-l-2xl rounded-r-2xl border border-slate-200 bg-white shadow-xs">
        {/* ═══ Front Section (driver + nose) ═══ */}
        <div className="flex shrink-0 flex-col items-center justify-between border-r border-slate-200 bg-gradient-to-r from-slate-50 to-white px-1.5 py-2">
          {/* Front label */}
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Front
          </span>

          {/* Driver cabin */}
          <DriverCabin />

          {/* Spacer */}
          <div />
        </div>

        {/* ═══ Passenger Seating Area ═══ */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-2 py-2">
          {children}
        </div>

        {/* ═══ Rear Section ═══ */}
        <div className="flex shrink-0 flex-col items-center justify-center border-l border-slate-100 bg-slate-50/60 px-1.5">
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[6.5px] font-bold uppercase tracking-[0.15em] text-slate-400 [writing-mode:vertical-lr] rotate-180">
            Rear
          </span>
        </div>
      </div>
    </div>
  );
}
