"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { debugLog, debugValidation, debugNavigation } from "@/lib/debug";
import { Button } from "@/components/ui/button";
import { ChevronUp, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FareSummaryProps {
  busId: string;
  className?: string;
}

export function FareSummary({ busId, className }: FareSummaryProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
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

  const handleContinue = () => {
    if (valid) {
      setIsProcessing(true);
      debugLog("CONTINUE_BOOKING", {
        busId,
        selectedSeats: selectedSeats.map((s) => s.seatNo),
        boardingPoint: boardingPoint?.name,
        droppingPoint: droppingPoint?.name,
        totalAmount: total,
      }, "success");
      debugNavigation(`/buses/${busId}`, `/buses/${encodeURIComponent(busId)}/travellers`);
      router.push(`/buses/${encodeURIComponent(busId)}/travellers`);
    } else {
      const reasons: string[] = [];
      if (selectedSeats.length === 0) reasons.push("No seats selected");
      if (!boardingPoint) reasons.push("No boarding point selected");
      if (!droppingPoint) reasons.push("No dropping point selected");
      debugValidation(reasons.join(", "), { selectedSeats: selectedSeats.length, boardingPoint: !!boardingPoint, droppingPoint: !!droppingPoint });
    }
  };

  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)}>
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Fare Summary</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Selected seats */}
        {selectedSeats.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">
              Selected Seats ({selectedSeats.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedSeats.map((seat) => (
                <span
                  key={seat.seatNo}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {seat.seatNo}
                  <button
                    type="button"
                    onClick={() => removeSeat(seat.seatNo)}
                    className="rounded-full p-0.5 hover:bg-blue-100"
                    aria-label={`Remove seat ${seat.seatNo}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No seats selected</p>
        )}

        {/* Fare breakdown */}
        {selectedSeats.length > 0 && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Fare ({selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""})</span>
              <span className="font-medium text-gray-900">₹{baseFare.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Taxes (5%)</span>
              <span className="font-medium text-gray-900">₹{taxes.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Convenience Fee</span>
              <span className="font-medium text-gray-900">₹{convenienceFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}

        {/* Boarding/Dropping summary */}
        {(boardingPoint || droppingPoint) && (
          <div className="space-y-1 border-t border-gray-100 pt-3">
            {boardingPoint && (
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-600">Board: {boardingPoint.name} ({boardingPoint.time})</span>
              </div>
            )}
            {droppingPoint && (
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-gray-600">Drop: {droppingPoint.name} ({droppingPoint.time})</span>
              </div>
            )}
          </div>
        )}

        {/* Validation hints */}
        {selectedSeats.length > 0 && !valid && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {!boardingPoint && <p>• Select a boarding point</p>}
            {!droppingPoint && <p>• Select a dropping point</p>}
          </div>
        )}

        {/* Continue button */}
        <Button
          className="w-full"
          disabled={!valid || isProcessing}
          onClick={handleContinue}
        >
          {isProcessing ? "Please wait..." : "Continue Booking"}
        </Button>
      </div>
    </div>
  );
}

// Mobile bottom sticky fare summary
export function MobileFareSummary({ busId }: { busId: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const router = useRouter();
  const { selectedSeats, getTotalAmount, isValid, boardingPoint, droppingPoint } = useBusBookingStore();
  const total = getTotalAmount();
  const valid = isValid();

  if (selectedSeats.length === 0) return null;

  const handleContinue = () => {
    if (valid) {
      setIsProcessing(true);
      debugLog("CONTINUE_BOOKING_MOBILE", {
        busId,
        selectedSeats: selectedSeats.map((s) => s.seatNo),
        boardingPoint: boardingPoint?.name,
        droppingPoint: droppingPoint?.name,
        totalAmount: total,
      }, "success");
      router.push(`/buses/${encodeURIComponent(busId)}/travellers`);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-lg lg:hidden">
      {/* Expanded panel */}
      {expanded && (
        <div className="max-h-[50vh] overflow-y-auto border-b border-gray-100 px-4 py-3">
          <FareSummaryContent busId={busId} />
        </div>
      )}

      {/* Sticky bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-500"
          >
            <ChevronUp className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
            {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}
          </button>
          <p className="text-lg font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</p>
        </div>
        <Button
          disabled={!valid || isProcessing}
          onClick={handleContinue}
        >
          {isProcessing ? "Please wait..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function FareSummaryContent({ busId }: { busId: string }) {
  const { selectedSeats, boardingPoint, droppingPoint, getBaseFare, getTaxes, getConvenienceFee } =
    useBusBookingStore();

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap gap-1">
        {selectedSeats.map((s) => (
          <span key={s.seatNo} className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            {s.seatNo}
          </span>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Base Fare</span>
        <span>₹{getBaseFare().toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Taxes</span>
        <span>₹{getTaxes().toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Convenience Fee</span>
        <span>₹{getConvenienceFee().toLocaleString("en-IN")}</span>
      </div>
      {boardingPoint && (
        <p className="text-xs text-gray-500">Board: {boardingPoint.name}</p>
      )}
      {droppingPoint && (
        <p className="text-xs text-gray-500">Drop: {droppingPoint.name}</p>
      )}
    </div>
  );
}
