"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Bus } from "lucide-react";

interface RoutePreviewProps {
  source: string;
  destination: string;
  className?: string;
}

/**
 * RoutePreview — Compact source → destination visualization.
 *
 * Displayed between Boarding and Dropping columns.
 * Vertical layout with bus icon on the connector line.
 */
export function RoutePreview({ source, destination, className }: RoutePreviewProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-0.5 py-0.5", className)}>
      {/* Source */}
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3 text-emerald-600" />
        <span className="text-[10px] font-bold text-slate-700 max-w-[85px] truncate">{source || "Source"}</span>
      </div>

      {/* Connector line with bus */}
      <div className="relative flex flex-col items-center my-0.5">
        <div className="h-2.5 w-[1.5px] bg-emerald-400" />
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs">
          <Bus className="h-2.5 w-2.5 text-emerald-600" />
        </div>
        <div className="h-2.5 w-[1.5px] bg-blue-400" />
      </div>

      {/* Destination */}
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3 text-blue-600" />
        <span className="text-[10px] font-bold text-slate-700 max-w-[85px] truncate">{destination || "Destination"}</span>
      </div>
    </div>
  );
}
