"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface PointSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * PointSearch — Filter input for boarding/dropping point lists.
 * Only shown when there are more than 8 points.
 */
export function PointSearch({
  value,
  onChange,
  placeholder = "Search points...",
  className,
}: PointSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        aria-label={placeholder}
      />
    </div>
  );
}
