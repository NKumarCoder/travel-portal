"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value: string; // Expected format: YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  className?: string;
  error?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseYYYYMMDD(str: string): Date {
  if (!str) return new Date();
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(str: string): string {
  if (!str) return "";
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return str;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  className,
  error,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Selected date as Date object
  const selectedDate = React.useMemo(() => (value ? parseYYYYMMDD(value) : null), [value]);

  // Current viewed month/year in calendar
  const [viewDate, setViewDate] = React.useState<Date>(() => selectedDate || new Date());

  // Update view date when selected value changes
  React.useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Calendar Days Calculation
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = formatYYYYMMDD(new Date());

  const handleSelectDay = (day: number) => {
    const targetDate = new Date(year, month, day);
    const dateStr = formatYYYYMMDD(targetDate);

    if (minDate && dateStr < minDate) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const todayStr = formatYYYYMMDD(today);
    if (minDate && todayStr < minDate) return;
    onChange(todayStr);
    setIsOpen(false);
  };

  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const inputId = label?.toLowerCase().replace(/\s+/g, "-") || "date-picker";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          onClick={() => setIsOpen((prev) => !prev)}
          className="mb-1 block text-xs font-semibold text-slate-700 cursor-pointer select-none"
        >
          {label}
        </label>
      )}

      {/* 1. Entire Field Trigger */}
      <div
        id={inputId}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs transition-all duration-150 cursor-pointer select-none hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
          isOpen && "border-emerald-500 ring-2 ring-emerald-500/20",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className={cn("truncate", !value && "text-slate-400")}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-emerald-600"
          )}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* 2. Custom Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-[290px] sm:w-[310px] rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xl shadow-slate-900/10 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header: Month & Year + Prev/Next Buttons */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900">{monthName}</h3>
              <p className="text-[10px] font-medium text-slate-400">Select journey date</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((day) => (
              <span key={day} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Date Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = formatYYYYMMDD(dateObj);

              const isSelected = value === dateStr;
              const isToday = todayStr === dateStr;
              const isDisabled = minDate ? dateStr < minDate : false;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(dayNum)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer mx-auto",
                    isSelected
                      ? "bg-emerald-600 text-white font-extrabold shadow-sm shadow-emerald-600/30 scale-105"
                      : isToday
                      ? "border border-emerald-500 text-emerald-700 font-bold hover:bg-emerald-50"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700",
                    isDisabled && "text-slate-300 pointer-events-none cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Set Today
            </button>
            <span className="text-[10px] text-slate-400 font-medium">Opti Date Selector</span>
          </div>
        </div>
      )}
    </div>
  );
}

