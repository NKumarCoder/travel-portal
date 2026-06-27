"use client";

import React from "react";
import { HotelCard } from "@/components/travel/hotel-card";
import { SearchBox } from "@/components/ui/search-box";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { useSearchStore } from "@/store/search-store";
import type { Hotel } from "@/types";
import hotelsData from "@/data/hotels.json";

export default function HotelsPage() {
  const { destination, departDate, returnDate, passengers, setDestination, setDepartDate, setReturnDate, setPassengers } =
    useSearchStore();
  const [hotels, setHotels] = React.useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHotels(hotelsData as Hotel[]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Hotels</h1>
        <p className="mt-1 text-gray-500">Discover the perfect stay for your trip</p>
      </div>

      {/* Search Form */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            <SearchBox value={destination} onChange={setDestination} placeholder="Where are you going?" />
          </div>
          <div className="md:col-span-3">
            <DatePicker label="Check-in" value={departDate} onChange={setDepartDate} />
          </div>
          <div className="md:col-span-3">
            <DatePicker label="Check-out" value={returnDate} onChange={setReturnDate} minDate={departDate} />
          </div>
          <div className="md:col-span-2">
            <PassengerSelector value={passengers} onChange={setPassengers} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Search Hotels</Button>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="mb-4 text-sm text-gray-500">
          {hotels.length} hotel{hotels.length !== 1 ? "s" : ""} found
        </p>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} onSelect={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
