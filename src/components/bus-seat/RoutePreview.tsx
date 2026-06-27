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
    <div className={cn("flex flex-col items-center justify-center gap-1 py-4", className)}>
      {/* Source */}
      <div className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-green-600" />
        <span className="text-[11px] font-semibold text-gray-700 max-w-[80px] truncate">{source || "Source"}</span>
      </div>

      {/* Connector line with bus */}
      <div className="relative flex flex-col items-center">
        <div className="h-6 w-[2px] bg-gradient-to-b from-green-400 to-gray-300" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
          <Bus className="h-3 w-3 text-blue-600" />
        </div>
        <div className="h-6 w-[2px] bg-gradient-to-b from-gray-300 to-blue-400" />
      </div>

      {/* Destination */}
      <div className="flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-[11px] font-semibold text-gray-700 max-w-[80px] truncate">{destination || "Destination"}</span>
      </div>
    </div>
  );
}
