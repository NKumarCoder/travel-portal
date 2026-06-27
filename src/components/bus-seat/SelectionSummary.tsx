"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { Button } from "@/components/ui/button";
import type { BusBoardingPoint } from "@/types";

interface SelectionSummaryProps {
  busId: string;
  onContinue: () => void;
  className?: string;
}

/**
 * SelectionSummary — Sticky right panel showing live selection state.
 *
 * Displays:
 * - Selected seats with remove buttons
 * - Fare breakdown (base, GST, convenience fee)
 * - Boarding/dropping selection summary
 * - Total amount
 * - Continue button (disabled until valid)
 *
 * Updates live as the user interacts.
 */
export function SelectionSummary({ busId, onContinue, className }: SelectionSummaryProps) {
  const {
    selectedSeats,
    boardingPoint,
    droppingPoint,
    removeSeat,
    getBaseFare,
    getTaxes,
    getConvenienceFee,
    getTotalAmount,
    isValid,
  } = useBusBookingStore();

  const baseFare = getBaseFare();
  const taxes = getTaxes();
  const convenienceFee = getConvenienceFee();
  const total = getTotalAmount();
  const valid = isValid();

  return (
    <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-3.5">
        <h3 className="text-sm font-bold text-gray-900">Booking Summary</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Selected seats */}
        {selectedSeats.length > 0 ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Seats ({selectedSeats.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSeats.map((seat) => (
                <span
                  key={seat.seatNo}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100"
                >
                  {seat.seatNo}
                  <button
                    type="button"
                    onClick={() => removeSeat(seat.seatNo)}
                    className="rounded-full p-0.5 hover:bg-blue-200"
                    aria-label={`Remove seat ${seat.seatNo}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-xs text-gray-400">Select seats to continue</p>
          </div>
        )}

        {/* Fare breakdown */}
        {selectedSeats.length > 0 && (
          <div className="space-y-2.5 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Fare</span>
              <span className="font-medium text-gray-800">₹{baseFare.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">GST (5%)</span>
              <span className="font-medium text-gray-800">₹{taxes.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Convenience Fee</span>
              <span className="font-medium text-gray-800">₹{convenienceFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2.5">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}

        {/* Boarding/Dropping summary */}
        {(boardingPoint || droppingPoint) && (
          <div className="space-y-1.5 border-t border-gray-100 pt-4">
            {boardingPoint && (
              <PointSummaryRow color="green" label="Board" point={boardingPoint} />
            )}
            {droppingPoint && (
              <PointSummaryRow color="blue" label="Drop" point={droppingPoint} />
            )}
          </div>
        )}

        {/* Validation hints */}
        {selectedSeats.length > 0 && !valid && (
          <div className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11px] text-amber-700 border border-amber-100">
            {!boardingPoint && <p>• Select a boarding point</p>}
            {!droppingPoint && <p>• Select a dropping point</p>}
          </div>
        )}

        {/* Continue button */}
        <Button
          className="w-full h-11 text-sm font-semibold"
          disabled={!valid}
          onClick={onContinue}
        >
          Continue Booking
        </Button>
      </div>
    </div>
  );
}

function PointSummaryRow({
  color,
  label,
  point,
}: {
  color: "green" | "blue";
  label: string;
  point: BusBoardingPoint;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={cn(
        "h-2 w-2 shrink-0 rounded-full",
        color === "green" ? "bg-green-500" : "bg-blue-500"
      )} />
      <span className="text-gray-600 truncate">
        <span className="font-medium">{label}:</span> {point.name} ({point.time})
      </span>
    </div>
  );
}
