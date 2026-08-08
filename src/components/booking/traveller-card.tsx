"use client";

import React from "react";
import { User } from "lucide-react";
import { TravellerForm } from "./traveller-form";
import type { TravellerInfo } from "@/store/bus-booking-store";

export interface TravellerCardProps {
  index: number;
  seatNo: string;
  data: TravellerInfo;
  onChange: (data: Partial<TravellerInfo>) => void;
  showErrors?: boolean;
  className?: string;
}

export function TravellerCard({
  index,
  seatNo,
  data,
  onChange,
  showErrors = false,
  className = "",
}: TravellerCardProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-md ${className}`}>
      {/* Card Header Strip */}
      <div className="flex items-center gap-2.5 bg-slate-50/80 px-4 py-2.5 border-b border-slate-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
          <User className="h-4 w-4" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
            Traveller {index + 1}
          </h4>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200/80">
            Seat {seatNo}
          </span>
        </div>
      </div>

      {/* Card Body containing Form */}
      <div className="p-3.5 sm:p-4">
        <TravellerForm
          index={index}
          data={data}
          onChange={onChange}
          showErrors={showErrors}
        />
      </div>
    </div>
  );
}
