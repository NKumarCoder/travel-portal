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
    <div className="flex flex-col items-center gap-1.5 py-1">
      {/* Steering wheel */}
      <div className="relative flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-slate-50">
        <div className="h-1 w-1 rounded-full bg-slate-400" />
        {/* Spokes */}
        <div className="absolute inset-[4px] rounded-full border border-slate-300" />
      </div>

      {/* Driver label */}
      <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400">
        Driver
      </span>

      {/* Entry door */}
      <div className="flex h-5 w-4 items-center justify-center rounded-xs border border-dashed border-slate-300 bg-slate-50/80">
        <div className="h-2.5 w-[1.5px] rounded-full bg-slate-300" />
      </div>
      <span className="text-[6.5px] text-slate-400 font-medium">Door</span>
    </div>
  );
}
