"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import type { BusPolicy } from "@/types";

interface PolicyCardProps {
  policy: BusPolicy;
  className?: string;
}

export function PolicyCard({ policy, className }: PolicyCardProps) {
  // Extract deduction rate (e.g. "100%", "90%")
  const isCancellation = policy.description.toLowerCase().includes("cancellation");
  const chargeText = isCancellation 
    ? policy.description.replace(/cancellation charge:\s*/i, "")
    : policy.description;

  const isHighDeduction = chargeText.includes("100") || chargeText.includes("90") || chargeText.includes("80");
  const isMediumDeduction = chargeText.includes("40") || chargeText.includes("50") || chargeText.includes("60");
  
  const badgeClass = isHighDeduction
    ? "bg-red-50 text-red-600 border-red-100"
    : isMediumDeduction
    ? "bg-amber-50 text-amber-600 border-amber-100"
    : "bg-green-50 text-green-600 border-green-100";

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-150 bg-white p-4 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      {/* Visual top border indicator */}
      <div className={cn(
        "absolute top-0 inset-x-0 h-1 bg-gradient-to-r",
        isHighDeduction ? "from-red-400 to-rose-500" : isMediumDeduction ? "from-amber-400 to-orange-500" : "from-green-400 to-emerald-500"
      )} />
      
      <div className="space-y-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Info className="h-3.5 w-3.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Time Window</span>
        </div>
        <p className="text-xs font-semibold text-gray-800 leading-snug">
          {policy.title}
        </p>
      </div>
      
      <div className="mt-3 border-t border-gray-100 pt-2.5 flex items-center justify-between">
        <span className="text-[11px] text-gray-400 font-medium">Deduction fee</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold border", badgeClass)}>
          {chargeText}
        </span>
      </div>
    </div>
  );
}

interface PolicyListProps {
  policies: BusPolicy[];
  className?: string;
}

export function PolicyList({ policies, className }: PolicyListProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {policies.map((policy) => (
        <PolicyCard key={policy.title} policy={policy} />
      ))}
    </div>
  );
}
