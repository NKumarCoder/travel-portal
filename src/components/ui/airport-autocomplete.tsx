"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plane, Loader2 } from "lucide-react";
import { searchAirports } from "@/services/airportService";
import type { Airport } from "@/types";

interface AirportAutocompleteProps {
  /** Selected airport object (or null if nothing selected) */
  value: Airport | null;
  /** Called when the user selects an airport from the dropdown */
  onSelect: (airport: Airport | null) => void;
  /** Input placeholder text */
  placeholder?: string;
  /** Label shown above the input */
  label?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom icon to show in the input */
  icon?: React.ReactNode;
}

/**
 * Reusable Airport Autocomplete component for the Flight module.
 *
 * - Fetches airports from the Flight API after 2+ characters
 * - 350ms input debounce
 * - In-memory caching via airportService
 * - Stale response protection using request sequence tracking & AbortController
 * - WAI-ARIA combobox with full keyboard navigation (Arrow Up/Down, Enter, Escape, Tab)
 * - Highlights matching text in dropdown
 * - Clean two-line airport display with airportCode badge
 */
export function AirportAutocomplete({
  value,
  onSelect,
  placeholder = "Enter city or airport",
  label,
  disabled = false,
  className,
  icon,
}: AirportAutocompleteProps) {
  const getDisplayValue = (airport: Airport | null): string => {
    if (!airport) return "";
    return airport.showCity || `${airport.city} (${airport.airportCode})`;
  };

  const [inputValue, setInputValue] = React.useState(getDisplayValue(value));
  const [airports, setAirports] = React.useState<Airport[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stale request protection
  const requestSeq = React.useRef(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const inputId =
    label?.toLowerCase().replace(/\s+/g, "-") || "airport-autocomplete";

  // Sync external value changes (e.g. swap button or route chip selection)
  const [prevValue, setPrevValue] = React.useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(getDisplayValue(value));
  }

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Cleanup timers and abort controllers on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const fetchAirports = React.useCallback(async (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      setAirports([]);
      setIsLoading(false);
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const currentSeq = ++requestSeq.current;
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchAirports(trimmed, abortController.signal);

      // Stale response guard: only update if this is the newest request
      if (currentSeq === requestSeq.current) {
        setAirports(results);
      }
    } catch (err: unknown) {
      if (currentSeq === requestSeq.current) {
        // Only set error if not an aborted request
        if (
          err &&
          typeof err === "object" &&
          "name" in err &&
          err.name === "CanceledError"
        ) {
          return;
        }
        setError("Unable to fetch airports. Please try again.");
        setAirports([]);
      }
    } finally {
      if (currentSeq === requestSeq.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setActiveIndex(-1);
    setError(null);

    // Clear selected airport object if user edits input text
    if (value && val !== getDisplayValue(value)) {
      onSelect(null);
    }

    // Clear existing debounce timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.trim().length < 2) {
      setAirports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchAirports(val);
    }, 350);
  };

  const handleSelect = (airport: Airport) => {
    setInputValue(getDisplayValue(airport));
    onSelect(airport);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    if (inputValue.trim().length >= 2) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && airports.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < airports.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : airports.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && airports[activeIndex]) {
          handleSelect(airports[activeIndex]);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;

      case "Tab":
        if (activeIndex >= 0 && airports[activeIndex]) {
          handleSelect(airports[activeIndex]);
        }
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  /**
   * Highlight matching portion of text in dropdown results.
   */
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;

    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);

    return (
      <span>
        {before}
        <span className="font-bold text-emerald-700">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-semibold text-slate-700 select-none"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon || <Plane className="h-4 w-4 text-emerald-600" />}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${inputId}-listbox`}
          aria-activedescendant={
            activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
          }
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Loading state */}
          {isLoading && airports.length === 0 && (
            <div className="absolute top-full z-40 mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <p className="text-xs text-slate-500">Searching airports...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="absolute top-full z-40 mt-1 w-full rounded-xl border border-red-200 bg-red-50 p-3 shadow-xl">
              <p className="text-center text-xs font-semibold text-red-600">{error}</p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && !error && airports.length > 0 && (
            <ul
              ref={listRef}
              id={`${inputId}-listbox`}
              className="absolute top-full z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
              role="listbox"
            >
              {airports.map((airport, index) => (
                <li
                  key={`${airport.airportCode}-${index}`}
                  id={`${inputId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => handleSelect(airport)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2.5 px-3 py-2 text-xs transition-colors hover:bg-emerald-50/70 border-b border-slate-50 last:border-b-0",
                    index === activeIndex && "bg-emerald-50",
                    value?.airportCode === airport.airportCode &&
                      "bg-emerald-50 font-medium text-emerald-800"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    {/* Primary Line: City + Code Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {highlightMatch(airport.city || airport.showCity || "", inputValue)}
                      </span>
                      <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider border border-slate-200/80 shrink-0">
                        {airport.airportCode}
                      </span>
                    </div>
                    {/* Secondary Line: Airport Name · Country */}
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {airport.airportDesc && <span>{airport.airportDesc}</span>}
                      {airport.airportDesc && airport.country && <span> · </span>}
                      {airport.country && <span>{airport.country}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* No results */}
          {!isLoading &&
            !error &&
            airports.length === 0 &&
            inputValue.trim().length >= 2 && (
              <div className="absolute top-full z-40 mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <p className="text-center text-xs text-slate-500">
                  No airports found
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
