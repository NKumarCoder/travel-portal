"use client";

import { useMemo, useState, useCallback } from "react";
import { parseLayout, type RawApiSeat, type ParsedLayout } from "../utils";

/**
 * useSeatLayout — Parses raw API seats into a structured layout model.
 *
 * Responsibilities:
 * - Parse raw seats via layoutParser
 * - Track active deck
 * - Track zoom level
 * - Provide computed grid dimensions per deck
 *
 * All layout computation is memoized for performance with 150+ seats.
 */

export type ZoomLevel = 100 | 125 | 150;

export interface UseSeatLayoutReturn {
  /** Full parsed layout (all decks) */
  layout: ParsedLayout;
  /** Currently active deck index (0 = lower, 1 = upper) */
  activeDeck: number;
  /** Set active deck */
  setActiveDeck: (deck: number) => void;
  /** Current zoom level */
  zoom: ZoomLevel;
  /** Set zoom level */
  setZoom: (level: ZoomLevel) => void;
  /** Whether the bus has multiple decks */
  hasMultipleDecks: boolean;
}

export function useSeatLayout(rawSeats: RawApiSeat[]): UseSeatLayoutReturn {
  const [activeDeck, setActiveDeck] = useState(0);
  const [zoom, setZoom] = useState<ZoomLevel>(100);

  // Memoize the full layout parse — only re-runs when rawSeats changes
  const layout = useMemo(() => parseLayout(rawSeats), [rawSeats]);

  const hasMultipleDecks = layout.deckCount > 1;

  // Ensure activeDeck is within bounds
  const safeSetActiveDeck = useCallback(
    (deck: number) => {
      if (deck >= 0 && deck < layout.deckCount) {
        setActiveDeck(deck);
      }
    },
    [layout.deckCount]
  );

  return {
    layout,
    activeDeck,
    setActiveDeck: safeSetActiveDeck,
    zoom,
    setZoom,
    hasMultipleDecks,
  };
}
