"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBusBookingStore } from "@/store/bus-booking-store";
import type { BusSeatLayout, Seat, SeatDeck, DeckType } from "@/types";

interface SeatLayoutProps {
  layout: BusSeatLayout;
  onSeatClick?: (seat: Seat) => void;
}

export function SeatLayout({ layout, onSeatClick }: SeatLayoutProps) {
  const [activeDeck, setActiveDeck] = React.useState<DeckType>("lower");
  const hasMultiDecks = layout.decks.length > 1;

  const currentDeck = layout.decks.find((d) => d.deck === activeDeck) || layout.decks[0];

  return (
    <div className="w-full">
      {/* Deck switcher */}
      {hasMultiDecks && (
        <div className="mb-4 flex gap-2">
          {layout.decks.map((deck) => (
            <button
              key={deck.deck}
              type="button"
              onClick={() => setActiveDeck(deck.deck)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeDeck === deck.deck
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {deck.deck === "lower" ? "Lower Deck" : "Upper Deck"}
            </button>
          ))}
        </div>
      )}

      {/* Seat grid */}
      <DeckGrid deck={currentDeck} layoutType={layout.layoutType} onSeatClick={onSeatClick} />
    </div>
  );
}

function DeckGrid({
  deck,
  layoutType,
  onSeatClick,
}: {
  deck: SeatDeck;
  layoutType: string;
  onSeatClick?: (seat: Seat) => void;
}) {
  const { selectedSeats, maxSeats } = useBusBookingStore();
  const selectedSeatNos = selectedSeats.map((s) => s.seatNo);
  const isSleeper = layoutType === "sleeper";

  // Group seats by row
  const rows: Seat[][] = [];
  for (let r = 0; r < deck.rows; r++) {
    rows.push(deck.seats.filter((s) => s.row === r));
  }

  // For seater layouts with 4 cols: 2 + aisle + 2
  // For seater layouts with 5 cols: 3 + aisle + 2
  // For sleeper layouts with 3 cols: 1 + aisle + 2 (single berth left, double right)
  const getGapIndex = () => {
    if (isSleeper) return 1; // gap after col 0
    if (deck.cols === 5) return 2; // gap after col 1
    return 2; // gap after col 1 for 4-col
  };

  const gapAfterCol = getGapIndex();

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      {/* Driver indicator */}
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-1.5">
          <div className="h-4 w-6 rounded border-2 border-gray-400" />
          <span className="text-[10px] font-medium uppercase text-gray-500">Driver</span>
        </div>
      </div>

      {/* Seat rows */}
      <div className="space-y-2">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-1">
            {row.map((seat, colIdx) => (
              <React.Fragment key={seat.seatNo}>
                <SeatButton
                  seat={seat}
                  isSelected={selectedSeatNos.includes(seat.seatNo)}
                  isSleeper={isSleeper}
                  canSelect={selectedSeats.length < maxSeats}
                  onClick={() => onSeatClick?.(seat)}
                />
                {/* Aisle gap */}
                {colIdx === gapAfterCol - 1 && (
                  <div className={cn("shrink-0", isSleeper ? "w-6" : "w-4")} />
                )}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  isSelected,
  isSleeper,
  canSelect,
  onClick,
}: {
  seat: Seat;
  isSelected: boolean;
  isSleeper: boolean;
  canSelect: boolean;
  onClick: () => void;
}) {
  const isClickable =
    seat.status === "available" || seat.status === "female-only" || isSelected;
  const isDisabled = !isClickable || (!isSelected && !canSelect);

  const getStatusStyles = () => {
    if (isSelected) return "bg-blue-600 border-blue-700 text-white";

    switch (seat.status) {
      case "available":
        return "bg-white border-green-400 text-green-700 hover:bg-green-50 cursor-pointer";
      case "booked":
        return "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed";
      case "female-only":
        return "bg-pink-50 border-pink-400 text-pink-600 hover:bg-pink-100 cursor-pointer";
      case "blocked":
        return "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed";
      default:
        return "bg-gray-100 border-gray-200 text-gray-400";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={`${seat.seatNo} - ₹${seat.price} (${seat.position})`}
      className={cn(
        "flex items-center justify-center border-2 text-[10px] font-semibold transition-all",
        isSleeper
          ? "h-7 w-12 rounded-md"
          : "h-8 w-8 rounded-md",
        getStatusStyles(),
        isDisabled && !isSelected && "opacity-70"
      )}
      aria-label={`Seat ${seat.seatNo}, ${seat.status}, ₹${seat.price}`}
    >
      {seat.seatNo}
    </button>
  );
}
