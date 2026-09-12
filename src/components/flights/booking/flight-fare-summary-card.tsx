"use client";

import React from "react";
import { Plane, Lock, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NormalizedFlightResult } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

interface FlightFareSummaryCardProps {
  onwardFlight: NormalizedFlightResult;
  returnFlight?: NormalizedFlightResult | null;
  baseFare: number;
  taxes: number;
  extras: number;
  totalAmount: number;
  agreeTerms: boolean;
  onAgreeTermsChange: (agreed: boolean) => void;
  onProceed: () => void;
  isProcessing: boolean;
  termsError?: string;
  className?: string;
}

export function FlightFareSummaryCard({
  onwardFlight,
  returnFlight,
  baseFare,
  taxes,
  extras,
  totalAmount,
  agreeTerms,
  onAgreeTermsChange,
  onProceed,
  isProcessing,
  termsError,
  className = "",
}: FlightFareSummaryCardProps) {
  const isRoundTrip = !!returnFlight;

  return (
    <div className={cn("space-y-3", className)}>
      {/* 1. Quick Journey Details Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Plane className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Journey Details
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {isRoundTrip ? "Round Trip" : "One Way"}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Onward Flight Mini Itinerary */}
          <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-200/60">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="rounded bg-emerald-600 px-1.5 py-0.2 text-[9px] font-black text-white uppercase">
                Onward
              </span>
              <span className="text-slate-600">
                {onwardFlight.airlineName} · {onwardFlight.flightNumber}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between font-extrabold text-slate-900 text-xs">
              <span>
                {onwardFlight.departure.code} ({onwardFlight.departure.time})
              </span>
              <span className="text-slate-400 font-normal">→</span>
              <span>
                {onwardFlight.arrival.code} ({onwardFlight.arrival.time})
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500">
              <span>{onwardFlight.departure.date}</span>
              <span>{onwardFlight.duration}</span>
            </div>
          </div>

          {/* Return Flight Mini Itinerary */}
          {returnFlight && (
            <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-200/60">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="rounded bg-indigo-600 px-1.5 py-0.2 text-[9px] font-black text-white uppercase">
                  Return
                </span>
                <span className="text-slate-600">
                  {returnFlight.airlineName} · {returnFlight.flightNumber}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between font-extrabold text-slate-900 text-xs">
                <span>
                  {returnFlight.departure.code} ({returnFlight.departure.time})
                </span>
                <span className="text-slate-400 font-normal">→</span>
                <span>
                  {returnFlight.arrival.code} ({returnFlight.arrival.time})
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>{returnFlight.departure.date}</span>
                <span>{returnFlight.duration}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Fare Summary Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        <h3 className="mb-2.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Fare Summary
        </h3>

        <div className="space-y-2 text-xs">
          {/* Base Fare */}
          <div className="flex justify-between">
            <span className="text-slate-500">Base Fare</span>
            <span className="font-semibold text-slate-800">
              ₹{baseFare.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Taxes & Airline Fees */}
          <div className="flex justify-between">
            <span className="text-slate-500">Taxes & Surcharges</span>
            <span className="font-semibold text-slate-800">
              ₹{taxes.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Travel Extras (SSR add-ons) */}
          {extras > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Travel Extras (Baggage/Meals)</span>
              <span className="font-bold">+₹{extras.toLocaleString("en-IN")}</span>
            </div>
          )}

          {/* Total Amount */}
          <div className="flex justify-between border-t border-slate-200/80 pt-2 text-sm font-extrabold text-slate-900 mt-1">
            <span>Total Payable</span>
            <span className="text-emerald-700 text-base">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Terms & Conditions Checkbox */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => onAgreeTermsChange(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4 accent-emerald-600 cursor-pointer shrink-0"
          />
          <span className="text-[11px] text-slate-600 leading-tight">
            I agree to the airline{" "}
            <span className="text-slate-900 font-bold underline">Fare Rules</span>,{" "}
            <span className="text-slate-900 font-bold underline">Terms & Conditions</span>, and privacy policy.
          </span>
        </label>
        {termsError && (
          <p className="mt-1 text-[11px] font-medium text-red-600" role="alert">
            {termsError}
          </p>
        )}
      </div>

      {/* 4. Desktop Payment Action Button */}
      <Button
        size="lg"
        className="w-full h-11 gap-2 text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
        onClick={onProceed}
        disabled={isProcessing}
      >
        {isProcessing ? (
          "Please wait..."
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Continue to Payment →
          </>
        )}
      </Button>

      {/* 5. Trust / Secure Checkout Card */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center text-xs">
        <div className="flex items-center justify-center gap-1 text-emerald-700 font-extrabold mb-0.5">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Safe & Secure Booking</span>
        </div>
        <p className="text-[10px] text-slate-500">
          Your passenger details are securely transmitted using standard 256-bit encryption.
        </p>
      </div>
    </div>
  );
}
