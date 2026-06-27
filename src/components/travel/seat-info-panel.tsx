"use client";

import { cn } from "@/lib/utils";
import type { Seat } from "@/types";
import { Armchair, Layers, IndianRupee, MapPin } from "lucide-react";

interface SeatInfoPanelProps {
  seat: Seat | null;
  className?: string;
}

export function SeatInfoPanel({ seat, className }: SeatInfoPanelProps) {
  if (!seat) {
    return (
      <div className={cn("rounded-lg border border-dashed border-gray-200 p-4 text-center", className)}>
        <p className="text-xs text-gray-400">Click on a seat to see details</p>
      </div>
    );
  }

  const seatTypeLabel = seat.seatType.replace("_", " ");

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white p-4", className)}>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Seat Information
      </h4>
      <div className="space-y-2.5">
        <InfoRow
          icon={<Armchair className="h-4 w-4 text-blue-500" />}
          label="Seat Number"
          value={seat.seatNo}
        />
        <InfoRow
          icon={<Layers className="h-4 w-4 text-purple-500" />}
          label="Deck"
          value={seat.deck === "lower" ? "Lower Deck" : "Upper Deck"}
        />
        <InfoRow
          icon={<IndianRupee className="h-4 w-4 text-green-500" />}
          label="Price"
          value={`₹${seat.price.toLocaleString("en-IN")}`}
        />
        <InfoRow
          icon={<Armchair className="h-4 w-4 text-orange-500" />}
          label="Seat Type"
          value={seatTypeLabel.charAt(0).toUpperCase() + seatTypeLabel.slice(1)}
        />
        <InfoRow
          icon={<MapPin className="h-4 w-4 text-cyan-500" />}
          label="Position"
          value={seat.position.charAt(0).toUpperCase() + seat.position.slice(1)}
        />
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="flex flex-1 items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
    </div>
  );
}
