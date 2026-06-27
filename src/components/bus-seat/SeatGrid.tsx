"use client";

import React, { useMemo } from "react";
import { SeatCard } from "./SeatCard";
import { computeGridDimensions, type ParsedSeat, type ParsedDeck } from "./utils";
import type { ZoomLevel } from "./hooks";

interface SeatGridProps {
  deck: ParsedDeck;
  zoom: ZoomLevel;
  selectedIds: Set<string>;
  canSelect: (seat: ParsedSeat) => boolean;
  onSeatSelect: (seat: ParsedSeat) => void;
}

/**
 * SeatGrid — Renders all seats in a deck using CSS Grid.
 *
 * Compact version: base cell = 54px (25% smaller than 72px).
 * Grid dimensions computed dynamically from seat coordinates.
 * Gap reduced to 2px for tighter spacing.
 */
export function SeatGrid({
  deck,
  zoom,
  selectedIds,
  canSelect,
  onSeatSelect,
}: SeatGridProps) {
  // Base cell size reduced 25% (72 → 54)
  const baseCell = 54;
  const cellSize = Math.round(baseCell * (zoom / 100));

  // Compute grid template from deck dimensions
  const gridStyle = useMemo(() => {
    const { cols, rows } = computeGridDimensions(
      deck.seats.map((s) => ({ x: s.x, y: s.y, width: s.width, height: s.height })),
      cellSize
    );
    return {
      display: "grid" as const,
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      gap: "2px",
    };
  }, [deck.seats, cellSize]);

  return (
    <div
      className="inline-block"
      style={gridStyle}
      role="grid"
      aria-label={`${deck.label} seat layout`}
    >
      {deck.seats.map((seat) => (
        <SeatCard
          key={seat.id}
          seat={seat}
          isSelected={selectedIds.has(seat.name)}
          canInteract={canSelect(seat)}
          onSelect={onSeatSelect}
          cellSize={cellSize}
        />
      ))}
    </div>
  );
}
