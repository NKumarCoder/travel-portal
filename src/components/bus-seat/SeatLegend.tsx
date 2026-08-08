"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LegendItem {
  label: string;
  bg: string;
  border: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { label: "Available", bg: "bg-white", border: "border-green-400" },
  { label: "Selected", bg: "bg-blue-600", border: "border-blue-700" },
  { label: "Booked", bg: "bg-gray-100", border: "border-gray-300" },
  { label: "Ladies", bg: "bg-pink-50", border: "border-pink-400" },
  { label: "Blocked", bg: "bg-gray-200", border: "border-gray-400" },
];

interface SeatLegendProps {
  className?: string;
}

/**
 * SeatLegend — Color key for seat statuses.
 * Uses the same color scheme as SeatCard for consistency.
 */
export function SeatLegend({ className }: SeatLegendProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-3 w-3 rounded-xs border-[1.5px]",
              item.bg,
              item.border
            )}
          />
          <span className="text-[10px] font-medium text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
