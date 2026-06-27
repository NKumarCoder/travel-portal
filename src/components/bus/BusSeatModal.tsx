"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { selectBus, type ApiSelectSeat } from "@/services/busSelectService";
import {
  handleTraceRecovery,
  BusNoLongerAvailableError,
  SearchSessionExpiredError,
} from "@/utils/busSessionRecovery";
import { useSeatLayout, useSeatSelection } from "@/components/bus-seat/hooks";
import { getBusLayoutLabel, type RawApiSeat } from "@/components/bus-seat/utils";
import { SeatGrid } from "@/components/bus-seat/SeatGrid";
import { BusOutline } from "@/components/bus-seat/BusOutline";
import { DeckTabs } from "@/components/bus-seat/DeckTabs";
import { SeatLegend } from "@/components/bus-seat/SeatLegend";
import { ZoomControls } from "@/components/bus-seat/ZoomControls";
import { ProgressStepper } from "@/components/bus-seat/ProgressStepper";
import { RoutePreview } from "@/components/bus-seat/RoutePreview";
import { BoardingDroppingSelector } from "@/components/travel/boarding-dropping-selector";
import { Button } from "@/components/ui/button";
import { debugLog, debugError } from "@/lib/debug";
import type { BusBoardingPoint } from "@/types";
import {
  X,
  Bus as BusIcon,
  Clock,
  Star,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

/**
 * BusSeatModal — Premium compact seat selection modal.
 *
 * Layout (desktop):
 * ┌─────────────────────────────────────────────────┐
 * │ Header (bus info + close)                        │
 * ├─────────────────────────────────────────────────┤
 * │ Progress Stepper                                 │
 * ├──────────────────────────┬──────────────────────┤
 * │ Seat Layout              │ Booking Summary       │
 * │ (deck tabs + bus grid)   │ (sticky right panel)  │
 * ├──────────────────────────┴──────────────────────┤
 * │ Boarding  │  Route  │  Dropping                  │
 * └─────────────────────────────────────────────────┘
 *
 * Everything fits in 90vh without excessive scrolling.
 */
export function BusSeatModal() {
  const {
    isSeatModalOpen,
    seatModalBus: bus,
    closeSeatModal,
    setTraceId,
    setTripKey,
    setSeatLayout: storeSeatLayout,
    selectedSeats,
    boardingPoint,
    droppingPoint,
    removeSeat,
    getBaseFare,
    getTaxes,
    getConvenienceFee,
    getTotalAmount,
    isValid,
  } = useBusBookingStore();

  const [rawSeats, setRawSeats] = React.useState<RawApiSeat[]>([]);
  const [boardingPoints, setBoardingPoints] = React.useState<BusBoardingPoint[]>([]);
  const [droppingPoints, setDroppingPoints] = React.useState<BusBoardingPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const modalRef = React.useRef<HTMLDivElement>(null);

  // Load Bus Select API when modal opens
  React.useEffect(() => {
    if (!isSeatModalOpen || !bus) return;

    async function loadSeatData() {
      if (!bus) return;
      setIsLoading(true);
      setError(null);
      setRawSeats([]);
      setBoardingPoints([]);
      setDroppingPoints([]);

      try {
        const traceId =
          typeof window !== "undefined"
            ? localStorage.getItem("bus_search_traceId") || ""
            : "";

        if (!traceId) {
          throw new SearchSessionExpiredError("Your search session has expired. Please search again.");
        }

        let result;
        try {
          result = await selectBus({ traceId, busId: bus.id });
        } catch (selectError) {
          result = await handleTraceRecovery(bus.id, selectError);
        }

        setTraceId(result.traceId);
        setTripKey(result.tripKey);
        storeSeatLayout(result.seatLayout);

        const engineSeats: RawApiSeat[] = (result.rawSeats as ApiSelectSeat[]).map((s) => ({
          id: s.id,
          name: s.name,
          x: s.x,
          y: s.y,
          z: s.z,
          width: s.width,
          height: s.height,
          desc: s.desc,
          status: s.status,
          fare: s.fare,
        }));
        setRawSeats(engineSeats);
        setBoardingPoints(result.boardingPoints);
        setDroppingPoints(result.droppingPoints);

        debugLog("SEAT_MODAL_LOADED", {
          busId: bus.id,
          totalSeats: engineSeats.length,
          boarding: result.boardingPoints.length,
          dropping: result.droppingPoints.length,
        }, "success");
      } catch (err) {
        debugError("SEAT_MODAL_LOAD", err);
        if (err instanceof BusNoLongerAvailableError || err instanceof SearchSessionExpiredError) {
          setError(err.message);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load seat information.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadSeatData();
  }, [isSeatModalOpen, bus, setTraceId, setTripKey, storeSeatLayout]);

  // ESC to close + lock body scroll
  React.useEffect(() => {
    if (!isSeatModalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeSeatModal();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSeatModalOpen, closeSeatModal]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeSeatModal();
    }
  };

  const handleContinue = () => {
    if (isValid()) {
      debugLog("CONTINUE_BOOKING_FROM_MODAL", { busId: bus?.id, seats: selectedSeats.length, total: getTotalAmount() }, "success");
      closeSeatModal();
    }
  };

  if (!isSeatModalOpen || !bus) return null;

  const total = getTotalAmount();
  const valid = isValid();
  const pointsSelected = !!boardingPoint && !!droppingPoint;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Select seats"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* ═══ Desktop Modal ═══ */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 flex flex-col overflow-hidden bg-white shadow-2xl",
          "hidden md:flex md:h-[90vh] md:w-[92vw] md:max-w-[1360px] md:rounded-2xl",
        )}
      >
        {/* ─── Header: compact ─── */}
        <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <BusIcon className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">{bus.operator}</h2>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gray-500">
                  {bus.busType.replace("_", " ")}
                </span>
                {bus.rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-medium text-gray-500">{bus.rating}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[10px] text-gray-400">
                {bus.departure.city && <span>{bus.departure.city} → {bus.arrival.city}</span>}
                {bus.duration && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{bus.duration}</span>}
                {bus.departure.time && <span>{bus.departure.time} – {bus.arrival.time}</span>}
                <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{bus.seatsAvailable}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={closeSeatModal} aria-label="Close" className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* ─── Progress Stepper ─── */}
        <div className="shrink-0 border-b border-gray-100 px-5 py-2">
          <ProgressStepper seatsSelected={selectedSeats.length} pointsSelected={pointsSelected} />
        </div>

        {/* ─── Body ─── */}
        <div className="flex flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-green-600" />
                <p className="text-xs text-gray-400">Loading seat layout...</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto h-9 w-9 text-red-400" />
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={closeSeatModal}>Back to Results</Button>
              </div>
            </div>
          )}

          {!isLoading && !error && rawSeats.length > 0 && (
            <ModalContent
              rawSeats={rawSeats}
              boardingPoints={boardingPoints}
              droppingPoints={droppingPoints}
              bus={bus}
              selectedSeats={selectedSeats}
              boardingPoint={boardingPoint}
              droppingPoint={droppingPoint}
              removeSeat={removeSeat}
              getBaseFare={getBaseFare}
              getTaxes={getTaxes}
              getConvenienceFee={getConvenienceFee}
              total={total}
              valid={valid}
              pointsSelected={pointsSelected}
              onContinue={handleContinue}
            />
          )}
        </div>
      </div>

      {/* ═══ Mobile Bottom Sheet ═══ */}
      <MobileSheet
        bus={bus}
        isLoading={isLoading}
        error={error}
        rawSeats={rawSeats}
        boardingPoints={boardingPoints}
        droppingPoints={droppingPoints}
        selectedSeats={selectedSeats}
        boardingPoint={boardingPoint}
        droppingPoint={droppingPoint}
        total={total}
        valid={valid}
        onClose={closeSeatModal}
        onContinue={handleContinue}
      />
    </div>
  );
}

// ─── Desktop Modal Content ──────────────────────────────────────────────────────

function ModalContent({
  rawSeats,
  boardingPoints,
  droppingPoints,
  bus,
  selectedSeats,
  boardingPoint,
  droppingPoint,
  removeSeat,
  getBaseFare,
  getTaxes,
  getConvenienceFee,
  total,
  valid,
  pointsSelected,
  onContinue,
}: {
  rawSeats: RawApiSeat[];
  boardingPoints: BusBoardingPoint[];
  droppingPoints: BusBoardingPoint[];
  bus: NonNullable<ReturnType<typeof useBusBookingStore.getState>["seatModalBus"]>;
  selectedSeats: ReturnType<typeof useBusBookingStore.getState>["selectedSeats"];
  boardingPoint: ReturnType<typeof useBusBookingStore.getState>["boardingPoint"];
  droppingPoint: ReturnType<typeof useBusBookingStore.getState>["droppingPoint"];
  removeSeat: (seatNo: string) => void;
  getBaseFare: () => number;
  getTaxes: () => number;
  getConvenienceFee: () => number;
  total: number;
  valid: boolean;
  pointsSelected: boolean;
  onContinue: () => void;
}) {
  const { layout, activeDeck, setActiveDeck, zoom, setZoom, hasMultipleDecks } = useSeatLayout(rawSeats);
  const allSeats = React.useMemo(() => layout.decks.flatMap((d) => d.seats), [layout.decks]);
  const { selectedIds, canSelect, toggleSeat } = useSeatSelection(allSeats);

  const currentDeck = layout.decks[activeDeck] || layout.decks[0];
  if (!currentDeck) return null;

  const baseFare = getBaseFare();
  const taxes = getTaxes();
  const convenienceFee = getConvenienceFee();

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ─── Left: Seats + Boarding/Dropping ─── */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Seat area */}
        <div className="px-5 pt-3 pb-2">
          {/* Controls row */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 border border-green-100">
                {getBusLayoutLabel(layout.busLayoutType)}
              </span>
              <span className="text-[10px] text-gray-400">
                <span className="font-medium text-gray-600">{layout.availableSeats}</span> available
              </span>
              {hasMultipleDecks && (
                <DeckTabs decks={layout.decks} activeDeck={activeDeck} onDeckChange={setActiveDeck} />
              )}
            </div>
            <ZoomControls zoom={zoom} onZoomChange={setZoom} />
          </div>

          {/* Legend - compact single row */}
          <SeatLegend className="mb-2" />

          {/* Bus outline + seat grid */}
          <BusOutline>
            <SeatGrid
              deck={currentDeck}
              zoom={zoom}
              selectedIds={selectedIds}
              canSelect={canSelect}
              onSeatSelect={toggleSeat}
            />
          </BusOutline>
        </div>

        {/* ─── Boarding / Route / Dropping ─── */}
        <div className="border-t border-gray-100 px-5 py-3">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
            {/* Boarding */}
            <div className="max-h-[200px] overflow-y-auto pr-1">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">Boarding</p>
              <BoardingDroppingSelector
                boardingPoints={boardingPoints}
                droppingPoints={[]}
                className="!grid-cols-1"
              />
            </div>

            {/* Route preview */}
            <RoutePreview
              source={bus.departure.city}
              destination={bus.arrival.city}
            />

            {/* Dropping */}
            <div className="max-h-[200px] overflow-y-auto pl-1">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">Dropping</p>
              <BoardingDroppingSelector
                boardingPoints={[]}
                droppingPoints={droppingPoints}
                className="!grid-cols-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Sticky Summary ─── */}
      <aside className="w-[260px] shrink-0 border-l border-gray-100 bg-gray-50/50 overflow-y-auto">
        <div className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-900">Booking Summary</h3>

          {/* Selected seats */}
          {selectedSeats.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Seats ({selectedSeats.length}/6)
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedSeats.map((s) => (
                  <span key={s.seatNo} className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {s.seatNo}
                    <button type="button" onClick={() => removeSeat(s.seatNo)} className="ml-0.5 rounded-full p-0.5 hover:bg-blue-100" aria-label={`Remove ${s.seatNo}`}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-gray-200">
              <p className="text-[10px] text-gray-400">Select seats to continue</p>
            </div>
          )}

          {/* Fare breakdown */}
          {selectedSeats.length > 0 && (
            <div className="space-y-1.5 border-t border-gray-200 pt-2.5">
              <FareRow label="Base Fare" value={baseFare} />
              <FareRow label="GST (5%)" value={taxes} />
              <FareRow label="Conv. Fee" value={convenienceFee} />
              <div className="flex justify-between border-t border-gray-200 pt-1.5">
                <span className="text-xs font-bold text-gray-900">Total</span>
                <span className="text-sm font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* Points summary */}
          {(boardingPoint || droppingPoint) && (
            <div className="space-y-1 border-t border-gray-200 pt-2.5">
              {boardingPoint && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-gray-500 truncate">{boardingPoint.name}</span>
                </div>
              )}
              {droppingPoint && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span className="text-gray-500 truncate">{droppingPoint.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Validation */}
          {selectedSeats.length > 0 && !valid && (
            <div className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700 border border-amber-100">
              {!boardingPoint && <p>• Select boarding point</p>}
              {!droppingPoint && <p>• Select dropping point</p>}
            </div>
          )}

          {/* Continue */}
          <Button className="w-full h-9 text-xs font-semibold" disabled={!valid} onClick={onContinue}>
            Continue Booking
          </Button>
        </div>
      </aside>
    </div>
  );
}

function FareRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-700">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}

// ─── Mobile Bottom Sheet ────────────────────────────────────────────────────────

function MobileSheet({
  bus,
  isLoading,
  error,
  rawSeats,
  boardingPoints,
  droppingPoints,
  selectedSeats,
  boardingPoint,
  droppingPoint,
  total,
  valid,
  onClose,
  onContinue,
}: {
  bus: NonNullable<ReturnType<typeof useBusBookingStore.getState>["seatModalBus"]>;
  isLoading: boolean;
  error: string | null;
  rawSeats: RawApiSeat[];
  boardingPoints: BusBoardingPoint[];
  droppingPoints: BusBoardingPoint[];
  selectedSeats: ReturnType<typeof useBusBookingStore.getState>["selectedSeats"];
  boardingPoint: ReturnType<typeof useBusBookingStore.getState>["boardingPoint"];
  droppingPoint: ReturnType<typeof useBusBookingStore.getState>["droppingPoint"];
  total: number;
  valid: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  const { layout, activeDeck, setActiveDeck, zoom, setZoom, hasMultipleDecks } = useSeatLayout(rawSeats);
  const allSeats = React.useMemo(() => layout.decks.flatMap((d) => d.seats), [layout.decks]);
  const { selectedIds, canSelect, toggleSeat } = useSeatSelection(allSeats);
  const currentDeck = layout.decks[activeDeck] || layout.decks[0];
  const pointsSelected = !!boardingPoint && !!droppingPoint;

  return (
    <div className={cn("relative z-10 flex flex-col overflow-hidden bg-white shadow-2xl md:hidden fixed inset-x-0 bottom-0 h-[95vh] rounded-t-2xl")}>
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-gray-900">{bus.operator}</p>
          <p className="text-[10px] text-gray-400">
            {bus.departure.city && `${bus.departure.city} → ${bus.arrival.city}`}
            {bus.duration && ` · ${bus.duration}`}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="h-7 w-7">
          <X className="h-3.5 w-3.5" />
        </Button>
      </header>

      {/* Progress */}
      <div className="shrink-0 border-b border-gray-100 px-3 py-1.5">
        <ProgressStepper seatsSelected={selectedSeats.length} pointsSelected={pointsSelected} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {isLoading && (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        )}

        {error && !isLoading && (
          <div className="flex h-48 items-center justify-center text-center">
            <div>
              <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
              <p className="mt-2 text-xs text-red-600">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={onClose}>Back</Button>
            </div>
          </div>
        )}

        {!isLoading && !error && currentDeck && (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-semibold text-green-700 border border-green-100">
                  {getBusLayoutLabel(layout.busLayoutType)}
                </span>
                {hasMultipleDecks && <DeckTabs decks={layout.decks} activeDeck={activeDeck} onDeckChange={setActiveDeck} />}
              </div>
              <ZoomControls zoom={zoom} onZoomChange={setZoom} />
            </div>

            <SeatLegend />

            {/* Seats */}
            <BusOutline>
              <SeatGrid deck={currentDeck} zoom={zoom} selectedIds={selectedIds} canSelect={canSelect} onSeatSelect={toggleSeat} />
            </BusOutline>

            {/* Boarding & Dropping */}
            <div className="border-t border-gray-100 pt-3">
              <BoardingDroppingSelector boardingPoints={boardingPoints} droppingPoints={droppingPoints} />
            </div>
          </>
        )}
      </div>

      {/* Sticky footer */}
      {selectedSeats.length > 0 && !isLoading && !error && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400">{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}</p>
              <p className="text-base font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</p>
            </div>
            <Button size="sm" disabled={!valid} onClick={onContinue}>Continue</Button>
          </div>
        </div>
      )}
    </div>
  );
}
