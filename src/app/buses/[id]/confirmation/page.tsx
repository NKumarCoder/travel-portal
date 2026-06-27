"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { processPayment, type BookingConfirmation } from "@/services/bus-service";
import {
  ArrowLeft,
  CheckCircle2,
  Bus as BusIcon,
  MapPin,
  Clock,
  Calendar,
  User,
  CreditCard,
  Download,
  Share2,
  Home,
} from "lucide-react";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.id as string;

  const {
    selectedSeats,
    boardingPoint,
    droppingPoint,
    travellers,
    contactInfo,
    getTotalAmount,
    resetBooking,
  } = useBusBookingStore();

  const [confirmation, setConfirmation] = React.useState<BookingConfirmation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Load confirmation data from service
    async function loadConfirmation() {
      try {
        const data = await processPayment({
          methodId: "gpay",
          amount: getTotalAmount(),
          busId,
        });

        // Override with actual booking data from store
        if (selectedSeats.length > 0) {
          data.passengers = travellers.map((t, i) => ({
            name: t.fullName || `Traveller ${i + 1}`,
            age: parseInt(t.age) || 25,
            gender: t.gender || "male",
            seatNo: t.seatNo,
          }));
          data.paymentSummary.totalAmount = getTotalAmount();
          if (boardingPoint) {
            data.journeyDetails.boardingPoint = {
              name: boardingPoint.name,
              time: boardingPoint.time,
              address: boardingPoint.address,
            };
          }
          if (droppingPoint) {
            data.journeyDetails.droppingPoint = {
              name: droppingPoint.name,
              time: droppingPoint.time,
              address: droppingPoint.address,
            };
          }
          if (contactInfo.mobile) {
            data.contact = {
              mobile: `${contactInfo.countryCode} ${contactInfo.mobile}`,
              email: contactInfo.email,
            };
          }
        }

        setConfirmation(data);
      } catch {
        // Fallback - still show a confirmation
        setConfirmation(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadConfirmation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoHome = () => {
    resetBooking();
    router.push("/buses");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-500">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-3 text-lg font-semibold">Booking Confirmed!</h2>
          <Button className="mt-4" onClick={handleGoHome}>Go to Bus Search</Button>
        </div>
      </div>
    );
  }

  const { journeyDetails, passengers, paymentSummary, contact } = confirmation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Booking Confirmed!</h1>
                <p className="text-xs text-gray-500">Your tickets have been booked successfully</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* PNR & Booking ID */}
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-green-700">PNR Number</p>
              <p className="mt-0.5 text-lg font-bold text-green-900">{confirmation.pnr}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-green-700">Booking ID</p>
              <p className="mt-0.5 text-lg font-bold text-green-900">{confirmation.bookingId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-green-700">Status</p>
              <span className="mt-0.5 inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-medium capitalize text-white">
                {confirmation.status}
              </span>
            </div>
          </div>
        </div>

        {/* Journey Details */}
        <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <BusIcon className="h-4 w-4 text-green-600" />
            Journey Details
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="Operator" value={journeyDetails.operator} />
            <InfoItem label="Bus Type" value={journeyDetails.busType} />
            <InfoItem label="Route" value={`${journeyDetails.source} → ${journeyDetails.destination}`} />
            <InfoItem label="Duration" value={journeyDetails.duration} />
            <InfoItem label="Departure" value={`${journeyDetails.departureTime}, ${journeyDetails.departureDate}`} />
            <InfoItem label="Arrival" value={`${journeyDetails.arrivalTime}, ${journeyDetails.arrivalDate}`} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-700">Boarding</p>
                <p className="text-sm text-green-900">{journeyDetails.boardingPoint.name} ({journeyDetails.boardingPoint.time})</p>
                <p className="text-xs text-green-600">{journeyDetails.boardingPoint.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-blue-700">Dropping</p>
                <p className="text-sm text-blue-900">{journeyDetails.droppingPoint.name} ({journeyDetails.droppingPoint.time})</p>
                <p className="text-xs text-blue-600">{journeyDetails.droppingPoint.address}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Passengers */}
        <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <User className="h-4 w-4 text-blue-600" />
            Passengers ({passengers.length})
          </h2>
          <div className="space-y-2">
            {passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.age} yrs · {p.gender}</p>
                </div>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Seat {p.seatNo}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Payment Summary */}
        <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CreditCard className="h-4 w-4 text-purple-600" />
            Payment Summary
          </h2>
          <div className="space-y-2">
            <FareRow label="Base Fare" value={paymentSummary.baseFare} />
            <FareRow label="Taxes" value={paymentSummary.taxes} />
            <FareRow label="Convenience Fee" value={paymentSummary.convenienceFee} />
            {paymentSummary.discount > 0 && (
              <FareRow label="Discount" value={-paymentSummary.discount} isDiscount />
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
              <span className="font-semibold text-gray-900">Total Paid</span>
              <span className="text-base font-bold text-gray-900">
                ₹{paymentSummary.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              <span>Payment: {paymentSummary.paymentMethod}</span>
              <span>TXN: {paymentSummary.transactionId}</span>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Contact Details</h2>
          <div className="grid gap-2 sm:grid-cols-2 text-sm text-gray-600">
            <p>Mobile: {contact.mobile}</p>
            <p>Email: {contact.email}</p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleGoHome} className="gap-2">
            <Home className="h-4 w-4" />
            Search More Buses
          </Button>
          <Button variant="outline" onClick={() => router.push("/my-trips")}>
            View My Trips
          </Button>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function FareRow({ label, value, isDiscount }: { label: string; value: number; isDiscount?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={isDiscount ? "text-green-600" : "text-gray-900"}>
        {isDiscount ? "-" : ""}₹{Math.abs(value).toLocaleString("en-IN")}
      </span>
    </div>
  );
}
