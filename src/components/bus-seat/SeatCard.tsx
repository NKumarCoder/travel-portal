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
        padding: "1px",
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
          isSleeper && "rounded-md sm:rounded-lg",
          // Border & colors
          "border-[1.5px]",
          colors.bg,
          colors.border,
          colors.text,
          colors.shadow,
          // Hover
          clickable && colors.hoverBg,
          clickable && colors.hoverBorder,
          clickable && "cursor-pointer hover:scale-[1.05] hover:-translate-y-[1px] active:scale-95",
          !clickable && "cursor-not-allowed opacity-80",
          // Selected glow
          isSelected && "ring-1 ring-emerald-400",
        )}
        style={
          isSleeper
            ? {
                width: "100%",
                height: "100%",
                transform: "rotate(90deg)",
                transformOrigin: "center center",
              }
            : { width: "100%", height: "100%" }
        }
      >
        {/* Seater: Backrest indicator */}
        {isSeater && (
          <div className={cn(
            "absolute inset-x-0 top-0 h-[2.5px] rounded-t-lg transition-colors duration-200",
            isSelected ? "bg-emerald-400" : effectiveStatus === "booked" ? "bg-slate-300" : "bg-emerald-300"
          )} />
        )}

        {/* Sleeper: Pillow indicator */}
        {isSleeper && (
          <div className={cn(
            "absolute inset-x-[2px] top-[2px] h-[5px] rounded-xs transition-colors duration-200",
            isSelected ? "bg-emerald-300/80" : effectiveStatus === "booked" ? "bg-slate-300/60" : "bg-emerald-200/80"
          )} />
        )}

        {/* Seat number */}
        <span
          className={cn(
            "relative z-10 truncate font-bold leading-none tracking-tight",
            isSeater && "text-[8.5px]",
            isSleeper && "text-[7.5px]",
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
