"use client";

import { cn } from "@/lib/utils";

const legendItems = [
  { label: "Available", colorClass: "bg-white border-green-400" },
  { label: "Booked", colorClass: "bg-gray-200 border-gray-300" },
  { label: "Selected", colorClass: "bg-blue-600 border-blue-700" },
  { label: "Female", colorClass: "bg-pink-50 border-pink-400" },
  { label: "Blocked", colorClass: "bg-gray-100 border-gray-200" },
];

export function SeatLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-4 w-4 rounded border-2",
              item.colorClass
            )}
          />
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
