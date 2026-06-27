"use client";

import { cn } from "@/lib/utils";
import {
  Wifi,
  BatteryCharging,
  Droplets,
  Wind,
  BookOpen,
  MapPin,
  DoorOpen,
  Armchair,
  Tv,
  Cookie,
  Blinds,
} from "lucide-react";

const amenityIconMap: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  "USB Charging": <BatteryCharging className="h-4 w-4" />,
  "Charging Point": <BatteryCharging className="h-4 w-4" />,
  "Water Bottle": <Droplets className="h-4 w-4" />,
  AC: <Wind className="h-4 w-4" />,
  "Reading Light": <BookOpen className="h-4 w-4" />,
  "GPS Tracking": <MapPin className="h-4 w-4" />,
  "Emergency Exit": <DoorOpen className="h-4 w-4" />,
  "Reclining Seats": <Armchair className="h-4 w-4" />,
  "Entertainment System": <Tv className="h-4 w-4" />,
  Snacks: <Cookie className="h-4 w-4" />,
  Blanket: <Wind className="h-4 w-4" />,
  Pillow: <Wind className="h-4 w-4" />,
  Curtains: <Blinds className="h-4 w-4" />,
};

interface AmenitiesGridProps {
  amenities: string[];
  maxVisible?: number;
  showAll?: boolean;
  className?: string;
}

export function AmenitiesGrid({
  amenities,
  maxVisible = 4,
  showAll = false,
  className,
}: AmenitiesGridProps) {
  const visible = showAll ? amenities : amenities.slice(0, maxVisible);
  const remaining = amenities.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visible.map((amenity) => (
        <span
          key={amenity}
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600"
        >
          <span className="text-gray-400">
            {amenityIconMap[amenity] || <Wind className="h-4 w-4" />}
          </span>
          {amenity}
        </span>
      ))}
      {!showAll && remaining > 0 && (
        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
          +{remaining} More
        </span>
      )}
    </div>
  );
}

export function AmenitiesFullGrid({ amenities }: { amenities: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {amenities.map((amenity) => (
        <div
          key={amenity}
          className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
        >
          <span className="text-green-600">
            {amenityIconMap[amenity] || <Wind className="h-4 w-4" />}
          </span>
          <span className="text-sm text-gray-700">{amenity}</span>
        </div>
      ))}
    </div>
  );
}
