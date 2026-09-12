"use client";

import React from "react";
import { User, Baby, Users } from "lucide-react";
import { FlightPassengerForm } from "./flight-passenger-form";
import type { FlightPassengerInfo, FlightPassportInfo } from "@/store/flight-booking-store";
import { cn } from "@/lib/utils";

export interface FlightPassengerCardProps {
  passenger: FlightPassengerInfo;
  index: number;
  onChange: (data: Partial<FlightPassengerInfo>) => void;
  onPassportChange: (data: Partial<FlightPassportInfo>) => void;
  isInternational: boolean;
  errors?: Record<string, string>;
  className?: string;
}

export function FlightPassengerCard({
  passenger,
  index,
  onChange,
  onPassportChange,
  isInternational,
  errors,
  className = "",
}: FlightPassengerCardProps) {
  const getPaxTypeLabel = () => {
    switch (passenger.paxType) {
      case "ADT":
        return `Adult ${passenger.paxIndex}`;
      case "CHD":
        return `Child ${passenger.paxIndex}`;
      case "INF":
        return `Infant ${passenger.paxIndex}`;
      default:
        return `Passenger ${index + 1}`;
    }
  };

  const getPaxBadgeColor = () => {
    switch (passenger.paxType) {
      case "ADT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "CHD":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "INF":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const IconComponent =
    passenger.paxType === "INF" ? Baby : passenger.paxType === "CHD" ? Users : User;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-md",
        errors && Object.keys(errors).length > 0 && "border-red-300 ring-1 ring-red-300/40",
        className
      )}
    >
      {/* Card Header Strip */}
      <div className="flex items-center gap-2.5 bg-slate-50/80 px-4 py-2.5 border-b border-slate-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
            {getPaxTypeLabel()}
          </h4>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold border",
              getPaxBadgeColor()
            )}
          >
            {passenger.paxType}
          </span>
        </div>
      </div>

      {/* Card Body containing Passenger Form */}
      <div className="p-3.5 sm:p-4">
        <FlightPassengerForm
          passenger={passenger}
          index={index}
          onChange={onChange}
          onPassportChange={onPassportChange}
          isInternational={isInternational}
          errors={errors}
        />
      </div>
    </div>
  );
}
