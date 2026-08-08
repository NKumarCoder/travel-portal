"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { useBookingGuard } from "@/hooks/use-booking-guard";
import { TravellerCard } from "@/components/booking/traveller-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  Bus as BusIcon,
  MapPin,
  Clock,
  Calendar,
  Lock,
} from "lucide-react";

export default function TravellersPage() {
  const params = useParams();
  const router = useRouter();
  
  // Dynamic bus ID from path
  const busId = params.id as string;
  const decodedBusId = decodeURIComponent(busId);

  // Route guard: requires selected seats, boarding, and dropping point
  const { isReady } = useBookingGuard(
    ["seats", "boardingPoint", "droppingPoint"],
    decodedBusId
  );

  const {
    selectedSeats,
    travellers,
    initTravellers,
    updateTraveller,
    contactInfo,
    setContactInfo,
    isTravellerFormValid,
    isContactValid,
    selectedBusData: bus,
    boardingPoint,
    droppingPoint,
    getBaseFare,
    getTaxes,
    getConvenienceFee,
    getTotalAmount,
  } = useBusBookingStore();

  const [showErrors, setShowErrors] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Initialize travellers forms on load if seats exist
  React.useEffect(() => {
    if (isReady && selectedSeats.length > 0) {
      initTravellers();
    }
  }, [isReady, selectedSeats.length, initTravellers]);

  const handleProceedToPayment = () => {
    setShowErrors(true);
    if (isTravellerFormValid() && isContactValid()) {
      setIsProcessing(true);
      // Route to payment page with URL-encoded bus ID
      router.push(`/buses/${encodeURIComponent(decodedBusId)}/payment`);
    }
  };

  if (!isReady || selectedSeats.length === 0) {
    return null; // Guard redirects to selection page
  }

  const baseFare = getBaseFare();
  const taxes = getTaxes();
  const convenienceFee = getConvenienceFee();
  const total = getTotalAmount();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 lg:pb-12">
      {/* 1. Ultra-Compact Premium Checkout Progress Header (Fixed Top: ~56-64px) */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label="Go back"
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-white">
                    Traveller Details
                  </h1>
                  <span className="hidden sm:inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Step 3 of 4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Passenger & contact info for tickets</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Secure checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main 2-Column Checkout Workspace */}
      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-5 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row">
          
          {/* Left Column: Form Details */}
          <div className="flex-1 space-y-5 min-w-0">
            
            {/* Passenger Information Cards List */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">Passenger Information</h2>
                    <p className="text-[11px] text-slate-500">Enter details for each seat</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                  {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""} Selected
                </span>
              </div>

              <div className="space-y-3">
                {travellers.map((traveller, index) => (
                  <TravellerCard
                    key={traveller.seatNo}
                    index={index}
                    seatNo={traveller.seatNo}
                    data={traveller}
                    onChange={(data) => updateTraveller(index, data)}
                    showErrors={showErrors}
                  />
                ))}
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs">
              <div className="mb-3 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Contact Details</h3>
                  <p className="text-[11px] text-slate-400">E-tickets and SMS updates will be sent here</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-12 items-end">
                {/* Country Code */}
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Code</label>
                  <select
                    value={contactInfo.countryCode}
                    onChange={(e) => setContactInfo({ countryCode: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                </div>

                {/* Mobile Input */}
                <div className="sm:col-span-4">
                  <Input
                    label="Mobile Number *"
                    placeholder="10-digit number"
                    type="tel"
                    value={contactInfo.mobile}
                    onChange={(e) => setContactInfo({ mobile: e.target.value })}
                    error={
                      showErrors && !/^[6-9]\d{9}$/.test(contactInfo.mobile)
                        ? "Enter valid 10-digit mobile number"
                        : undefined
                    }
                    maxLength={10}
                    required
                    className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Email Input */}
                <div className="sm:col-span-5">
                  <Input
                    label="Email Address *"
                    placeholder="name@example.com"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ email: e.target.value })}
                    error={
                      showErrors && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)
                        ? "Enter valid email address"
                        : undefined
                    }
                    required
                    className="h-10 text-xs border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="sticky top-16 space-y-3">
              
              {/* Journey Details summary card */}
              {bus && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
                  <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <BusIcon className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Journey Details</h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{bus.operator}</p>
                      <span className="inline-block rounded bg-slate-100 border border-slate-200/80 px-1.5 py-0.2 text-[9px] font-bold uppercase text-slate-600 mt-0.5">
                        {bus.busType.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1 font-semibold">
                      <span>{bus.departure.city} → {bus.arrival.city}</span>
                      <span className="text-slate-400 font-normal">{bus.duration}</span>
                    </div>

                    {boardingPoint && droppingPoint && (
                      <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
                        <div className="flex items-start gap-1.5 text-xs">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-[11px]">Boarding Point</p>
                            <p className="text-slate-600 truncate text-[11px]">{boardingPoint.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{boardingPoint.time}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-[11px]">Dropping Point</p>
                            <p className="text-slate-600 truncate text-[11px]">{droppingPoint.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{droppingPoint.time}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fare Summary card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
                <h3 className="mb-2.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Fare Summary
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Fare ({selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""})</span>
                    <span className="font-semibold text-slate-800">₹{baseFare.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (5%)</span>
                    <span className="font-semibold text-slate-800">₹{taxes.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Convenience Fee</span>
                    <span className="font-semibold text-slate-800">₹{convenienceFee.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-slate-200/80 pt-2 text-sm font-extrabold text-slate-900 mt-1">
                    <span>Total Amount</span>
                    <span className="text-emerald-700">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Payment Action Button */}
              <Button
                size="lg"
                className="w-full h-11 gap-2 text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer"
                onClick={handleProceedToPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  "Please wait..."
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Proceed to Payment →
                  </>
                )}
              </Button>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Fixed Sticky Bottom Bar (< 1024px) */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 border-t border-slate-200 p-3 shadow-xl backdrop-blur-md lg:hidden flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Payable</span>
          <p className="text-base font-extrabold text-emerald-700">₹{total.toLocaleString("en-IN")}</p>
        </div>
        <Button
          size="sm"
          className="h-10 px-5 gap-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
          onClick={handleProceedToPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            "Please wait..."
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              Proceed to Payment →
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
