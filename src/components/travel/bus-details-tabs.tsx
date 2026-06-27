"use client";

import React from "react";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { AmenitiesFullGrid } from "@/components/travel/amenities-grid";
import { PolicyList } from "@/components/travel/policy-card";
import { MapPin, Clock } from "lucide-react";
import type { Bus, BusBoardingPoint } from "@/types";

interface BusDetailsTabsProps {
  bus: Bus;
}

function PointsList({
  points,
  type,
}: {
  points: BusBoardingPoint[];
  type: "boarding" | "dropping";
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {type === "boarding" ? "Boarding Points" : "Dropping Points"}
      </h4>
      <div className="space-y-2">
        {points.map((point) => (
          <div
            key={point.id}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
          >
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                type === "boarding"
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{point.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {point.time}
                </div>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{point.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BusDetailsTabs({ bus }: BusDetailsTabsProps) {
  const [activeTab, setActiveTab] = React.useState("boarding");

  const tabs = [
    { id: "boarding", label: "Boarding & Dropping" },
    { id: "amenities", label: "Amenities" },
    { id: "policies", label: "Policies" },
  ];

  return (
    <div className="mt-4 rounded-lg border border-gray-100 bg-white">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="px-2"
      />

      <div className="p-4">
        <TabPanel id="boarding" activeTab={activeTab} className="py-0">
          <div className="grid gap-6 md:grid-cols-2">
            <PointsList points={bus.boardingPoints} type="boarding" />
            <PointsList points={bus.droppingPoints} type="dropping" />
          </div>
        </TabPanel>

        <TabPanel id="amenities" activeTab={activeTab} className="py-0">
          <AmenitiesFullGrid amenities={bus.amenities} />
        </TabPanel>

        <TabPanel id="policies" activeTab={activeTab} className="py-0">
          <PolicyList policies={bus.policies} />
        </TabPanel>
      </div>
    </div>
  );
}
