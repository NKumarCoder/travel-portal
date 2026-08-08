"use client";

import React from "react";
import { Bus as BusIcon, MapPin, Calendar, Clock, Armchair, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface JourneySummaryCardProps {
  operator: string;
  type: string;
  source: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  boardingPoint: { name: string; time: string; address?: string } | null;
  droppingPoint: { name: string; time: string; address?: string } | null;
  seats: string[];
  className?: string;
}

export function JourneySummaryCard({
  operator,
  type,
  source,
  destination,
  date,
  departureTime,
  arrivalTime,
  boardingPoint,
  droppingPoint,
  seats,
  className,
}: JourneySummaryCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-150 bg-gradient-to-r from-white to-gray-50/30 p-5 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Route and Operator details */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 border border-green-150">
              <BusIcon className="h-5 w-5 text-green-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">{operator}</h3>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{type.replace("_", " ")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm font-semibold text-gray-800">
            <span className="flex items-center gap-1.5 rounded-lg bg-gray-100/80 px-2.5 py-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              {source}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="flex items-center gap-1.5 rounded-lg bg-gray-100/80 px-2.5 py-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              {destination}
            </span>
          </div>
        </div>

        {/* Center Side: Date & Time details */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 md:border-t-0 md:pt-0 md:flex md:gap-6">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              Journey Date
            </span>
            <p className="text-sm font-bold text-gray-800">{date}</p>
          </div>

          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Timings
            </span>
            <p className="text-sm font-bold text-gray-800">
              {departureTime} <span className="text-gray-400 font-normal">→</span> {arrivalTime}
            </p>
          </div>
        </div>

        {/* Right Side: Seat selection info */}
        <div className="border-t border-gray-100 pt-4 md:border-t-0 md:pt-0">
          <div className="rounded-xl bg-blue-50/60 border border-blue-100/50 p-3 flex items-center gap-3">
            <Armchair className="h-5 w-5 text-blue-600" />
            <div>
              <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Selected Seats ({seats.length})
              </span>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {seats.map((seat) => (
                  <span
                    key={seat}
                    className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Boarding and Dropping points detail section */}
      {(boardingPoint || droppingPoint) && (
        <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
          {boardingPoint && (
            <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-600 mb-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Boarding Point · {boardingPoint.time}
              </div>
              <p className="text-sm font-bold text-gray-800">{boardingPoint.name}</p>
              {boardingPoint.address && (
                <p className="mt-1 text-xs text-gray-500 leading-normal">{boardingPoint.address}</p>
              )}
            </div>
          )}

          {droppingPoint && (
            <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Dropping Point · {droppingPoint.time}
              </div>
              <p className="text-sm font-bold text-gray-800">{droppingPoint.name}</p>
              {droppingPoint.address && (
                <p className="mt-1 text-xs text-gray-500 leading-normal">{droppingPoint.address}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
