"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { PointCard } from "@/components/travel/point-card";
import { PointSearch } from "@/components/travel/point-search";
import type { BusBoardingPoint } from "@/types";
import { MapPin, Navigation } from "lucide-react";

interface BoardingDroppingSelectorProps {
  boardingPoints: BusBoardingPoint[];
  droppingPoints: BusBoardingPoint[];
  className?: string;
}

/**
 * BoardingDroppingSelector — Premium side-by-side layout for selecting
 * boarding and dropping points.
 *
 * Desktop: Two columns (50/50).
 * Mobile: Stacked vertically.
 *
 * Features:
 * - Interactive PointCard with hover animations
 * - Search filter when > 8 points
 * - Independent scrollable columns (max 500px)
 * - Keyboard accessible
 */
export function BoardingDroppingSelector({
  boardingPoints,
  droppingPoints,
  className,
}: BoardingDroppingSelectorProps) {
  const { boardingPoint, droppingPoint, setBoardingPoint, setDroppingPoint } =
    useBusBookingStore();

  return (
    <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-2", className)}>
      {/* Boarding Points Column */}
      {boardingPoints.length > 0 && (
        <PointColumn
          title="Boarding Point"
          subtitle="Where you'll board the bus"
          icon={<MapPin className="h-4 w-4 text-green-600" />}
          points={boardingPoints}
          selectedId={boardingPoint?.id ?? null}
          onSelect={setBoardingPoint}
          type="boarding"
        />
      )}

      {/* Dropping Points Column */}
      {droppingPoints.length > 0 && (
        <PointColumn
          title="Dropping Point"
          subtitle="Where you'll get off"
          icon={<Navigation className="h-4 w-4 text-blue-600" />}
          points={droppingPoints}
          selectedId={droppingPoint?.id ?? null}
          onSelect={setDroppingPoint}
          type="dropping"
        />
      )}
    </div>
  );
}

// ─── PointColumn ────────────────────────────────────────────────────────────────

function PointColumn({
  title,
  subtitle,
  icon,
  points,
  selectedId,
  onSelect,
  type,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  points: BusBoardingPoint[];
  selectedId: string | null;
  onSelect: (point: BusBoardingPoint) => void;
  type: "boarding" | "dropping";
}) {
  const [search, setSearch] = React.useState("");
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const showSearch = points.length > 8;

  // Filter points by search term
  const filteredPoints = React.useMemo(() => {
    if (!search.trim()) return points;
    const query = search.toLowerCase();
    return points.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
    );
  }, [points, search]);

  // Keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!filteredPoints.length) return;

      const currentIndex = filteredPoints.findIndex((p) => p.id === hoveredId);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = currentIndex < filteredPoints.length - 1 ? currentIndex + 1 : 0;
        setHoveredId(filteredPoints[next].id);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = currentIndex > 0 ? currentIndex - 1 : filteredPoints.length - 1;
        setHoveredId(filteredPoints[prev].id);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (hoveredId) {
          const point = filteredPoints.find((p) => p.id === hoveredId);
          if (point) onSelect(point);
        }
      }
    },
    [filteredPoints, hoveredId, onSelect]
  );

  return (
    <div className="flex flex-col" onKeyDown={handleKeyDown}>
      {/* Column header */}
      <div className="mb-1.5 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">{title}</h4>
          <p className="text-[10px] text-slate-400">{subtitle}</p>
        </div>
        {selectedId && (
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
            Selected
          </span>
        )}
      </div>

      {/* Search filter (only if > 8 points) */}
      {showSearch && (
        <PointSearch
          value={search}
          onChange={setSearch}
          placeholder={`Search ${type} points...`}
          className="mb-2"
        />
      )}

      {/* Scrollable point list */}
      <div
        ref={listRef}
        className="max-h-[150px] space-y-1.5 overflow-y-auto pr-1 scrollbar-thin"
        role="radiogroup"
        aria-label={title}
      >
        {filteredPoints.length > 0 ? (
          filteredPoints.map((point) => (
            <PointCard
              key={point.id}
              point={point}
              isSelected={selectedId === point.id}
              isHovered={hoveredId === point.id}
              isFaded={hoveredId !== null && hoveredId !== point.id}
              type={type}
              onSelect={onSelect}
              onHover={setHoveredId}
            />
          ))
        ) : (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-xs text-gray-400">
              {search ? "No points match your search" : "No points available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
