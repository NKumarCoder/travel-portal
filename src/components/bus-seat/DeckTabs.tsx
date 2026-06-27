"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ParsedDeck } from "./utils";

interface DeckTabsProps {
  decks: ParsedDeck[];
  activeDeck: number;
  onDeckChange: (index: number) => void;
}

/**
 * DeckTabs — Animated tab switcher for multi-deck buses.
 *
 * Only renders when there are 2+ decks.
 * Smooth sliding indicator animation.
 */
export function DeckTabs({ decks, activeDeck, onDeckChange }: DeckTabsProps) {
  if (decks.length <= 1) return null;

  return (
    <div className="relative flex gap-1 rounded-xl bg-gray-100 p-1">
      {/* Sliding indicator */}
      <div
        className="absolute inset-y-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
        style={{
          width: `calc(${100 / decks.length}% - 4px)`,
          left: `calc(${(activeDeck * 100) / decks.length}% + 2px)`,
        }}
      />

      {decks.map((deck, index) => (
        <button
          key={deck.deck}
          type="button"
          onClick={() => onDeckChange(index)}
          className={cn(
            "relative z-10 flex-1 rounded-lg px-4 py-2 text-xs font-semibold transition-colors duration-200",
            activeDeck === index
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          )}
          aria-selected={activeDeck === index}
          role="tab"
        >
          {deck.label}
          <span className="ml-1.5 text-[10px] font-normal text-gray-400">
            ({deck.seats.length})
          </span>
        </button>
      ))}
    </div>
  );
}
