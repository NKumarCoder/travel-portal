"use client";

import type { Hotel } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Wifi, CheckCircle2, Building2 } from "lucide-react";
import Image from "next/image";

interface HotelCardProps {
  hotel: Hotel;
  onSelect?: (hotel: Hotel) => void;
}

// Local Photorealistic Hotel Image Mapping
const HOTEL_IMAGE_MAP: Record<string, string> = {
  "ht-001": "/images/hotels/grand-horizon.png",
  "ht-002": "/images/hotels/urban-loft.png",
  "ht-003": "/images/hotels/mountain-lodge.png",
};

export function HotelCard({ hotel, onSelect }: HotelCardProps) {
  const imageSrc = HOTEL_IMAGE_MAP[hotel.id] || "/images/hero-hotel-cinematic.png";

  return (
    <Card className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Property Photography Header */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
          <Image
            src={imageSrc}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Star Rating Badge */}
          <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md shadow-xs border border-white/10">
            {"★".repeat(hotel.starRating)} {hotel.starRating}-Star Luxury
          </div>

          {/* Guest Score Badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs">
            <Star className="h-3 w-3 fill-white text-white" />
            <span>{hotel.rating} Excellent</span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5">
          <div className="mb-2.5">
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {hotel.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {hotel.location.city}, {hotel.location.country}
              </span>
            </div>
          </div>

          {/* Amenities Badges */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100/90 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/50"
              >
                {amenity === "WiFi" && <Wifi className="h-3 w-3 text-slate-400" />}
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100/80 mt-auto">
        <div className="flex items-end justify-between pt-3">
          <div>
            <p className="text-xs text-slate-400 font-medium">Starting from</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(hotel.pricePerNight, hotel.currency)}
              <span className="text-xs font-semibold text-slate-500 ml-1">/ night</span>
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onSelect?.(hotel)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 rounded-xl shadow-xs hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer"
          >
            View Rooms
          </Button>
        </div>

        {/* Free Cancellation Banner */}
        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{hotel.cancellationPolicy}</span>
        </div>
      </div>
    </Card>
  );
}

