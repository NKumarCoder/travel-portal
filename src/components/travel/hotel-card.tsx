"use client";

import type { Hotel } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Wifi, Waves } from "lucide-react";

interface HotelCardProps {
  hotel: Hotel;
  onSelect?: (hotel: Hotel) => void;
}

export function HotelCard({ hotel, onSelect }: HotelCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <Waves className="h-12 w-12" />
        </div>
        {/* Star rating badge */}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 backdrop-blur-sm">
          {"★".repeat(hotel.starRating)} {hotel.starRating}-Star
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{hotel.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {hotel.location.city}, {hotel.location.country}
              </span>
            </div>
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">{hotel.rating}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {amenity === "WiFi" && <Wifi className="h-3 w-3" />}
              {amenity}
            </span>
          ))}
          {hotel.amenities.length > 4 && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              +{hotel.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Price & action */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-3">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(hotel.pricePerNight, hotel.currency)}
            </p>
            <p className="text-xs text-gray-500">per night</p>
          </div>
          <Button size="sm" onClick={() => onSelect?.(hotel)}>
            View Rooms
          </Button>
        </div>

        {/* Cancellation policy */}
        <p className="mt-2 text-xs text-green-600">{hotel.cancellationPolicy}</p>
      </div>
    </Card>
  );
}
