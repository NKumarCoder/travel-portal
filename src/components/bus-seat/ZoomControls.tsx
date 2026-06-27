"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { ZoomLevel } from "./hooks";

interface ZoomControlsProps {
  zoom: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  className?: string;
}

const ZOOM_LEVELS: ZoomLevel[] = [100, 125, 150];

/**
 * ZoomControls — Zoom in/out and fit-width controls for the seat layout.
 */
export function ZoomControls({ zoom, onZoomChange, className }: ZoomControlsProps) {
  const currentIndex = ZOOM_LEVELS.indexOf(zoom);

  const zoomIn = () => {
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const fitWidth = () => {
    onZoomChange(100);
  };

  return (
    <div className={cn("flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm", className)}>
      <button
        type="button"
        onClick={zoomOut}
        disabled={currentIndex === 0}
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-[36px] text-center text-[10px] font-semibold text-gray-700">
        {zoom}%
      </span>

      <button
        type="button"
        onClick={zoomIn}
        disabled={currentIndex === ZOOM_LEVELS.length - 1}
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>

      <div className="mx-0.5 h-4 w-px bg-gray-200" />

      <button
        type="button"
        onClick={fitWidth}
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100"
        aria-label="Fit to width"
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
