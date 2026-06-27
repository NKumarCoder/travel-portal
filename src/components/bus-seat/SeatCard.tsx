"use client";

import React, { memo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getSeatColors, getSeatGridPlacement, isSelectable, type ParsedSeat, type SeatUIStatus } from "./utils";
import { SeatTooltip } from "./SeatTooltip";

interface SeatCardProps {
  seat: ParsedSeat;
  isSelected: boolean;
  canInteract: boolean;
  onSelect: (seat: ParsedSeat) => void;
  cellSize: number;
}

/**
 * SeatCard — Premium compact seat with distinct shapes per type.
 *
 * Seater: Compact square with backrest indicator (top rounded edge)
 * Vertical Sleeper: Tall berth with pillow indicator at top
 * Horizontal Sleeper: Wide berth with pillow indicator on left
 *
 * 25% smaller than previous version. Positioned via CSS Grid.
 * Memoized for performance with 150+ seats.
 */
export const SeatCard = memo(function SeatCard({
  seat,
  isSelected,
  canInteract,
  onSelect,
  cellSize,
}: SeatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const effectiveStatus: SeatUIStatus = isSelected ? "selected" : seat.status;
  const colors = getSeatColors(effectiveStatus);
  const placement = getSeatGridPlacement(seat);
  const clickable = canInteract && (isSelectable(seat.status) || isSelected);

  const handleClick = useCallback(() => {
    if (clickable) onSelect(seat);
  }, [clickable, onSelect, seat]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && clickable) {
        e.preventDefault();
        onSelect(seat);
      }
    },
    [clickable, onSelect, seat]
  );

  const isSeater = seat.seatType === "seater";
  const isVerticalSleeper = seat.seatType === "vertical_sleeper";
  const isHorizontalSleeper = seat.seatType === "horizontal_sleeper";
  const isSleeper = isVerticalSleeper || isHorizontalSleeper;

  return (
    <div
      className="relative"
      style={{
        gridColumnStart: placement.colStart,
        gridRowStart: placement.rowStart,
        gridColumnEnd: `span ${placement.colSpan}`,
        gridRowEnd: `span ${placement.rowSpan}`,
        padding: "2px",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={!clickable}
        tabIndex={clickable ? 0 : -1}
        aria-label={`Seat ${seat.name}, ${isSeater ? "Seater" : "Sleeper"}, ₹${seat.fare}, ${effectiveStatus}`}
        aria-pressed={isSelected}
        className={cn(
          "relative flex items-center justify-center overflow-hidden transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
          // Shape
          isSeater && "rounded-md rounded-t-lg",
          isSleeper && "rounded-lg",
          // Border & colors
          "border-[1.5px]",
          colors.bg,
          colors.border,
          colors.text,
          colors.shadow,
          // Hover
          clickable && colors.hoverBg,
          clickable && colors.hoverBorder,
          clickable && "cursor-pointer hover:scale-[1.06] hover:-translate-y-[1px] active:scale-95",
          !clickable && "cursor-not-allowed opacity-80",
          // Selected glow
          isSelected && "ring-1 ring-blue-300",
        )}
        style={
          isSleeper
            ? {
                // Rotate the sleeper 90° visually.
                // The grid cell stays the same size; we rotate the button inside it
                // and swap its width/height so it fills the cell correctly.
                width: "100%",
                height: "100%",
                transform: "rotate(90deg)",
                // Scale to fit the rotated shape within the grid cell
                // After rotating a wide rectangle, it needs to fit in the original bounding box
                transformOrigin: "center center",
              }
            : { width: "100%", height: "100%" }
        }
      >
        {/* Seater: Backrest indicator */}
        {isSeater && (
          <div className={cn(
            "absolute inset-x-0 top-0 h-[3px] rounded-t-lg transition-colors duration-200",
            isSelected ? "bg-blue-400" : effectiveStatus === "booked" ? "bg-gray-300" : "bg-green-300"
          )} />
        )}

        {/* Sleeper: Pillow indicator (always at the "top" of the rotated berth, which is visually the left after rotation) */}
        {isSleeper && (
          <div className={cn(
            "absolute inset-x-[3px] top-[3px] h-[6px] rounded-sm transition-colors duration-200",
            isSelected ? "bg-blue-300/60" : effectiveStatus === "booked" ? "bg-gray-200" : "bg-green-200/60"
          )} />
        )}

        {/* Seat number — counter-rotated to stay upright and readable */}
        <span
          className={cn(
            "relative z-10 truncate font-semibold leading-none",
            isSeater && "text-[9px]",
            isSleeper && "text-[8px]",
          )}
          style={isSleeper ? { transform: "rotate(-90deg)" } : undefined}
        >
          {seat.name}
        </span>
      </button>

      {/* Tooltip — positioned outside the grid cell, not affected by rotation */}
      {showTooltip && <SeatTooltip seat={seat} effectiveStatus={effectiveStatus} />}
    </div>
  );
});
