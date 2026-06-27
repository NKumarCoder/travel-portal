"use client";

import React from "react";
import { FlightCard } from "@/components/travel/flight-card";
import { SearchBox } from "@/components/ui/search-box";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { useSearchStore } from "@/store/search-store";
import type { Flight } from "@/types";
import flightsData from "@/data/flights.json";
import { ArrowRightLeft } from "lucide-react";

export default function FlightsPage() {
  const { from, to, departDate, passengers, setFrom, setTo, setDepartDate, setPassengers, swapFromTo } =
    useSearchStore();
  const [flights, setFlights] = React.useState<Flight[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setFlights(flightsData as Flight[]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Flights</h1>
        <p className="mt-1 text-gray-500">Find the best deals on flights worldwide</p>
      </div>

      {/* Search Form */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-3">
            <SearchBox value={from} onChange={setFrom} placeholder="From (city or airport)" />
          </div>
          <div className="flex items-center justify-center md:col-span-1">
            <Button variant="ghost" size="icon" onClick={swapFromTo} aria-label="Swap cities">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="md:col-span-3">
            <SearchBox value={to} onChange={setTo} placeholder="To (city or airport)" />
          </div>
          <div className="md:col-span-2">
            <DatePicker label="Departure" value={departDate} onChange={setDepartDate} />
          </div>
          <div className="md:col-span-2">
            <PassengerSelector value={passengers} onChange={setPassengers} />
          </div>
          <div className="md:col-span-1">
            <Button className="w-full">Search</Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          {flights.length} flight{flights.length !== 1 ? "s" : ""} found
        </p>
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : (
          flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} onSelect={() => {}} />
          ))
        )}
      </div>
    </div>
  );
}
