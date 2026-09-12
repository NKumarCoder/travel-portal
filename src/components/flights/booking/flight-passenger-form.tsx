"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import type { FlightPassengerInfo, FlightPassportInfo } from "@/store/flight-booking-store";
import { Globe, Calendar, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlightPassengerFormProps {
  passenger: FlightPassengerInfo;
  index: number;
  onChange: (data: Partial<FlightPassengerInfo>) => void;
  onPassportChange: (data: Partial<FlightPassportInfo>) => void;
  isInternational: boolean;
  errors?: Record<string, string>;
}

const COMMON_NATIONALITIES = [
  "Indian",
  "American",
  "British",
  "Emirati",
  "Singaporean",
  "Canadian",
  "Australian",
  "German",
  "French",
  "Malaysian",
  "Other",
];

export function FlightPassengerForm({
  passenger,
  index,
  onChange,
  onPassportChange,
  isInternational,
  errors = {},
}: FlightPassengerFormProps) {
  const [showPassportSection, setShowPassportSection] = React.useState(isInternational);

  const titleOptions =
    passenger.paxType === "ADT"
      ? [
          { label: "Mr.", value: "Mr" },
          { label: "Ms.", value: "Ms" },
          { label: "Mrs.", value: "Mrs" },
        ]
      : [
          { label: "Master", value: "Master" },
          { label: "Miss", value: "Miss" },
        ];

  // Calculate maximum DOB for today (no future DOB)
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4 text-xs">
      {/* ─── Row 1: Title, First Name, Middle Name, Last Name ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Title *
          </label>
          <select
            value={passenger.title}
            onChange={(e) =>
              onChange({ title: e.target.value as FlightPassengerInfo["title"] })
            }
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer",
              errors.title ? "border-red-500" : "border-slate-200"
            )}
          >
            {titleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.title && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.title}</p>
          )}
        </div>

        {/* First Name */}
        <div className="sm:col-span-4">
          <Input
            label="First Name *"
            placeholder="As on Govt ID / Passport"
            value={passenger.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            error={errors.firstName}
            required
            maxLength={40}
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        {/* Middle Name (Optional) */}
        <div className="sm:col-span-2">
          <Input
            label="Middle Name (Optional)"
            placeholder="Middle"
            value={passenger.middleName || ""}
            onChange={(e) => onChange({ middleName: e.target.value })}
            maxLength={30}
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        {/* Last Name */}
        <div className="sm:col-span-4">
          <Input
            label="Last Name *"
            placeholder="Surname"
            value={passenger.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            error={errors.lastName}
            required
            maxLength={40}
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* ─── Row 2: Gender, Date of Birth, Nationality ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-slate-100/80">
        {/* Gender */}
        <div className="sm:col-span-3">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Gender *
          </label>
          <div className="flex gap-2 h-10 items-center">
            {[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ].map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => onChange({ gender: g.value as "male" | "female" })}
                className={cn(
                  "flex-1 h-full rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                  passenger.gender === g.value
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="sm:col-span-4">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Date of Birth *
          </label>
          <div className="relative">
            <input
              type="date"
              max={todayStr}
              value={passenger.dateOfBirth}
              onChange={(e) => onChange({ dateOfBirth: e.target.value })}
              className={cn(
                "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer",
                errors.dateOfBirth ? "border-red-500" : "border-slate-200"
              )}
            />
          </div>
          {errors.dateOfBirth ? (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.dateOfBirth}</p>
          ) : (
            <p className="mt-1 text-[10px] text-slate-400">
              {passenger.paxType === "ADT" && "Age 12+ years"}
              {passenger.paxType === "CHD" && "Age 2–11 years"}
              {passenger.paxType === "INF" && "Age under 2 years"}
            </p>
          )}
        </div>

        {/* Nationality */}
        <div className="sm:col-span-5">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Nationality *
          </label>
          <select
            value={passenger.nationality}
            onChange={(e) => onChange({ nationality: e.target.value })}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer",
              errors.nationality ? "border-red-500" : "border-slate-200"
            )}
          >
            {COMMON_NATIONALITIES.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </select>
          {errors.nationality && (
            <p className="mt-1 text-[11px] font-medium text-red-600">{errors.nationality}</p>
          )}
        </div>
      </div>

      {/* ─── Row 3: Passport & Travel Document (Required for Intl, Expandable for Domestic) ─── */}
      <div className="pt-2 border-t border-slate-100/80">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPassportSection((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Passport & Travel Document{" "}
              {isInternational ? (
                <span className="text-red-500">* (Required for International)</span>
              ) : (
                <span className="text-slate-400 font-normal">(Optional for Domestic)</span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                showPassportSection && "rotate-180"
              )}
            />
          </button>
        </div>

        {showPassportSection && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 animate-in fade-in-50 duration-150">
            {/* Passport Number */}
            <div className="sm:col-span-4">
              <Input
                label={`Passport Number ${isInternational ? "*" : ""}`}
                placeholder="Passport No."
                value={passenger.passport?.passportNumber || ""}
                onChange={(e) => onPassportChange({ passportNumber: e.target.value })}
                error={errors.passportNumber}
                className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {/* Issuing Country */}
            <div className="sm:col-span-3">
              <Input
                label="Issuing Country"
                placeholder="e.g. India"
                value={passenger.passport?.issuingCountry || "India"}
                onChange={(e) => onPassportChange({ issuingCountry: e.target.value })}
                className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {/* Passport Issue Date */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Issue Date
              </label>
              <input
                type="date"
                max={todayStr}
                value={passenger.passport?.issueDate || ""}
                onChange={(e) => onPassportChange({ issueDate: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              />
            </div>

            {/* Passport Expiry Date */}
            <div className="sm:col-span-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Expiry Date {isInternational ? "*" : ""}
              </label>
              <input
                type="date"
                min={todayStr}
                value={passenger.passport?.expiryDate || ""}
                onChange={(e) => onPassportChange({ expiryDate: e.target.value })}
                className={cn(
                  "flex h-10 w-full rounded-lg border bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer",
                  errors.passportExpiry ? "border-red-500" : "border-slate-200"
                )}
              />
              {errors.passportExpiry && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                  {errors.passportExpiry}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
