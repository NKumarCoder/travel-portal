"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
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
    setIsProcessing(false);

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
    if (isValid() && bus) {
      setIsProcessing(true);
      debugLog("CONTINUE_BOOKING_FROM_MODAL", { busId: bus.id, seats: selectedSeats.length, total: getTotalAmount() }, "success");
      router.push(`/buses/${encodeURIComponent(bus.id)}/travellers`);
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
          "relative z-10 flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-200",
          "hidden md:flex md:h-[84vh] md:w-[86vw] md:max-w-[1140px] md:rounded-2xl",
        )}
      >
        {/* ─── Header: ultra-compact ─── */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BusIcon className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-extrabold text-white">{bus.operator}</h2>
                <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-300">
                  {bus.busType.replace("_", " ")}
                </span>
                {bus.rating > 0 && (
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300">{bus.rating}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5">
                {bus.departure.city && <span>{bus.departure.city} → {bus.arrival.city}</span>}
                {bus.duration && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5 text-slate-400" />{bus.duration}</span>}
                {bus.departure.time && <span>{bus.departure.time} – {bus.arrival.time}</span>}
                <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5 text-slate-400" />{bus.seatsAvailable} available</span>
              </div>
            </div>
          </div>

          {/* Stepper positioned in header */}
          <div className="flex-1 flex justify-center max-w-lg mx-4">
            <ProgressStepper seatsSelected={selectedSeats.length} pointsSelected={pointsSelected} className="w-full" />
          </div>

          <Button variant="ghost" size="icon" onClick={closeSeatModal} aria-label="Close" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* ─── Body ─── */}
        <div className="flex flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                <p className="text-xs text-slate-400">Loading seat layout...</p>
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
              isProcessing={isProcessing}
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
        isProcessing={isProcessing}
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
  isProcessing,
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
  isProcessing: boolean;
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
      <div className="flex flex-1 flex-col overflow-y-auto min-h-0">
        {/* Seat area */}
        <div className="px-4 pt-2.5 pb-2">
          {/* Controls row */}
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100/80">
                {getBusLayoutLabel(layout.busLayoutType)}
              </span>
              <span className="text-[10px] text-slate-400">
                <span className="font-bold text-slate-700">{layout.availableSeats}</span> available
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
        <div className="border-t border-slate-100 px-4 py-2.5 mt-auto">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
            {/* Boarding */}
            <div className="min-w-0 pr-1">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Boarding</p>
              <BoardingDroppingSelector
                boardingPoints={boardingPoints}
                droppingPoints={[]}
                className="!grid-cols-1"
              />
            </div>

            {/* Route preview */}
            <div className="pt-6">
              <RoutePreview
                source={bus.departure.city}
                destination={bus.arrival.city}
              />
            </div>

            {/* Dropping */}
            <div className="min-w-0 pl-1">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Dropping</p>
              <BoardingDroppingSelector
                boardingPoints={[]}
                droppingPoints={droppingPoints}
                className="!grid-cols-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Sticky Summary (~220px) ─── */}
      <aside className="w-[220px] shrink-0 border-l border-slate-100 bg-slate-50/70 overflow-y-auto">
        <div className="p-3 space-y-2.5">
          <h3 className="text-xs font-extrabold text-slate-900">Booking Summary</h3>

          {/* Selected seats */}
          {selectedSeats.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Seats ({selectedSeats.length}/6)
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedSeats.map((s) => (
                  <span key={s.seatNo} className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    {s.seatNo}
                    <button type="button" onClick={() => removeSeat(s.seatNo)} className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-100" aria-label={`Remove ${s.seatNo}`}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-10 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white">
              <p className="text-[10px] text-slate-400 font-medium">Select seats to continue</p>
            </div>
          )}

          {/* Fare breakdown */}
          {selectedSeats.length > 0 && (
            <div className="space-y-1 border-t border-slate-200/80 pt-2">
              <FareRow label="Base Fare" value={baseFare} />
              <FareRow label="GST (5%)" value={taxes} />
              <FareRow label="Conv. Fee" value={convenienceFee} />
              <div className="flex justify-between border-t border-slate-200/80 pt-1.5 mt-1">
                <span className="text-xs font-extrabold text-slate-900">Total</span>
                <span className="text-sm font-extrabold text-emerald-700">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {/* Points summary */}
          {(boardingPoint || droppingPoint) && (
            <div className="space-y-1 border-t border-slate-200/80 pt-2">
              {boardingPoint && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 truncate font-medium">{boardingPoint.name}</span>
                </div>
              )}
              {droppingPoint && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-600 truncate font-medium">{droppingPoint.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Validation */}
          {selectedSeats.length > 0 && !valid && (
            <div className="rounded-lg bg-amber-50 px-2 py-1 text-[10px] text-amber-800 border border-amber-200/80 font-medium">
              {!boardingPoint && <p>• Select boarding point</p>}
              {!droppingPoint && <p>• Select dropping point</p>}
            </div>
          )}

          {/* Continue CTA */}
          <Button className="w-full h-8.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer" disabled={!valid || isProcessing} onClick={onContinue}>
            {isProcessing ? "Please wait..." : "Continue Booking"}
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
  isProcessing,
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
  isProcessing: boolean;
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
            <Button size="sm" disabled={!valid || isProcessing} onClick={onContinue}>
              {isProcessing ? "Please wait..." : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
