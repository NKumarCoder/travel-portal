"use client";

import React from "react";

/**
 * DriverCabin — Vertically stacked driver area for horizontal bus layout.
 *
 * Positioned at the front-left of the bus (inside the curved nose section).
 * Contains steering wheel icon, driver label, and entry door indicator.
 */
export function DriverCabin() {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* Steering wheel */}
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50">
        <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        {/* Spokes */}
        <div className="absolute inset-[6px] rounded-full border border-gray-300" />
      </div>

      {/* Driver label */}
      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
        Driver
      </span>

      {/* Entry door */}
      <div className="flex h-6 w-5 items-center justify-center rounded-sm border border-dashed border-gray-300 bg-gray-50/80">
        <div className="h-3 w-[2px] rounded-full bg-gray-300" />
      </div>
      <span className="text-[7px] text-gray-300">Door</span>
    </div>
  );
}
