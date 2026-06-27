"use client";

import type { Package } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Calendar, Compass } from "lucide-react";

interface PackageCardProps {
  pkg: Package;
  onSelect?: (pkg: Package) => void;
}

export function PackageCard({ pkg, onSelect }: PackageCardProps) {
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-purple-100 to-indigo-200">
        <div className="absolute inset-0 flex items-center justify-center text-indigo-300">
          <Compass className="h-12 w-12" />
        </div>
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            {discount}% OFF
          </div>
        )}
        {/* Category badge */}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-800 backdrop-blur-sm">
          {pkg.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 text-base font-semibold text-gray-900">{pkg.name}</h3>

        <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {pkg.destination.city}, {pkg.destination.country}
          </span>
        </div>

        {/* Stats row */}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{pkg.rating}</span>
            <span className="text-gray-400">({pkg.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {pkg.duration.nights}N / {pkg.duration.days}D
            </span>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {pkg.highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
            >
              {highlight}
            </span>
          ))}
          {pkg.highlights.length > 3 && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              +{pkg.highlights.length - 3} more
            </span>
          )}
        </div>

        {/* Price & action */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-3">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(pkg.price, pkg.currency)}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(pkg.originalPrice, pkg.currency)}
              </p>
              <p className="text-xs text-gray-500">per person</p>
            </div>
          </div>
          <Button size="sm" onClick={() => onSelect?.(pkg)}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
