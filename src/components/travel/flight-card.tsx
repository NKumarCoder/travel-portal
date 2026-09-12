"use client";

import React, { useState } from "react";
import type { Flight, NormalizedFlightResult } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plane,
  Luggage,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Calendar,
} from "lucide-react";

interface FlightCardProps {
  flight: Flight | NormalizedFlightResult;
  isSelected?: boolean;
  onSelect?: (flight: Flight | NormalizedFlightResult) => void;
}

export function FlightCard({ flight, isSelected, onSelect }: FlightCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const airlineName = "airlineName" in flight ? flight.airlineName : flight.airline;
  const airlineCode = "airlineCode" in flight ? flight.airlineCode : "";
  const stopDetails = "stopDetails" in flight && flight.stopDetails ? flight.stopDetails : [];
  const segments = "segments" in flight && Array.isArray(flight.segments) ? flight.segments : [];
  const flightFares = "flightFares" in flight && Array.isArray(flight.flightFares) ? flight.flightFares : [];
  const baseFare = "baseFare" in flight ? flight.baseFare : 0;
  const taxFare = "taxFare" in flight ? flight.taxFare : 0;
  const fareType = "fareType" in flight ? flight.fareType : "";
  const bookingClass = "bookingClass" in flight ? flight.bookingClass : "";

  const hasConnectingLayovers = stopDetails.length > 0;

  return (
    <Card
      onClick={() => onSelect?.(flight)}
      className={cn(
        "group overflow-hidden rounded-2xl border bg-white p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-slate-900",
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/20 shadow-emerald-500/10"
          : "border-slate-200/90 hover:border-emerald-300"
      )}
    >
      {/* ─── 1. Header: Airline Info (Left) + Price & Select Action (Right) ─── */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Left: Airline Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Plane className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                {airlineName}
              </h3>
              {fareType && (
                <span className="hidden sm:inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                  {fareType}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-400 truncate">
              {flight.flightNumber}
              {airlineCode && !flight.flightNumber.startsWith(airlineCode) ? ` (${airlineCode})` : ""}
            </p>
          </div>
        </div>

        {/* Right: Fare & Prominent Select Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight block leading-tight">
              {formatCurrency(flight.price, flight.currency)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">per traveler</span>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(flight);
            }}
            className={cn(
              "font-extrabold text-xs px-3.5 h-8 sm:h-9 rounded-xl shadow-xs transition-all duration-200 cursor-pointer gap-1 shrink-0",
              isSelected
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/30"
                : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/20"
            )}
          >
            {isSelected ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Selected</span>
              </>
            ) : (
              <>
                <span>Select</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── 2. Flight Journey Timeline (Full Card Width) ─── */}
      <div className="grid grid-cols-12 items-center my-3.5 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
        {/* Departure Column (Left 4 cols) */}
        <div className="col-span-4 text-left min-w-0 pr-1">
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {flight.departure.time}
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase mt-0.5">
            {flight.departure.code}
          </p>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {flight.departure.city}
          </p>
          {flight.departure.terminal && (
            <span className="inline-block mt-0.5 text-[9px] font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
              {flight.departure.terminal.replace("Terminal ", "T")}
            </span>
          )}
        </div>

        {/* Center Timeline / Route Graphic (Center 4 cols) */}
        <div className="col-span-4 text-center px-1 flex flex-col items-center justify-center min-w-0">
          <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{flight.duration}</span>
          </span>

          {/* Visual Flight Path */}
          <div className="my-1.5 flex items-center w-full max-w-[120px]">
            <div className="h-0.5 flex-1 bg-slate-300" />
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shrink-0 mx-1 shadow-2xs">
              <Plane className="h-3 w-3 rotate-90" />
            </div>
            <div className="h-0.5 flex-1 bg-slate-300" />
          </div>

          <span
            className={cn(
              "inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
              flight.stops === 0
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : "bg-amber-50 text-amber-800 border-amber-200/80"
            )}
          >
            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
          </span>

          {hasConnectingLayovers && (
            <span className="text-[9px] text-amber-700 font-bold mt-1 text-center truncate max-w-full block">
              {stopDetails[0]}
            </span>
          )}
        </div>

        {/* Arrival Column (Right 4 cols) */}
        <div className="col-span-4 text-right min-w-0 pl-1">
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
            {flight.arrival.time}
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase mt-0.5">
            {flight.arrival.code}
          </p>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {flight.arrival.city}
          </p>
          {flight.arrival.terminal && (
            <span className="inline-block mt-0.5 text-[9px] font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
              {flight.arrival.terminal.replace("Terminal ", "T")}
            </span>
          )}
        </div>
      </div>

      {/* ─── 3. Amenities, Baggage & Refundability Footer ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Left: Baggage & Cabin Class */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1">
            <Luggage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Cabin: {flight.baggage?.cabin || "7 Kg"}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Luggage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Check-in: {flight.baggage?.checkin || "15 Kg"}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="capitalize font-bold text-slate-700">
            {flight.class ? flight.class.replace("_", " ") : "Economy"}
          </span>
          {bookingClass && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-slate-500">Class {bookingClass}</span>
            </>
          )}
        </div>

        {/* Right: Refundability, Seats Left & Expand Button */}
        <div className="flex items-center gap-2 shrink-0">
          {flight.refundable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              Refundable
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              <ShieldAlert className="h-3 w-3 text-slate-400" />
              Non-Refundable
            </span>
          )}

          {flight.seatsAvailable <= 5 && (
            <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
              Only {flight.seatsAvailable} left
            </span>
          )}

          {/* Expand Flight Details Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen((prev) => !prev);
            }}
            className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 ml-1 cursor-pointer"
          >
            <span>{isDetailsOpen ? "Hide" : "Details"}</span>
            {isDetailsOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* ─── 4. Expandable Drawer: Segment Breakdown & Fare Details ─── */}
      {isDetailsOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 animate-in fade-in-50 duration-150 text-xs"
        >
          {/* Segments breakdown */}
          {segments.length > 0 ? (
            <div className="space-y-2">
              <span className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider block">
                Flight Segments ({segments.length})
              </span>
              <div className="space-y-2">
                {segments.map((seg, idx) => (
                  <div
                    key={`${seg.segId}-${idx}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-emerald-600 text-white px-1.5 py-0.2 text-[9px] font-black">
                          Leg {idx + 1}
                        </span>
                        <span>{seg.airlineName}</span>
                        <span className="text-slate-400 font-normal">({seg.flightNumber})</span>
                      </div>
                      <span className="text-slate-500 font-medium text-[11px]">
                        {seg.durationFormatted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <div>
                        <span className="font-bold">{seg.departureTime}</span>{" "}
                        <span className="font-semibold">{seg.origin}</span>
                        {seg.departureTerminal ? ` (${seg.departureTerminal})` : ""}
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <div>
                        <span className="font-bold">{seg.arrivalTime}</span>{" "}
                        <span className="font-semibold">{seg.destination}</span>
                        {seg.arrivalTerminal ? ` (${seg.arrivalTerminal})` : ""}
                      </div>
                    </div>

                    {/* Layover banner after this segment */}
                    {idx < segments.length - 1 && stopDetails[idx] && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200/60 p-1.5 text-[10px] font-bold text-amber-800 text-center">
                        {stopDetails[idx]} · Change of aircraft
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Fare Breakdown Grid */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
            <span className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider block mb-1.5">
              Fare Breakdown
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block font-medium">Base Fare</span>
                <span className="font-extrabold text-slate-800">
                  {formatCurrency(baseFare, flight.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Taxes & Surcharges</span>
                <span className="font-extrabold text-slate-800">
                  {formatCurrency(taxFare, flight.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Net Fare</span>
                <span className="font-black text-emerald-700">
                  {formatCurrency(flight.price, flight.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

