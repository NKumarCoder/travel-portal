"use client";

import type { Flight } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Luggage, ShieldCheck, ArrowRight } from "lucide-react";

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300">
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
        {/* 1. Airline Info Block */}
        <div className="flex items-center gap-3 md:w-52 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Plane className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {flight.airline}
            </h3>
            <p className="text-xs font-semibold text-slate-400">{flight.flightNumber}</p>
          </div>
        </div>

        {/* 2. Flight Timeline Center Block */}
        <div className="flex flex-1 items-center justify-between gap-3 md:justify-center px-2">
          {/* Departure Time & Code */}
          <div className="text-left md:text-right min-w-[70px]">
            <p className="text-lg font-black text-slate-900 tracking-tight leading-none">
              {flight.departure.time}
            </p>
            <p className="mt-1 text-xs font-extrabold text-slate-600 uppercase">
              {flight.departure.code}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[90px] hidden sm:block">
              {flight.departure.city}
            </p>
          </div>

          {/* Timeline Graphic & Duration */}
          <div className="flex flex-col items-center px-2 flex-1 max-w-[180px]">
            <span className="text-[11px] font-bold text-slate-500">{flight.duration}</span>
            <div className="my-1.5 flex items-center w-full">
              <div className="h-0.5 flex-1 bg-slate-200" />
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-600 shrink-0 mx-1">
                <Plane className="h-3 w-3 rotate-90" />
              </div>
              <div className="h-0.5 flex-1 bg-slate-200" />
            </div>
            <span className="inline-block text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
              {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Arrival Time & Code */}
          <div className="text-right min-w-[70px]">
            <p className="text-lg font-black text-slate-900 tracking-tight leading-none">
              {flight.arrival.time}
            </p>
            <p className="mt-1 text-xs font-extrabold text-slate-600 uppercase">
              {flight.arrival.code}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[90px] hidden sm:block">
              {flight.arrival.city}
            </p>
          </div>
        </div>

        {/* 3. Price & Action CTA Block */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 md:border-t-0 md:pt-0 md:flex-col md:items-end md:justify-center md:w-44 shrink-0">
          <div className="text-left md:text-right">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(flight.price, flight.currency)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">per person</span>
          </div>
          <Button
            size="sm"
            onClick={() => onSelect?.(flight)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 h-9 rounded-xl shadow-xs hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer gap-1.5"
          >
            <span>Select</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 4. Footer Metadata Row */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/90 pt-2.5">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Luggage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Cabin: {flight.baggage.cabin}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <Luggage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Check-in: {flight.baggage.checkin}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="capitalize font-bold text-slate-700">
            {flight.class.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {flight.refundable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              Refundable
            </span>
          )}
          {flight.seatsAvailable <= 5 && (
            <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
              Only {flight.seatsAvailable} seats left
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
