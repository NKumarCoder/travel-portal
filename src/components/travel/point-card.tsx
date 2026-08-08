"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { BusBoardingPoint } from "@/types";
import { MapPin, Clock } from "lucide-react";

interface PointCardProps {
  point: BusBoardingPoint;
  isSelected: boolean;
  isHovered: boolean;
  isFaded: boolean;
  type: "boarding" | "dropping";
  onSelect: (point: BusBoardingPoint) => void;
  onHover: (id: string | null) => void;
}

/**
 * PointCard — Premium interactive card for boarding/dropping point selection.
 *
 * Features:
 * - Scale animation on hover (1.02)
 * - Typography size increase on hover
 * - Opacity dimming on sibling hover
 * - Address expansion on hover (2-line clamp → full)
 * - Blue selected state that persists through hover
 * - Keyboard accessible (Space/Enter)
 */
export function PointCard({
  point,
  isSelected,
  isHovered,
  isFaded,
  type,
  onSelect,
  onHover,
}: PointCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(point);
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(point)}
      onMouseEnter={() => onHover(point.id)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex w-full items-center gap-2.5 rounded-xl border p-2.5 px-3 text-left",
        "transition-all duration-200 ease-out cursor-pointer min-h-[42px]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
        // Selected state
        isSelected && "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500/80 shadow-xs",
        // Hover state (only if not selected)
        !isSelected && isHovered && "border-slate-400 bg-white shadow-md scale-[1.01]",
        // Default state
        !isSelected && !isHovered && "border-slate-200 bg-white shadow-2xs hover:border-slate-300",
        // Faded state (sibling is hovered)
        isFaded && !isSelected && "opacity-60",
        !isFaded && "opacity-100",
      )}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
    >
      {/* Radio indicator */}
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-200",
          isSelected
            ? "border-emerald-600 bg-emerald-600 scale-105"
            : "border-slate-300 group-hover:border-slate-400 bg-white"
        )}
      >
        {isSelected && (
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </div>

      {/* Content — Horizontal composition */}
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        {/* Location & Address */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p
              className={cn(
                "text-xs font-bold text-slate-900 truncate leading-tight",
                isSelected && "text-emerald-950"
              )}
            >
              {point.name}
            </p>

            {point.address && (
              <span className="hidden sm:inline text-[10px] text-slate-400 font-normal truncate max-w-[140px]">
                · {point.address}
              </span>
            )}
          </div>

          {point.address && (
            <div
              className={cn(
                "flex items-center gap-1 text-[10px] sm:hidden leading-tight mt-0.5",
                isSelected ? "text-emerald-700/90" : "text-slate-500"
              )}
            >
              <MapPin className="h-2.5 w-2.5 shrink-0 text-slate-400" />
              <span className="truncate">{point.address}</span>
            </div>
          )}
        </div>

        {/* Time Badge */}
        <TimeBadge time={point.time} isSelected={isSelected} />
      </div>
    </button>
  );
}

/**
 * TimeBadge — Displays departure/arrival time in a compact right-aligned pill.
 */
function TimeBadge({ time, isSelected }: { time: string; isSelected: boolean }) {
  if (!time) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors duration-200 whitespace-nowrap",
        isSelected
          ? "bg-emerald-100 text-emerald-800 border border-emerald-200/80"
          : "bg-slate-100 text-slate-700 border border-slate-200/60"
      )}
    >
      <Clock className="h-2.5 w-2.5 text-slate-500 shrink-0" />
      {time}
    </span>
  );
}
