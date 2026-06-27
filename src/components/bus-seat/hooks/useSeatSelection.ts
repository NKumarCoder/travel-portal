"use client";

import { useCallback, useMemo } from "react";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { isSelectable, type ParsedSeat } from "../utils";

/**
 * useSeatSelection — Manages seat selection state and interactions.
 *
 * Responsibilities:
 * - Read/write selected seats from the booking store
 * - Enforce max seat limit (6)
 * - Determine effective display status (selected override)
 * - Provide select/deselect/clear actions
 * - Compute fare totals from selection
 *
 * This hook connects the rendering engine to the booking store
 * without the engine knowing about Zustand directly.
 */

export interface UseSeatSelectionReturn {
  /** Currently selected seat IDs */
  selectedIds: Set<string>;
  /** Maximum seats allowed */
  maxSeats: number;
  /** Whether max capacity is reached */
  isMaxReached: boolean;
  /** Count of selected seats */
  selectedCount: number;
  /** Toggle a seat (select if available, deselect if selected) */
  toggleSeat: (seat: ParsedSeat) => void;
  /** Check if a specific seat is selected */
  isSeatSelected: (seatId: string) => boolean;
  /** Check if a seat can be interacted with */
  canSelect: (seat: ParsedSeat) => boolean;
  /** Clear all selections */
  clearSelection: () => void;
  /** Total fare of selected seats */
  totalFare: number;
  /** Selected seats as array */
  selectedSeats: ParsedSeat[];
}

/**
 * Adapter: convert ParsedSeat to the Seat type used by the booking store.
 */
function toStoreSeat(seat: ParsedSeat) {
  return {
    seatNo: seat.name,
    status: seat.status === "ladies" ? ("female-only" as const) : (seat.status as "available" | "booked" | "blocked"),
    price: seat.fare,
    position: seat.isWindow ? ("window" as const) : ("aisle" as const),
    row: seat.y,
    col: seat.x,
    deck: seat.deck === 0 ? ("lower" as const) : ("upper" as const),
    seatType: seat.seatType === "seater" ? ("seater" as const) : ("sleeper" as const),
  };
}

export function useSeatSelection(allSeats: ParsedSeat[]): UseSeatSelectionReturn {
  const { selectedSeats: storeSeats, toggleSeat: storeToggle, clearSeats, maxSeats } =
    useBusBookingStore();

  // Build a Set of selected seat names for O(1) lookup
  const selectedIds = useMemo(
    () => new Set(storeSeats.map((s) => s.seatNo)),
    [storeSeats]
  );

  const selectedCount = selectedIds.size;
  const isMaxReached = selectedCount >= maxSeats;

  const isSeatSelected = useCallback(
    (seatId: string) => selectedIds.has(seatId),
    [selectedIds]
  );

  const canSelect = useCallback(
    (seat: ParsedSeat) => {
      // Already selected → can deselect
      if (selectedIds.has(seat.name)) return true;
      // Can't select if max reached
      if (isMaxReached) return false;
      // Must be in a selectable status
      return isSelectable(seat.status);
    },
    [selectedIds, isMaxReached]
  );

  const toggleSeat = useCallback(
    (seat: ParsedSeat) => {
      if (!canSelect(seat)) return;
      storeToggle(toStoreSeat(seat));
    },
    [canSelect, storeToggle]
  );

  const clearSelection = useCallback(() => {
    clearSeats();
  }, [clearSeats]);

  // Compute total fare from selected seats
  const totalFare = useMemo(() => {
    return storeSeats.reduce((sum, s) => sum + s.price, 0);
  }, [storeSeats]);

  // Map back to ParsedSeat for consumers that need the full object
  const selectedSeatsArray = useMemo(() => {
    return allSeats.filter((s) => selectedIds.has(s.name));
  }, [allSeats, selectedIds]);

  return {
    selectedIds,
    maxSeats,
    isMaxReached,
    selectedCount,
    toggleSeat,
    isSeatSelected,
    canSelect,
    clearSelection,
    totalFare,
    selectedSeats: selectedSeatsArray,
  };
}
