"use client";

import type { Flight } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Luggage } from "lucide-react";

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  return (
    <Card className="p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Airline info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Plane className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{flight.airline}</p>
            <p className="text-xs text-gray-500">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex flex-1 items-center justify-between gap-4 md:justify-center">
          {/* Departure */}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{flight.departure.time}</p>
            <p className="text-xs text-gray-500">{flight.departure.code}</p>
          </div>

          {/* Duration */}
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500">{flight.duration}</p>
            <div className="my-1 flex items-center">
              <div className="h-px w-12 bg-gray-300 md:w-20" />
              <Plane className="mx-1 h-3 w-3 text-gray-400" />
              <div className="h-px w-12 bg-gray-300 md:w-20" />
            </div>
            <p className="text-xs text-gray-500">
              {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{flight.arrival.time}</p>
            <p className="text-xs text-gray-500">{flight.arrival.code}</p>
          </div>
        </div>

        {/* Price & action */}
        <div className="flex items-center justify-between md:flex-col md:items-end md:gap-2">
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(flight.price, flight.currency)}
            </p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
          <Button size="sm" onClick={() => onSelect?.(flight)}>
            Select
          </Button>
        </div>
      </div>

      {/* Footer details */}
      <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Luggage className="h-3 w-3" />
          <span>Cabin: {flight.baggage.cabin}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Luggage className="h-3 w-3" />
          <span>Check-in: {flight.baggage.checkin}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span className="capitalize">{flight.class.replace("_", " ")}</span>
        </div>
        {flight.refundable && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            Refundable
          </span>
        )}
        {flight.seatsAvailable <= 5 && (
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
            Only {flight.seatsAvailable} seats left
          </span>
        )}
      </div>
    </Card>
  );
}
