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
  const [addressExpanded, setAddressExpanded] = React.useState(false);

  // Expand address on hover
  React.useEffect(() => {
    if (isHovered) {
      setAddressExpanded(true);
    } else {
      // Delay collapse for smooth animation
      const timer = setTimeout(() => setAddressExpanded(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(point);
    }
  };

  const selectedColor = type === "boarding" ? "blue" : "blue";

  return (
    <button
      type="button"
      onClick={() => onSelect(point)}
      onMouseEnter={() => onHover(point.id)}
      onMouseLeave={() => onHover(null)}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left",
        "transition-all duration-250 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        // Selected state
        isSelected && "border-blue-500 bg-blue-50/70 shadow-md",
        // Hover state (only if not selected)
        !isSelected && isHovered && "border-gray-400 bg-white shadow-lg scale-[1.02]",
        // Default state
        !isSelected && !isHovered && "border-gray-200 bg-white shadow-sm",
        // Faded state (sibling is hovered)
        isFaded && !isSelected && "opacity-60",
        // Restore opacity
        !isFaded && "opacity-100",
      )}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
    >
      {/* Radio indicator */}
      <div
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          isSelected
            ? "border-blue-500 bg-blue-500 scale-110"
            : "border-gray-300 group-hover:border-gray-400"
        )}
      >
        {isSelected && (
          <div className="h-2 w-2 rounded-full bg-white" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Name + Time */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "font-medium text-gray-900 transition-all duration-250",
              isHovered && !isSelected ? "text-base font-bold" : "text-sm font-semibold",
              isSelected && "text-blue-900"
            )}
          >
            {point.name}
          </p>

          {/* Time Badge */}
          <TimeBadge time={point.time} isSelected={isSelected} />
        </div>

        {/* Address */}
        <div
          className={cn(
            "mt-1.5 flex items-start gap-1 text-xs transition-all duration-250 ease-out",
            isSelected ? "text-blue-700/80" : "text-gray-500"
          )}
        >
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span
            className={cn(
              "transition-all duration-250",
              addressExpanded ? "" : "line-clamp-2"
            )}
          >
            {point.address}
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * TimeBadge — Displays departure/arrival time in a styled badge.
 */
function TimeBadge({ time, isSelected }: { time: string; isSelected: boolean }) {
  if (!time) return null;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-200",
        isSelected
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600"
      )}
    >
      <Clock className="h-3 w-3" />
      {time}
    </span>
  );
}
