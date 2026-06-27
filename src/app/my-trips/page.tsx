"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { useBookingStore } from "@/store/booking-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plane, Hotel, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

const tripTabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const statusIcons = {
  confirmed: <CheckCircle className="h-4 w-4 text-green-600" />,
  pending: <Clock className="h-4 w-4 text-yellow-600" />,
  cancelled: <XCircle className="h-4 w-4 text-red-600" />,
  completed: <CheckCircle className="h-4 w-4 text-blue-600" />,
};

const typeIcons = {
  flight: <Plane className="h-5 w-5 text-blue-600" />,
  hotel: <Hotel className="h-5 w-5 text-amber-600" />,
  bus: <Plane className="h-5 w-5 text-green-600" />,
  activity: <Plane className="h-5 w-5 text-purple-600" />,
  package: <Plane className="h-5 w-5 text-indigo-600" />,
};

export default function MyTripsPage() {
  const { bookings, isLoading, loadBookings } = useBookingStore();
  const [activeTab, setActiveTab] = React.useState("upcoming");

  React.useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") return booking.status === "confirmed" || booking.status === "pending";
    if (activeTab === "completed") return booking.status === "completed";
    if (activeTab === "cancelled") return booking.status === "cancelled";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
        <p className="mt-1 text-gray-500">Manage your bookings and travel plans</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tripTabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {/* Content */}
      <TabPanel id={activeTab} activeTab={activeTab}>
        {isLoading ? (
          <ListSkeleton count={3} />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No trips found"
            description={`You don't have any ${activeTab} trips yet.`}
            actionLabel="Explore Packages"
            onAction={() => {}}
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                      {typeIcons[booking.type]}
                    </div>
                    <div>
                      <p className="font-semibold capitalize text-gray-900">
                        {booking.type} Booking
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(booking.travelDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      {statusIcons[booking.status]}
                      <span className="text-sm capitalize text-gray-600">{booking.status}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(booking.totalAmount, booking.currency)}
                    </p>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabPanel>
    </div>
  );
}
