"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Users, Minus, Plus, ChevronDown } from "lucide-react";
import type { PassengerCount } from "@/types";

interface PassengerSelectorProps {
  value: PassengerCount;
  onChange: (passengers: PassengerCount) => void;
  className?: string;
}

export function PassengerSelector({ value, onChange, className }: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const totalPassengers = value.adults + value.children + value.infants;

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const updateCount = (type: keyof PassengerCount, delta: number) => {
    const newValue = { ...value };
    newValue[type] = Math.max(type === "adults" ? 1 : 0, newValue[type] + delta);
    onChange(newValue);
  };

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <label 
        onClick={() => setIsOpen((prev) => !prev)}
        className="mb-1 block text-xs font-semibold text-slate-700 cursor-pointer select-none"
      >
        Passengers
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs transition-all duration-150 cursor-pointer select-none hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
          isOpen && "border-emerald-500 ring-2 ring-emerald-500/20"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Users className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            {totalPassengers} {totalPassengers === 1 ? "Passenger" : "Passengers"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-emerald-600"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-2 z-50 w-[240px] sm:w-[260px] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xl shadow-slate-900/10 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="mb-2 border-b border-slate-100 pb-1.5 flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900">Select Passengers</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Total: {totalPassengers}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            <PassengerRow
              label="Adults"
              description="Age 12+"
              count={value.adults}
              onDecrement={() => updateCount("adults", -1)}
              onIncrement={() => updateCount("adults", 1)}
              minValue={1}
            />
            <PassengerRow
              label="Children"
              description="Age 2-11"
              count={value.children}
              onDecrement={() => updateCount("children", -1)}
              onIncrement={() => updateCount("children", 1)}
              minValue={0}
            />
            <PassengerRow
              label="Infants"
              description="Under 2"
              count={value.infants}
              onDecrement={() => updateCount("infants", -1)}
              onIncrement={() => updateCount("infants", 1)}
              minValue={0}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface PassengerRowProps {
  label: string;
  description: string;
  count: number;
  onDecrement: () => void;
  onIncrement: () => void;
  minValue: number;
}

function PassengerRow({ label, description, count, onDecrement, onIncrement, minValue }: PassengerRowProps) {
  const isMinusDisabled = count <= minValue;

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-xs font-extrabold text-slate-900">{label}</p>
        <p className="text-[10px] font-medium text-slate-400">{description}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onDecrement}
          disabled={isMinusDisabled}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors cursor-pointer",
            isMinusDisabled && "opacity-30 border-slate-200 bg-slate-50 text-slate-300 pointer-events-none cursor-not-allowed"
          )}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-xs font-extrabold text-slate-900">{count}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors cursor-pointer"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

