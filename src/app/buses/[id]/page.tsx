"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SeatLayout } from "@/components/travel/seat-layout";
import { SeatLegend } from "@/components/travel/seat-legend";
import { SeatInfoPanel } from "@/components/travel/seat-info-panel";
import { FareSummary, MobileFareSummary } from "@/components/travel/fare-summary";
import { BoardingDroppingSelector } from "@/components/travel/boarding-dropping-selector";
import { AmenitiesGrid } from "@/components/travel/amenities-grid";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { selectBus } from "@/services/busSelectService";
import {
  handleTraceRecovery,
  BusNoLongerAvailableError,
  SearchSessionExpiredError,
} from "@/utils/busSessionRecovery";
import { debugLog, debugGroup, debugGroupEnd, debugError } from "@/lib/debug";
import type { Bus, BusSeatLayout, Seat, BusBoardingPoint } from "@/types";
import {
  ArrowLeft,
  Bus as BusIcon,
  Clock,
  Star,
  Users,
} from "lucide-react";

export default function BusDetailPage() {
  const params = useParams();
  const router = useRouter();
  const urlBusId = params.id as string;

  const {
    setBusId,
    setTraceId,
    setTripKey,
    setSelectedBusData,
    setSeatLayout: storeSetSeatLayout,
    toggleSeat,
    selectedSeats,
    selectedBusData,
  } = useBusBookingStore();

  // Always use the stored bus ID (set when user clicked "Select Seats")
  // The URL param may be encoded differently (e.g., # in IDs)
  const busId = selectedBusData?.id || decodeURIComponent(urlBusId);

  const [hoveredSeat, setHoveredSeat] = React.useState<Seat | null>(null);
  const [bus, setBus] = React.useState<Bus | null>(null);
  const [layout, setLayout] = React.useState<BusSeatLayout | null>(null);
  const [boardingPoints, setBoardingPoints] = React.useState<BusBoardingPoint[]>([]);
  const [droppingPoints, setDroppingPoints] = React.useState<BusBoardingPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showBackToSearch, setShowBackToSearch] = React.useState(false);

  // Load bus details via the Bus Select API with automatic recovery
  React.useEffect(() => {
    async function loadBusData() {
      debugGroup("BUS DETAIL PAGE");
      debugLog("BUS_DETAIL_PAGE_LOADED", { busId, urlBusId, storedBusId: selectedBusData?.id });
      setIsLoading(true);
      setError(null);
      setShowBackToSearch(false);

      // Validate Bus ID source
      if (process.env.NODE_ENV === "development") {
        console.log("========== BUS SELECT ==========");
        console.log("Clicked Bus ID:", selectedBusData?.id || "(not in store)");
        console.log("URL Bus ID:", decodeURIComponent(urlBusId));
        console.log("Stored Bus ID:", selectedBusData?.id || "(none)");
        console.log("Request Bus ID:", busId);
        if (selectedBusData?.id && decodeURIComponent(urlBusId) !== selectedBusData.id) {
          console.warn("⚠️ URL param differs from stored bus ID — using stored ID");
        }
        console.log("================================");
      }

      try {
        // Get traceId from localStorage (set by search page)
        const traceId =
          typeof window !== "undefined"
            ? localStorage.getItem("bus_search_traceId") || ""
            : "";

        if (!traceId) {
          throw new SearchSessionExpiredError(
            "Your search session has expired. Please search again."
          );
        }

        if (!busId) {
          throw new Error("No bus selected. Please go back and select a bus.");
        }

        // Attempt Bus Select — always use the stored/derived busId
        let result;
        try {
          result = await selectBus({ traceId, busId });
        } catch (selectError) {
          // Attempt transparent recovery for trace session errors
          result = await handleTraceRecovery(busId, selectError);
        }

        // Success — apply result
        applySelectResult(result);
      } catch (err) {
        debugError("BUS_DETAIL_LOAD", err);

        if (err instanceof BusNoLongerAvailableError) {
          setError(err.message);
          setShowBackToSearch(true);
        } else if (err instanceof SearchSessionExpiredError) {
          setError(err.message);
          setShowBackToSearch(true);
        } else {
          const msg = err instanceof Error ? err.message : "Failed to load bus details.";
          setError(msg);
          setShowBackToSearch(true);
        }
      } finally {
        setIsLoading(false);
        debugGroupEnd();
      }
    }

    if (busId) {
      setBusId(busId);
      loadBusData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busId]);

  /** Apply a successful Bus Select result to state and store */
  function applySelectResult(result: Awaited<ReturnType<typeof selectBus>>) {
    // Update booking store
    setTraceId(result.traceId);
    setTripKey(result.tripKey);
    storeSetSeatLayout(result.seatLayout);

    // Set local state for rendering
    setLayout(result.seatLayout);
    setBoardingPoints(result.boardingPoints);
    setDroppingPoints(result.droppingPoints);

    // Build a minimal Bus object for the header display
    const busData: Bus = {
      id: busId,
      operator: busId.split("#")[1]
        ? `Bus ${busId.split("#")[1].substring(0, 6)}`
        : "Bus",
      operatorLogo: "",
      busType: result.seatLayout.layoutType as Bus["busType"],
      departure: { city: "", terminal: "", time: "", date: "" },
      arrival: { city: "", terminal: "", time: "", date: "" },
      duration: "",
      price:
        result.seatLayout.decks[0]?.seats.find(
          (s) => s.status === "available"
        )?.price || 0,
      currency: "INR",
      seatsAvailable: result.seatLayout.availableSeats,
      amenities: [],
      rating: 0,
      reviewCount: 0,
      boardingPoints: result.boardingPoints,
      droppingPoints: result.droppingPoints,
      policies: [],
      images: [],
    };

    // Use persisted selectedBusData if it matches (has richer info from search)
    if (selectedBusData && selectedBusData.id === busId) {
      setBus(selectedBusData);
    } else {
      setBus(busData);
      setSelectedBusData(busData);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="mt-3 text-sm text-gray-500">Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-4 w-full max-w-md text-center">
          <BusIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            {error.includes("no longer available") ? "Bus Unavailable" : "Unable to load bus"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            {showBackToSearch && (
              <Button onClick={() => router.push("/buses")}>
                Back to Search Results
              </Button>
            )}
            {!showBackToSearch && (
              <>
                <Button variant="outline" onClick={() => router.push("/buses")}>
                  Back to Search
                </Button>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <BusIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-3 text-lg font-semibold text-gray-900">Bus not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            The bus you are looking for does not exist.
          </p>
          <Button className="mt-4" onClick={() => router.push("/buses")}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "available" || seat.status === "female-only") {
      toggleSeat(seat);
      setHoveredSeat(seat);
      debugLog(
        "SEAT_SELECTED",
        {
          seatNo: seat.seatNo,
          deck: seat.deck,
          price: seat.price,
          position: seat.position,
          currentCount: selectedSeats.length + 1,
        },
        "success"
      );
    } else if (selectedSeats.find((s) => s.seatNo === seat.seatNo)) {
      toggleSeat(seat);
      debugLog(
        "SEAT_DESELECTED",
        { seatNo: seat.seatNo, currentCount: selectedSeats.length - 1 },
        "warn"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-6">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          {/* Desktop header */}
          <div className="hidden items-center justify-between md:flex">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                  <BusIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-semibold text-gray-900">
                      {bus.operator}
                    </h1>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                      {bus.busType.replace("_", " ")}
                    </span>
                    {bus.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-600">
                          {bus.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {bus.departure.city && (
                      <span>
                        {bus.departure.city} → {bus.arrival.city}
                      </span>
                    )}
                    {bus.duration && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {bus.duration}
                      </span>
                    )}
                    {bus.departure.time && (
                      <span>
                        {bus.departure.time} - {bus.arrival.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {bus.amenities.length > 0 && (
                <AmenitiesGrid amenities={bus.amenities} maxVisible={4} />
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {bus.seatsAvailable} seats
                </span>
              </div>
            </div>
          </div>

          {/* Mobile header */}
          <div className="flex items-center gap-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {bus.operator}
                </p>
                {bus.rating > 0 && (
                  <>
                    <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">{bus.rating}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {bus.departure.city && `${bus.departure.city} → ${bus.arrival.city} · `}
                {bus.departure.time && `${bus.departure.time} - ${bus.arrival.time} · `}
                {bus.duration}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Left: Seat selection area */}
          <div className="min-w-0 flex-1">
            {/* Seat selection section */}
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Seats
                </h2>
                <span className="text-xs text-gray-500">Max 6 seats</span>
              </div>

              {/* Legend */}
              <SeatLegend className="mb-4" />

              {/* Seat map - scrollable on mobile */}
              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  {layout && (
                    <SeatLayout layout={layout} onSeatClick={handleSeatClick} />
                  )}
                </div>
              </div>

              {/* Seat info panel (mobile) */}
              <div className="mt-4 lg:hidden">
                <SeatInfoPanel
                  seat={
                    hoveredSeat ||
                    selectedSeats[selectedSeats.length - 1] ||
                    null
                  }
                />
              </div>
            </section>

            {/* Boarding & Dropping */}
            <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Boarding & Dropping Points
              </h2>
              <BoardingDroppingSelector
                boardingPoints={boardingPoints}
                droppingPoints={droppingPoints}
              />
            </section>
          </div>

          {/* Right sidebar: Fare Summary + Seat Info (desktop) */}
          <aside className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-20 space-y-4">
              <SeatInfoPanel
                seat={
                  hoveredSeat ||
                  selectedSeats[selectedSeats.length - 1] ||
                  null
                }
              />
              <FareSummary busId={busId} />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile bottom fare bar */}
      <MobileFareSummary busId={busId} />
    </div>
  );
}
