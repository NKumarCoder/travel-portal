"use client";

import React from "react";
import { PackageCard } from "@/components/travel/package-card";
import { SearchBox } from "@/components/ui/search-box";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import type { Package } from "@/types";
import packagesData from "@/data/packages.json";

const categoryTabs = [
  { id: "all", label: "All Packages" },
  { id: "beach-&-culture", label: "Beach & Culture" },
  { id: "adventure", label: "Adventure" },
  { id: "cultural", label: "Cultural" },
  { id: "honeymoon", label: "Honeymoon" },
];

export default function PackagesPage() {
  const [packages, setPackages] = React.useState<Package[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPackages(packagesData as Package[]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    if (activeTab === "all") return true;
    return pkg.category.toLowerCase().replace(/\s+/g, "-") === activeTab;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Travel Packages</h1>
        <p className="mt-1 text-gray-500">Curated packages for every type of traveler</p>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search packages by destination..."
          />
        </div>
        <Button>Search</Button>
      </div>

      {/* Category Tabs */}
      <Tabs tabs={categoryTabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {/* Results */}
      <TabPanel id={activeTab} activeTab={activeTab}>
        <p className="mb-4 text-sm text-gray-500">
          {filteredPackages.length} package{filteredPackages.length !== 1 ? "s" : ""} found
        </p>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} onSelect={() => {}} />
            ))}
          </div>
        )}
      </TabPanel>
    </div>
  );
}
