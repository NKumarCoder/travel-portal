"use client";

import React from "react";
import { ActivityCard } from "@/components/travel/activity-card";
import { SearchBox } from "@/components/ui/search-box";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import type { Activity } from "@/types";
import activitiesData from "@/data/activities.json";

const categoryTabs = [
  { id: "all", label: "All" },
  { id: "adventure", label: "Adventure" },
  { id: "cultural", label: "Cultural" },
  { id: "water-sports", label: "Water Sports" },
  { id: "food", label: "Food & Drink" },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setActivities(activitiesData as Activity[]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === "all") return true;
    return activity.category.toLowerCase().replace(/\s+/g, "-") === activeTab;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activities & Experiences</h1>
        <p className="mt-1 text-gray-500">Discover unforgettable experiences at your destination</p>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search activities, tours, experiences..."
          />
        </div>
        <Button>Search</Button>
      </div>

      {/* Category Tabs */}
      <Tabs tabs={categoryTabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {/* Results */}
      <TabPanel id={activeTab} activeTab={activeTab}>
        <p className="mb-4 text-sm text-gray-500">
          {filteredActivities.length} activit{filteredActivities.length !== 1 ? "ies" : "y"} found
        </p>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} onSelect={() => {}} />
            ))}
          </div>
        )}
      </TabPanel>
    </div>
  );
}
