"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlightBookingStore } from "@/store/flight-booking-store";
import { useSearchStore } from "@/store/search-store";
import {
  FlightItineraryCard,
  FlightPassengerCard,
  FlightContactCard,
  FlightGSTCard,
  FlightSSRCard,
  FlightFareSummaryCard,
} from "@/components/flights/booking";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Plane,
  AlertCircle,
  Lock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FlightCustomerInformationPage() {
  const router = useRouter();

  const {
    selectedOnwardFlight,
    selectedReturnFlight,
    searchContext,
    passengers,
    contactInfo,
    gstInfo,
    ssrSelections,
    agreeTerms,
    isSubmitting,
    initializeBooking,
    updatePassenger,
    updatePassengerPassport,
    updateContactInfo,
    updateGSTInfo,
    updateSSRSelection,
    setAgreeTerms,
    setIsSubmitting,
    isInternational,
    calculateTotalFare,
    validateAll,
  } = useFlightBookingStore();

  const searchStore = useSearchStore();

  const [validationErrors, setValidationErrors] = useState<{
    contact?: Record<string, string>;
    passengers?: Record<number, Record<string, string>>;
    gst?: Record<string, string>;
    terms?: string;
  }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Auto-sync from search store if booking store is not initialized yet
  useEffect(() => {
    if (
      !selectedOnwardFlight &&
      searchStore.selectedOnwardFlight
    ) {
      initializeBooking(
        searchStore.selectedOnwardFlight,
        searchStore.selectedReturnFlight,
        {
          tripType: searchStore.tripType,
          fromAirport: searchStore.fromAirport,
          toAirport: searchStore.toAirport,
          departDate: searchStore.departDate,
          returnDate: searchStore.returnDate,
          passengers: searchStore.passengers,
          travelClass: searchStore.travelClass,
          traceId: searchStore.flightTraceId,
        }
      );
    }
  }, [selectedOnwardFlight, searchStore, initializeBooking]);

  // Proceed to next step action
  const handleProceedToPayment = () => {
    setHasAttemptedSubmit(true);
    const { isValid, errors } = validateAll();
    setValidationErrors(errors);

    if (!isValid) {
      // Scroll to the first error
      const firstErrorEl = document.querySelector(".border-red-500, [role='alert']");
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate safe transition to review/payment step
    setTimeout(() => {
      setIsSubmitting(false);
      alert(
        `Customer details validated successfully for ${passengers.length} passenger(s)!\nTotal Payable: ₹${calculateTotalFare().totalAmount.toLocaleString(
          "en-IN"
        )}\nNext Step: Payment Gateway Integration.`
      );
    }, 600);
  };

  // Safe Guard: If no flight selected, render informative empty state
  if (!selectedOnwardFlight) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
            <Plane className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">No Flight Selected</h2>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
            Please search for flights and select your onward (and return) journey before entering passenger details.
          </p>
          <div className="mt-5">
            <Link href="/flights">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl cursor-pointer">
                Back to Flight Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { baseFare, taxes, extras, totalAmount } = calculateTotalFare();
  const isIntl = isInternational();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 lg:pb-12">
      {/* ─── 1. Ultra-Compact Checkout Progress Header (Fixed/Sticky Top) ─── */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-white">
                    Passenger & Customer Information
                  </h1>
                  <span className="hidden sm:inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    Step 2 of 3
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter passenger details for flight booking & e-ticket issuance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Secure booking</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── 2. Main 2-Column Checkout Workspace ─── */}
      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-5 sm:px-6">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Left Column: Form Details */}
          <div className="flex-1 space-y-5 min-w-0">
            {/* 1. Selected Flight Itinerary Summary */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
                    <Plane className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Selected Flight
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Review your selected flight timings and route details
                    </p>
                  </div>
                </div>

                <Link
                  href="/flights/search"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Change Flight
                </Link>
              </div>

              <FlightItineraryCard
                onwardFlight={selectedOnwardFlight}
                returnFlight={selectedReturnFlight}
              />
            </div>

            {/* 2. Contact Details Card */}
            <FlightContactCard
              contactInfo={contactInfo}
              onChange={updateContactInfo}
              errors={validationErrors.contact}
            />

            {/* 3. Passenger Information Cards List */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Passenger Information
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Name must exactly match Government photo ID or Passport
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-600 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                  {passengers.length} Passenger{passengers.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {passengers.map((p, idx) => (
                  <FlightPassengerCard
                    key={p.id}
                    passenger={p}
                    index={idx}
                    onChange={(data) => updatePassenger(idx, data)}
                    onPassportChange={(data) => updatePassengerPassport(idx, data)}
                    isInternational={isIntl}
                    errors={validationErrors.passengers?.[idx]}
                  />
                ))}
              </div>
            </div>

            {/* 4. GST / Business Information Card */}
            <FlightGSTCard
              gstInfo={gstInfo}
              onChange={updateGSTInfo}
              errors={validationErrors.gst}
            />

            {/* 5. Travel Extras / SSR Card */}
            <FlightSSRCard
              passengers={passengers}
              ssrSelections={ssrSelections}
              onChange={updateSSRSelection}
            />

            {/* Mobile Bottom Terms & CTA */}
            <div className="lg:hidden space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-xl bg-white border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4 accent-emerald-600 cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I agree to the airline{" "}
                  <span className="text-slate-900 font-bold underline">Fare Rules</span>,{" "}
                  <span className="text-slate-900 font-bold underline">Terms & Conditions</span>.
                </span>
              </label>
              {validationErrors.terms && (
                <p className="text-[11px] font-medium text-red-600">
                  {validationErrors.terms}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="sticky top-16 space-y-3">
              <FlightFareSummaryCard
                onwardFlight={selectedOnwardFlight}
                returnFlight={selectedReturnFlight}
                baseFare={baseFare}
                taxes={taxes}
                extras={extras}
                totalAmount={totalAmount}
                agreeTerms={agreeTerms}
                onAgreeTermsChange={setAgreeTerms}
                onProceed={handleProceedToPayment}
                isProcessing={isSubmitting}
                termsError={validationErrors.terms}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* ─── 3. Mobile Fixed Sticky Bottom Bar (< 1024px) ─── */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 border-t border-slate-200 p-3 shadow-xl backdrop-blur-md lg:hidden flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Payable
          </span>
          <p className="text-base font-extrabold text-emerald-700">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <Button
          size="sm"
          className="h-10 px-5 gap-1.5 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-60"
          onClick={handleProceedToPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Please wait..."
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              Continue to Payment →
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
