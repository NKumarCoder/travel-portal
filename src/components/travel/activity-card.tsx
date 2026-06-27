"use client";

import type { Activity } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Users, Mountain } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  onSelect?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onSelect }: ActivityCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="relative h-44 w-full bg-gradient-to-br from-emerald-100 to-teal-200">
        <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
          <Mountain className="h-12 w-12" />
        </div>
        {/* Category badge */}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-800 backdrop-blur-sm">
          {activity.category}
        </div>
        {/* Difficulty badge */}
        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium capitalize text-white backdrop-blur-sm">
          {activity.difficulty}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 text-base font-semibold text-gray-900">{activity.name}</h3>

        <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {activity.location.venue}, {activity.location.city}
          </span>
        </div>

        {/* Stats row */}
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{activity.rating}</span>
            <span className="text-gray-400">({activity.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>Max {activity.maxGroupSize}</span>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {activity.highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
            >
              {highlight}
            </span>
          ))}
        </div>

        {/* Price & action */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-3">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(activity.price, activity.currency)}
            </p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
          <Button size="sm" onClick={() => onSelect?.(activity)}>
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );
}
