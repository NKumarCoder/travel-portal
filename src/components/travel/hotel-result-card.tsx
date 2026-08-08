"use client";

import React from "react";
import Image from "next/image";
import type { Hotel } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Wifi,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";

interface HotelResultCardProps {
  hotel: Hotel;
  nightsCount?: number;
  onSelect?: (hotel: Hotel) => void;
}

// Local Photorealistic Hotel Image Mapping
const HOTEL_IMAGE_MAP: Record<string, string> = {
  "ht-001": "/images/hotels/grand-horizon.png",
  "ht-002": "/images/hotels/urban-loft.png",
  "ht-003": "/images/hotels/mountain-lodge.png",
};

export function HotelResultCard({
  hotel,
  nightsCount = 1,
  onSelect,
}: HotelResultCardProps) {
  const imageSrc = HOTEL_IMAGE_MAP[hotel.id] || "/images/hero-hotel-cinematic.png";
  const totalPrice = hotel.pricePerNight * nightsCount;

  return (
    <Card className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col sm:flex-row">
      {/* 1. Left Property Photo (Desktop horizontal container) */}
      <div className="relative h-48 sm:h-auto sm:w-64 md:w-72 shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={imageSrc}
          alt={hotel.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, 280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

        {/* Star Rating Badge */}
        <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md shadow-xs border border-white/10">
          {"★".repeat(hotel.starRating)} {hotel.starRating}-Star Luxury
        </div>
      </div>

      {/* 2. Right Content & Pricing Pane */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Title & Guest Rating */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {hotel.name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>
                  {hotel.location.address}, {hotel.location.city}, {hotel.location.country}
                </span>
              </div>
            </div>

            {/* Guest Rating Score Badge */}
            <div className="flex items-center gap-1.5 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-right">
              <div>
                <p className="text-[11px] font-extrabold text-emerald-800 leading-tight">Excellent</p>
                <p className="text-[9px] text-slate-400 font-medium">{hotel.reviewCount || 1240} reviews</p>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-extrabold text-xs shadow-2xs">
                {hotel.rating}
              </div>
            </div>
          </div>

          {/* Amenities Badges */}
          <div className="my-3 flex flex-wrap gap-1.5">
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

          {/* Cancellation Policy Banner */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-emerald-600 mb-3">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{hotel.cancellationPolicy}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>No Prepayment Needed</span>
            </div>
          </div>
        </div>

        {/* Bottom Pricing & CTA Row */}
        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Per Night Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {formatCurrency(hotel.pricePerNight, hotel.currency)}
              </span>
              <span className="text-xs font-medium text-slate-500">/ night</span>
            </div>
            {nightsCount > 1 && (
              <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                Total for {nightsCount} nights:{" "}
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(totalPrice, hotel.currency)}
                </span>{" "}
                <span className="text-[10px] text-slate-400 font-normal">(incl. taxes & fees)</span>
              </p>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => onSelect?.(hotel)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 h-9 rounded-xl shadow-xs hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer gap-1.5"
          >
            <span>View Rooms</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
