"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import type { TravellerInfo } from "@/store/bus-booking-store";

export interface TravellerFormProps {
  index: number;
  data: TravellerInfo;
  onChange: (data: Partial<TravellerInfo>) => void;
  showErrors?: boolean;
}

export function TravellerForm({
  index,
  data,
  onChange,
  showErrors = false,
}: TravellerFormProps) {
  // Local validation helper
  const getErrors = () => {
    const errors: Record<string, string> = {};

    if (data.fullName.trim() === "") {
      errors.fullName = "Full name is required";
    } else if (data.fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    }

    const ageNum = parseInt(data.age);
    if (data.age.trim() === "") {
      errors.age = "Age is required";
    } else if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      errors.age = "Enter a valid age (1-120)";
    }

    if (data.gender === "") {
      errors.gender = "Select a gender";
    }

    return errors;
  };

  const errors = getErrors();

  const handleFieldChange = (field: keyof TravellerInfo, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-3.5">
      {/* Row 1: Primary Identity (Full Name, Age, Gender) */}
      <div className="grid gap-3 sm:grid-cols-4">
        {/* Full Name - 50% width on desktop */}
        <div className="sm:col-span-2">
          <Input
            label="Full Name *"
            placeholder="Enter full name"
            value={data.fullName}
            onChange={(e) => handleFieldChange("fullName", e.target.value)}
            error={showErrors ? errors.fullName : undefined}
            maxLength={50}
            required
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        {/* Age - 25% width */}
        <div className="sm:col-span-1">
          <Input
            label="Age *"
            placeholder="Age"
            type="number"
            min={1}
            max={120}
            value={data.age}
            onChange={(e) => handleFieldChange("age", e.target.value)}
            error={showErrors ? errors.age : undefined}
            required
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        {/* Gender - 25% width */}
        <div className="sm:col-span-1 w-full">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Gender *
          </label>
          <select
            value={data.gender}
            onChange={(e) => handleFieldChange("gender", e.target.value)}
            className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer ${
              showErrors && errors.gender ? "border-red-500" : "border-slate-200"
            }`}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {showErrors && errors.gender && (
            <p className="mt-1 text-[11px] font-medium text-red-600" role="alert">
              {errors.gender}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Optional Verification (Nationality, ID Type, ID Number) */}
      <div className="grid gap-3 sm:grid-cols-3 pt-1 border-t border-slate-100/70">
        {/* Nationality (Optional) */}
        <div>
          <Input
            label="Nationality (Optional)"
            placeholder="e.g. Indian"
            value={data.nationality || ""}
            onChange={(e) => handleFieldChange("nationality", e.target.value)}
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        {/* ID Type (Optional) */}
        <div className="w-full">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            ID Type <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <select
            value={data.idType || ""}
            onChange={(e) => handleFieldChange("idType", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="">Select ID Type</option>
            <option value="aadhaar">Aadhaar Card</option>
            <option value="passport">Passport</option>
            <option value="voter_id">Voter ID</option>
            <option value="driving_license">Driving License</option>
            <option value="pan">PAN Card</option>
          </select>
        </div>

        {/* ID Number (Optional) */}
        <div>
          <Input
            label="ID Number (Optional)"
            placeholder="Enter ID number"
            value={data.idNumber || ""}
            onChange={(e) => handleFieldChange("idNumber", e.target.value)}
            disabled={!data.idType}
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
