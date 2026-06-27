import { USE_MOCK_DATA } from "./config";
import { generateDemoBuses } from "@/lib/demo-bus-generator";
import { getSeatLayout } from "@/lib/seat-layout-utils";
import { debugLog, debugError, debugGroup, debugGroupEnd } from "@/lib/debug";
import type { Bus, BusSeatLayout } from "@/types";
import busSearchResponse from "@/mock-data/buses/bus-search-response.json";
import paymentResponse from "@/mock-data/buses/payment-response.json";
import bookingConfirmationResponse from "@/mock-data/buses/booking-confirmation-response.json";
import travellerResponse from "@/mock-data/buses/traveller-response.json";

// ============================================================
// Bus Service - Abstracts data access for the bus module
// ============================================================

export interface BusSearchParams {
  source: string;
  destination: string;
  date?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: string;
  options: { id: string; name: string; icon: string }[];
}

export interface BookingConfirmation {
  pnr: string;
  bookingId: string;
  status: string;
  journeyDetails: {
    operator: string;
    busType: string;
    source: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    duration: string;
    boardingPoint: { name: string; time: string; address: string };
    droppingPoint: { name: string; time: string; address: string };
  };
  passengers: { name: string; age: number; gender: string; seatNo: string }[];
  paymentSummary: {
    baseFare: number;
    taxes: number;
    convenienceFee: number;
    discount: number;
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
  };
  contact: { mobile: string; email: string };
  bookedAt: string;
}

/**
 * Search for buses on a given route.
 * In mock mode, generates dynamic buses based on source/destination.
 */
export async function searchBuses(params: BusSearchParams): Promise<Bus[]> {
  debugGroup("BUS SEARCH");
  debugLog("BUS_SEARCH_STARTED", params);

  try {
    if (USE_MOCK_DATA) {
      await delay(1000);
      const buses = generateDemoBuses(params.source, params.destination);
      debugLog("BUS_RESULTS_LOADED", {
        total: buses.length,
        ids: buses.map((b) => b.id),
        operators: [...new Set(buses.map((b) => b.operator))],
        priceRange: { min: Math.min(...buses.map((b) => b.price)), max: Math.max(...buses.map((b) => b.price)) },
      }, "success");
      debugGroupEnd();
      return buses;
    }

    const res = await fetch(`/api/buses/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    debugLog("BUS_RESULTS_LOADED", { total: data.results.length }, "success");
    debugGroupEnd();
    return data.results;
  } catch (error) {
    debugError("BUS_SEARCH", error);
    debugGroupEnd();
    return [];
  }
}

/**
 * Get bus details by ID.
 * In mock mode, finds bus from the static search response.
 */
export async function getBusDetails(busId: string): Promise<Bus | null> {
  debugLog("BUS_LOOKUP", { busId });

  try {
    if (USE_MOCK_DATA) {
      await delay(300);
      const bus = (busSearchResponse.results as unknown as Bus[]).find(
        (b) => b.id === busId
      );
      if (bus) {
        debugLog("BUS_LOOKUP", { busId, found: true, operator: bus.operator, route: `${bus.departure.city} → ${bus.arrival.city}` }, "success");
      } else {
        debugLog("BUS_NOT_FOUND", { busId, availableIds: (busSearchResponse.results as unknown as Bus[]).map((b) => b.id) }, "error");
      }
      return bus || null;
    }

    const res = await fetch(`/api/buses/${busId}`);
    const data = await res.json();
    debugLog("BUS_LOOKUP", { busId, found: !!data.bus }, data.bus ? "success" : "error");
    return data.bus;
  } catch (error) {
    debugError("BUS_LOOKUP", error);
    return null;
  }
}

/**
 * Get seat layout for a bus.
 * In mock mode, uses the seat layout utility to generate/fetch layout.
 */
export async function getBusSeatLayout(
  busId: string,
  busType: string,
  basePrice: number,
  availableSeats: number
): Promise<BusSeatLayout> {
  debugLog("SEAT_LAYOUT_REQUESTED", { busId, busType, basePrice, availableSeats });

  try {
    if (USE_MOCK_DATA) {
      await delay(500);
      const layout = getSeatLayout(busId, busType, basePrice, availableSeats);
      const available = layout.decks.flatMap((d) => d.seats).filter((s) => s.status === "available").length;
      const booked = layout.decks.flatMap((d) => d.seats).filter((s) => s.status === "booked").length;
      debugLog("SEAT_LAYOUT_LOADED", {
        busId,
        totalSeats: layout.totalSeats,
        availableSeats: available,
        bookedSeats: booked,
        decks: layout.decks.length,
        layoutType: layout.layoutType,
      }, "success");
      return layout;
    }

    const res = await fetch(`/api/buses/${busId}/seats`);
    const data = await res.json();
    debugLog("SEAT_LAYOUT_LOADED", { busId, totalSeats: data.layout.totalSeats }, "success");
    return data.layout;
  } catch (error) {
    debugError("SEAT_LAYOUT", error);
    throw error;
  }
}

/**
 * Get available payment methods.
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (USE_MOCK_DATA) {
    await delay(300);
    return paymentResponse.paymentMethods as PaymentMethod[];
  }

  const res = await fetch(`/api/payments/methods`);
  const data = await res.json();
  return data.paymentMethods;
}

/**
 * Process payment (mock always succeeds).
 */
export async function processPayment(paymentData: {
  methodId: string;
  amount: number;
  busId: string;
}): Promise<BookingConfirmation> {
  if (USE_MOCK_DATA) {
    await delay(2000); // Simulate payment processing
    return bookingConfirmationResponse.booking as BookingConfirmation;
  }

  const res = await fetch(`/api/payments/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });
  const data = await res.json();
  return data.booking;
}

/**
 * Get saved traveller information.
 */
export async function getSavedTravellers() {
  if (USE_MOCK_DATA) {
    await delay(200);
    return travellerResponse;
  }

  const res = await fetch(`/api/travellers`);
  return res.json();
}

// ============================================================
// Helpers
// ============================================================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
