"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FlightGSTInfo } from "@/store/flight-booking-store";

interface FlightGSTCardProps {
  gstInfo: FlightGSTInfo;
  onChange: (data: Partial<FlightGSTInfo>) => void;
  errors?: Record<string, string>;
  className?: string;
}

export function FlightGSTCard({
  gstInfo,
  onChange,
  errors = {},
  className = "",
}: FlightGSTCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs ${className}`}
    >
      {/* Header with Checkbox */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
              GST / Business Information
            </h3>
            <p className="text-[11px] text-slate-400">
              Claim business input tax credit on your flight ticket
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={gstInfo.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4 accent-emerald-600 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-700">Add GST Details</span>
        </label>
      </div>

      {/* Expandable Form Fields */}
      {gstInfo.enabled && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid gap-3 sm:grid-cols-2 animate-in fade-in-50 duration-150 text-xs">
          {/* GSTIN */}
          <div>
            <Input
              label="GST Number (GSTIN) *"
              placeholder="e.g. 36AABCU9603R1ZM"
              value={gstInfo.gstNumber}
              onChange={(e) => onChange({ gstNumber: e.target.value.toUpperCase() })}
              error={errors.gstNumber}
              maxLength={15}
              required
              className="h-10 text-xs uppercase border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          {/* Company Name */}
          <div>
            <Input
              label="Registered Company / Business Name *"
              placeholder="e.g. Acme Corporation Pvt Ltd"
              value={gstInfo.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              error={errors.companyName}
              required
              className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          {/* GST Email */}
          <div>
            <Input
              label="GST Email Address (Optional)"
              placeholder="accounts@company.com"
              type="email"
              value={gstInfo.gstEmail}
              onChange={(e) => onChange({ gstEmail: e.target.value })}
              error={errors.gstEmail}
              className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          {/* GST Mobile */}
          <div>
            <Input
              label="GST Phone / Mobile (Optional)"
              placeholder="Contact phone"
              type="tel"
              value={gstInfo.gstMobile}
              onChange={(e) => onChange({ gstMobile: e.target.value })}
              className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
