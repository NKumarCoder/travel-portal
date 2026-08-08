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
        className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all duration-200"
        aria-label={placeholder}
      />
    </div>
  );
}
