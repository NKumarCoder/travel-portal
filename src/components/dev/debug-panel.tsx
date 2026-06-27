"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { useSearchStore } from "@/store/search-store";
import { DEBUG_MODE } from "@/lib/debug";
import { cn } from "@/lib/utils";
import { Bug, X, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Developer Debug Panel - only visible when DEBUG_MODE is true.
 * Displays current booking store, search store, and route info in a collapsible overlay.
 */
export function DebugPanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"booking" | "search" | "route">("booking");
  const pathname = usePathname();

  // Don't render in production
  if (!DEBUG_MODE) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Toggle debug panel"
        title="Developer Debug Panel"
      >
        <Bug className="h-5 w-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-[9999] w-80 max-h-[70vh] overflow-hidden rounded-xl border border-purple-200 bg-white shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-100 bg-purple-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-900">Dev Panel</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-0.5 text-purple-400 hover:text-purple-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(["booking", "search", "route"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-2 py-1.5 text-[10px] font-medium capitalize transition-colors",
                  activeTab === tab
                    ? "border-b-2 border-purple-600 text-purple-700"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="max-h-[55vh] overflow-y-auto p-3">
            {activeTab === "booking" && <BookingStorePanel />}
            {activeTab === "search" && <SearchStorePanel />}
            {activeTab === "route" && <RoutePanel pathname={pathname} />}
          </div>
        </div>
      )}
    </>
  );
}

function BookingStorePanel() {
  const store = useBusBookingStore();

  return (
    <div className="space-y-2 text-[10px]">
      <DebugSection title="Flow State">
        <DebugRow label="Current Step" value={store.currentStep} />
        <DebugRow label="Bus ID" value={store.busId || "—"} />
      </DebugSection>

      <DebugSection title="Seats">
        <DebugRow label="Count" value={String(store.selectedSeats.length)} />
        <DebugRow label="Seats" value={store.selectedSeats.map((s) => s.seatNo).join(", ") || "—"} />
        <DebugRow label="Base Fare" value={`₹${store.getBaseFare()}`} />
      </DebugSection>

      <DebugSection title="Points">
        <DebugRow label="Boarding" value={store.boardingPoint?.name || "—"} />
        <DebugRow label="Dropping" value={store.droppingPoint?.name || "—"} />
      </DebugSection>

      <DebugSection title="Fare">
        <DebugRow label="Base" value={`₹${store.getBaseFare()}`} />
        <DebugRow label="Tax" value={`₹${store.getTaxes()}`} />
        <DebugRow label="Fee" value={`₹${store.getConvenienceFee()}`} />
        <DebugRow label="Coupon" value={store.couponCode ? `${store.couponCode} (-₹${store.couponDiscount})` : "—"} />
        <DebugRow label="Wallet" value={store.walletDeduction > 0 ? `-₹${store.walletDeduction}` : "—"} />
        <DebugRow label="Total" value={`₹${store.getTotalAmount()}`} highlight />
        <DebugRow label="Payable" value={`₹${store.getFinalPayable()}`} highlight />
      </DebugSection>

      <DebugSection title="Travellers">
        <DebugRow label="Count" value={String(store.travellers.length)} />
        <DebugRow label="Valid" value={String(store.isTravellerFormValid())} />
        <DebugRow label="Contact Valid" value={String(store.isContactValid())} />
      </DebugSection>

      <DebugSection title="Validation">
        <DebugRow label="Seats Valid" value={String(store.isValid())} />
        <DebugRow label="Can Continue" value={String(store.isValid())} />
      </DebugSection>

      {store.bookingResult && (
        <DebugSection title="Booking Result">
          <DebugRow label="ID" value={store.bookingResult.bookingId} />
          <DebugRow label="PNR" value={store.bookingResult.pnr} />
          <DebugRow label="Status" value={store.bookingResult.status} />
        </DebugSection>
      )}
    </div>
  );
}

function SearchStorePanel() {
  const store = useSearchStore();

  return (
    <div className="space-y-2 text-[10px]">
      <DebugSection title="Search State">
        <DebugRow label="From" value={store.from || "—"} />
        <DebugRow label="To" value={store.to || "—"} />
        <DebugRow label="Date" value={store.departDate || "—"} />
        <DebugRow label="Has Searched" value={String(store.hasSearched)} />
      </DebugSection>

      <DebugSection title="Passengers">
        <DebugRow label="Adults" value={String(store.passengers.adults)} />
        <DebugRow label="Children" value={String(store.passengers.children)} />
        <DebugRow label="Infants" value={String(store.passengers.infants)} />
      </DebugSection>
    </div>
  );
}

function RoutePanel({ pathname }: { pathname: string }) {
  return (
    <div className="space-y-2 text-[10px]">
      <DebugSection title="Current Route">
        <DebugRow label="Pathname" value={pathname} />
        <DebugRow label="Module" value={getModule(pathname)} />
      </DebugSection>

      <DebugSection title="Booking Flow Steps">
        <div className="space-y-0.5">
          {["search", "seats", "travellers", "review", "payment", "confirmation"].map((step) => (
            <div key={step} className="flex items-center gap-1.5">
              <div className={cn(
                "h-2 w-2 rounded-full",
                pathname.includes(step) || (step === "search" && pathname === "/buses")
                  ? "bg-green-500"
                  : "bg-gray-300"
              )} />
              <span className="capitalize text-gray-600">{step}</span>
            </div>
          ))}
        </div>
      </DebugSection>
    </div>
  );
}

// Helpers

function DebugSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="rounded border border-gray-100 bg-gray-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-2 py-1"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{title}</span>
        {open ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100 px-2 py-1">{children}</div>}
    </div>
  );
}

function DebugRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className={cn("font-mono", highlight ? "font-bold text-purple-700" : "text-gray-900")}>
        {value}
      </span>
    </div>
  );
}

function getModule(pathname: string): string {
  if (pathname.startsWith("/buses")) return "buses";
  if (pathname.startsWith("/flights")) return "flights";
  if (pathname.startsWith("/hotels")) return "hotels";
  if (pathname.startsWith("/activities")) return "activities";
  if (pathname.startsWith("/packages")) return "packages";
  return "home";
}
