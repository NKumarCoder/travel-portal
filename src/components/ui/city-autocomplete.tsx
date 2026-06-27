"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";
import { searchCities, type City } from "@/services/cityService";

interface CityAutocompleteProps {
  /** Selected city object (or null if nothing selected) */
  value: City | null;
  /** Called when the user selects a city from the dropdown */
  onSelect: (city: City | null) => void;
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
 * Reusable City Autocomplete component.
 *
 * - Fetches cities from the real API after 2+ characters
 * - Debounces requests (350ms)
 * - Caches results in-memory (via cityService)
 * - Full keyboard navigation (Arrow Up/Down, Enter, Escape, Tab)
 * - Closes on click outside or Escape
 * - Highlights matching text in results
 * - Shows loading spinner and error/empty states
 *
 * Reusable across Buses, Flights, Hotels, Activities, Packages.
 */
export function CityAutocomplete({
  value,
  onSelect,
  placeholder = "Enter city",
  label,
  disabled = false,
  className,
  icon,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(value?.name || "");
  const [cities, setCities] = React.useState<City[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputId =
    label?.toLowerCase().replace(/\s+/g, "-") || "city-autocomplete";

  // Sync external value changes (e.g. swap button)
  React.useEffect(() => {
    setInputValue(value?.name || "");
  }, [value]);

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

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const fetchCities = React.useCallback(async (keyword: string) => {
    if (keyword.trim().length < 2) {
      setCities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchCities(keyword);
      setCities(results);
    } catch {
      setError("Unable to fetch cities. Please try again.");
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setActiveIndex(-1);
    setError(null);

    // Clear selection if input changes
    if (value && val !== value.name) {
      onSelect(null);
    }

    // Debounce API call
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (val.trim().length < 2) {
      setCities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchCities(val);
    }, 350);
  };

  const handleSelect = (city: City) => {
    setInputValue(city.name);
    onSelect(city);
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
      if (e.key === "ArrowDown" && cities.length > 0) {
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
          prev < cities.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : cities.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && cities[activeIndex]) {
          handleSelect(cities[activeIndex]);
        }
        break;

      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;

      case "Tab":
        // Select active item on Tab if one is highlighted
        if (activeIndex >= 0 && cities[activeIndex]) {
          handleSelect(cities[activeIndex]);
        }
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  /**
   * Highlight matching portion of text.
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
        <span className="font-semibold text-blue-700">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon || <MapPin className="h-4 w-4" />}
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
          className="flex h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
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
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Loading state */}
          {isLoading && cities.length === 0 && (
            <div className="absolute top-full z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Searching cities...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="absolute top-full z-30 mt-1 w-full rounded-lg border border-red-200 bg-red-50 p-3 shadow-lg">
              <p className="text-center text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && !error && cities.length > 0 && (
            <ul
              ref={listRef}
              id={`${inputId}-listbox`}
              className="absolute top-full z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {cities.map((city, index) => (
                <li
                  key={`${city.code}-${city.name}`}
                  id={`${inputId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => handleSelect(city)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-blue-50",
                    index === activeIndex && "bg-blue-50",
                    value?.code === city.code &&
                      "bg-blue-50 font-medium text-blue-700"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-800">
                      {highlightMatch(city.name, inputValue)}
                    </div>
                    {(city.state || city.type) && (
                      <div className="text-xs text-gray-500">
                        {city.state && <span>{city.state}</span>}
                        {city.state && city.type && (
                          <span className="mx-1">·</span>
                        )}
                        {city.type && <span>{city.type}</span>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* No results */}
          {!isLoading &&
            !error &&
            cities.length === 0 &&
            inputValue.trim().length >= 2 && (
              <div className="absolute top-full z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                <p className="text-center text-sm text-gray-500">
                  No cities found
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
