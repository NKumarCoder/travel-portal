"use client";

import React from "react";
import type { NormalizedFlightResult } from "@/types";
import { Plane, Clock, Luggage, ArrowRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface FlightItineraryCardProps {
  onwardFlight: NormalizedFlightResult;
  returnFlight?: NormalizedFlightResult | null;
  className?: string;
}

export function FlightItineraryCard({
  onwardFlight,
  returnFlight,
  className,
}: FlightItineraryCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* 1. Onward Flight Itinerary */}
      <SingleFlightJourneyCard
        direction="ONWARD"
        flight={onwardFlight}
        accentColor="emerald"
      />

      {/* 2. Return Flight Itinerary (if round trip) */}
      {returnFlight && (
        <SingleFlightJourneyCard
          direction="RETURN"
          flight={returnFlight}
          accentColor="indigo"
        />
      )}
    </div>
  );
}

function SingleFlightJourneyCard({
  direction,
  flight,
  accentColor,
}: {
  direction: "ONWARD" | "RETURN";
  flight: NormalizedFlightResult;
  accentColor: "emerald" | "indigo";
}) {
  const isEmerald = accentColor === "emerald";
  const departureTerminal = "terminal" in flight.departure ? flight.departure.terminal : undefined;
  const arrivalTerminal = "terminal" in flight.arrival ? flight.arrival.terminal : undefined;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-200">
      {/* Top Direction Strip */}
      <div className="flex items-center justify-between bg-slate-50/90 px-4 py-2.5 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
              isEmerald
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 text-white"
            )}
          >
            {direction}
          </span>
          <span className="font-extrabold text-slate-900">
            {flight.airlineName} · {flight.flightNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {flight.class && (
            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full capitalize">
              {flight.class}
            </span>
          )}
          <span className="font-extrabold text-emerald-700 text-sm">
            {formatCurrency(flight.price, flight.currency)}
          </span>
        </div>
      </div>

      {/* Flight Timing & Route Body */}
      <div className="p-4">
        <div className="grid grid-cols-12 items-center gap-2">
          {/* Departure */}
          <div className="col-span-4 min-w-0">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none block">
              {flight.departure.time}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase block mt-1">
              {flight.departure.code}
            </span>
            <span className="text-[11px] text-slate-500 font-medium truncate block">
              {flight.departure.city}
            </span>
            {departureTerminal && (
              <span className="inline-block mt-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/80">
                {departureTerminal.replace("Terminal ", "T")}
              </span>
            )}
          </div>

          {/* Center Timeline */}
          <div className="col-span-4 text-center px-1 flex flex-col items-center justify-center min-w-0">
            <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>{flight.duration}</span>
            </span>
            <div className="relative flex items-center justify-center w-full my-1.5">
              <div className="h-[1.5px] w-full bg-slate-200" />
              <Plane className="h-3.5 w-3.5 text-slate-400 absolute fill-slate-100 rotate-90" />
            </div>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                flight.stops === 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              )}
            >
              {flight.stops === 0 ? "Non-stop" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
            </span>
            {flight.stopDetails && flight.stopDetails.length > 0 && (
              <span className="text-[9px] text-slate-500 font-medium truncate max-w-full block mt-0.5">
                {flight.stopDetails[0]}
              </span>
            )}
          </div>

          {/* Arrival */}
          <div className="col-span-4 text-right min-w-0">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none block">
              {flight.arrival.time}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase block mt-1">
              {flight.arrival.code}
            </span>
            <span className="text-[11px] text-slate-500 font-medium truncate block">
              {flight.arrival.city}
            </span>
            {arrivalTerminal && (
              <span className="inline-block mt-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/80">
                {arrivalTerminal.replace("Terminal ", "T")}
              </span>
            )}
          </div>
        </div>

        {/* Baggage & Refundability Strip */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-slate-600 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Luggage className="h-3.5 w-3.5 text-slate-400" />
              <span>Cabin: {flight.baggage?.cabin || "7 Kg"}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>Check-in: {flight.baggage?.checkin || "15 Kg"}</span>
          </div>

          <div>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold",
                flight.refundable
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {flight.refundable ? "Refundable" : "Non-Refundable"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
