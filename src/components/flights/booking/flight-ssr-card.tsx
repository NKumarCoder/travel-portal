"use client";

import React from "react";
import { Coffee, Luggage, Armchair, Sparkles } from "lucide-react";
import type { FlightPassengerInfo, FlightSSRSelection } from "@/store/flight-booking-store";

interface FlightSSRCardProps {
  passengers: FlightPassengerInfo[];
  ssrSelections: Record<string, FlightSSRSelection>;
  onChange: (passengerId: string, data: Partial<FlightSSRSelection>) => void;
  className?: string;
}

const BAGGAGE_OPTIONS = [
  "Standard Included (7 Kg Cabin + 15 Kg Check-in)",
  "Extra 5 Kg Check-in (₹1,500)",
  "Extra 10 Kg Check-in (₹3,000)",
  "Extra 15 Kg Check-in (₹4,500)",
];

const MEAL_OPTIONS = [
  "No Meal Preference",
  "Vegetarian Meal (Complimentary / Standard)",
  "Non-Vegetarian Meal (Complimentary / Standard)",
  "Jain Meal (Special Request)",
  "Diabetic Meal (Special Request)",
];

const SEAT_OPTIONS = [
  "Free / Auto-assigned at check-in",
  "Window Seat Preference",
  "Aisle Seat Preference",
  "Front Rows Preference",
];

export function FlightSSRCard({
  passengers,
  ssrSelections,
  onChange,
  className = "",
}: FlightSSRCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs ${className}`}
    >
      {/* Card Header */}
      <div className="mb-3 border-b border-slate-100 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Travel Extras & Special Requests (SSR)
            </h3>
            <p className="text-[11px] text-slate-400">
              Customize baggage, meal preferences, and seat requests per passenger
            </p>
          </div>
        </div>
      </div>

      {/* Per-Passenger SSR Rows */}
      <div className="space-y-3">
        {passengers.map((passenger) => {
          const ssr = ssrSelections[passenger.id] || {};
          const isInfant = passenger.paxType === "INF";

          return (
            <div
              key={passenger.id}
              className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs"
            >
              {/* Passenger Tag */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800">
                    {passenger.title ? `${passenger.title}. ` : ""}
                    {passenger.firstName || `Passenger ${passenger.paxIndex}`}{" "}
                    {passenger.lastName}
                  </span>
                  <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[9px] font-extrabold text-slate-600 uppercase">
                    {passenger.paxType}
                  </span>
                </div>
              </div>

              {isInfant ? (
                <p className="text-[11px] text-slate-400 italic">
                  Infant travels on lap. Standard 7 Kg infant baggage is included with accompanying adult.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Baggage Selection */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Luggage className="h-3 w-3 text-slate-400" />
                      <span>Baggage</span>
                    </label>
                    <select
                      value={ssr.baggage || BAGGAGE_OPTIONS[0]}
                      onChange={(e) => onChange(passenger.id, { baggage: e.target.value })}
                      className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      {BAGGAGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Meal Selection */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Coffee className="h-3 w-3 text-slate-400" />
                      <span>Meal Preference</span>
                    </label>
                    <select
                      value={ssr.meal || MEAL_OPTIONS[0]}
                      onChange={(e) => onChange(passenger.id, { meal: e.target.value })}
                      className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      {MEAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seat Selection */}
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Armchair className="h-3 w-3 text-slate-400" />
                      <span>Seat Selection</span>
                    </label>
                    <select
                      value={ssr.seat || SEAT_OPTIONS[0]}
                      onChange={(e) => onChange(passenger.id, { seat: e.target.value })}
                      className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                    >
                      {SEAT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
