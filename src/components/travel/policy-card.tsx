"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import type { BusPolicy } from "@/types";

interface PolicyCardProps {
  policy: BusPolicy;
  className?: string;
}

export function PolicyCard({ policy, className }: PolicyCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-100 bg-gray-50 p-4",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-500" />
        <h4 className="text-sm font-semibold text-gray-900">{policy.title}</h4>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{policy.description}</p>
    </div>
  );
}

interface PolicyListProps {
  policies: BusPolicy[];
  className?: string;
}

export function PolicyList({ policies, className }: PolicyListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {policies.map((policy) => (
        <PolicyCard key={policy.title} policy={policy} />
      ))}
    </div>
  );
}
