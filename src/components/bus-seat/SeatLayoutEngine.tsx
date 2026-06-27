"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useSeatLayout, useSeatSelection } from "./hooks";
import { getBusLayoutLabel, type RawApiSeat } from "./utils";
import { DeckTabs } from "./DeckTabs";
import { BusOutline } from "./BusOutline";
import { SeatGrid } from "./SeatGrid";
import { SeatLegend } from "./SeatLegend";
import { ZoomControls } from "./ZoomControls";
import { SelectionSummary } from "./SelectionSummary";
import { BoardingDroppingSelector } from "@/components/travel/boarding-dropping-selector";
import type { BusBoardingPoint } from "@/types";
import { Users } from "lucide-react";

interface SeatLayoutEngineProps {
  /** Raw seat data from the Bus Select API response */
  rawSeats: RawApiSeat[];
  /** Boarding points from the API */
  boardingPoints: BusBoardingPoint[];
  /** Dropping points from the API */
  droppingPoints: BusBoardingPoint[];
  /** Bus ID for booking context */
  busId: string;
  /** Called when user clicks Continue */
  onContinue: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SeatLayoutEngine — The top-level orchestrator component.
 *
 * This is the only component external code needs to render.
 * It wires together the entire engine:
 *
 *   rawSeats → useSeatLayout (parse) → useSeatSelection (state)
 *                    ↓                          ↓
 *   DeckTabs → BusOutline → SeatGrid → SeatCard
 *                    ↓
 *   SeatLegend + ZoomControls + SelectionSummary + BoardingDropping
 *
 * Nothing outside this component knows how seats are rendered.
 */
export function SeatLayoutEngine({
  rawSeats,
  boardingPoints,
  droppingPoints,
  busId,
  onContinue,
  className,
}: SeatLayoutEngineProps) {
  const {
    layout,
    activeDeck,
    setActiveDeck,
    zoom,
    setZoom,
    hasMultipleDecks,
  } = useSeatLayout(rawSeats);

  // Flatten all seats across decks for the selection hook
  const allSeats = React.useMemo(
    () => layout.decks.flatMap((d) => d.seats),
    [layout.decks]
  );

  const {
    selectedIds,
    canSelect,
    toggleSeat,
    selectedCount,
    isMaxReached,
  } = useSeatSelection(allSeats);

  // Get current deck to render
  const currentDeck = layout.decks[activeDeck] || layout.decks[0];

  if (!currentDeck || layout.totalSeats === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No seat layout available</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col lg:flex-row lg:gap-6", className)}>
      {/* ═══ Left: Seat Layout + Boarding/Dropping ═══ */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* Header bar: layout badge + seats count + zoom */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Bus layout type badge */}
            <span className="inline-flex items-center rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 border border-green-200">
              {getBusLayoutLabel(layout.busLayoutType)}
            </span>

            {/* Availability indicator */}
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium text-gray-700">{layout.availableSeats}</span>
              available
            </span>

            {/* Selection count */}
            {selectedCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                {selectedCount} selected
                {isMaxReached && " (max)"}
              </span>
            )}
          </div>

          {/* Zoom controls */}
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>

        {/* Deck tabs (only for multi-deck) */}
        {hasMultipleDecks && (
          <DeckTabs
            decks={layout.decks}
            activeDeck={activeDeck}
            onDeckChange={setActiveDeck}
          />
        )}

        {/* Legend */}
        <SeatLegend />

        {/* Bus body with seat grid */}
        <BusOutline>
          <SeatGrid
            deck={currentDeck}
            zoom={zoom}
            selectedIds={selectedIds}
            canSelect={canSelect}
            onSeatSelect={toggleSeat}
          />
        </BusOutline>

        {/* Boarding & Dropping section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-gray-900">
            Boarding & Dropping Points
          </h3>
          <BoardingDroppingSelector
            boardingPoints={boardingPoints}
            droppingPoints={droppingPoints}
          />
        </div>
      </div>

      {/* ═══ Right: Selection Summary (sticky on desktop) ═══ */}
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-4">
          <SelectionSummary busId={busId} onContinue={onContinue} />
        </div>
      </aside>
    </div>
  );
}
