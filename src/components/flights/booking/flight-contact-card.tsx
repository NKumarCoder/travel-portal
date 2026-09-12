"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FlightContactInfo } from "@/store/flight-booking-store";

interface FlightContactCardProps {
  contactInfo: FlightContactInfo;
  onChange: (data: Partial<FlightContactInfo>) => void;
  errors?: Record<string, string>;
  className?: string;
}

export function FlightContactCard({
  contactInfo,
  onChange,
  errors = {},
  className = "",
}: FlightContactCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="mb-3 border-b border-slate-100 pb-2.5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
            Contact Information
          </h3>
          <p className="text-[11px] text-slate-400">
            Booking confirmation, e-tickets & flight alerts will be sent here
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-3 sm:grid-cols-12 items-end">
        {/* Country Code */}
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Country Code</label>
          <select
            value={contactInfo.countryCode}
            onChange={(e) => onChange({ countryCode: e.target.value })}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="+91">+91 (India)</option>
            <option value="+1">+1 (USA / Canada)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+971">+971 (UAE)</option>
            <option value="+65">+65 (Singapore)</option>
            <option value="+61">+61 (Australia)</option>
          </select>
        </div>

        {/* Mobile Number */}
        <div className="sm:col-span-4">
          <Input
            label="Mobile Number *"
            placeholder="10-digit mobile number"
            type="tel"
            value={contactInfo.mobile}
            onChange={(e) => onChange({ mobile: e.target.value })}
            error={errors.mobile}
            maxLength={10}
            required
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        {/* Email Address */}
        <div className="sm:col-span-5">
          <Input
            label="Email Address *"
            placeholder="passenger@example.com"
            type="email"
            value={contactInfo.email}
            onChange={(e) => onChange({ email: e.target.value })}
            error={errors.email}
            required
            className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>
      </div>
    </div>
  );
}
