"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Users, Minus, Plus } from "lucide-react";
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

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCount = (type: keyof PassengerCount, delta: number) => {
    const newValue = { ...value };
    newValue[type] = Math.max(type === "adults" ? 1 : 0, newValue[type] + delta);
    onChange(newValue);
  };

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">Passengers</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Users className="h-4 w-4 text-gray-400" />
        <span>
          {totalPassengers} {totalPassengers === 1 ? "Passenger" : "Passengers"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
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
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={count <= minValue}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-4 text-center text-sm font-medium">{count}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
