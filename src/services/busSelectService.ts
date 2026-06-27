import axios from "axios";
import apiClient, { API_BASE_URL, TOKEN_KEY } from "@/lib/api";
import { buildBusSelectPayload, type BusSelectInput } from "@/services/payloadBuilders/busSelectPayload";
import { mapSeatStatus } from "@/lib/seat-status-mapper";
import type { Seat, BusBoardingPoint, BusSeatLayout, SeatDeck, SeatType, DeckType } from "@/types";

// ============================================================
// API Response Types
// ============================================================

export interface ApiSelectSeatFare {
  total: number;
  base: number;
  gst: number;
  commission: number;
  totalNetFare: number;
}

export interface ApiSelectSeat {
  id: string;
  name: string;
  desc: string;
  status: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  fare: ApiSelectSeatFare;
}

export interface ApiSelectPoint {
  id: string;
  name: string;
  time: string;
  address: string;
  landmark: string;
  location: string;
  mainPointID: string;
}

export interface ApiSelectResponse {
  traceId: string;
  tripKey: string;
  layout: string;
  verified: boolean;
  seats: ApiSelectSeat[];
  boarding: ApiSelectPoint[];
  dropping: ApiSelectPoint[];
}

// ============================================================
// Transformed Result (for the UI)
// ============================================================

export interface BusSelectResult {
  traceId: string;
  tripKey: string;
  layout: string;
  verified: boolean;
  seatLayout: BusSeatLayout;
  boardingPoints: BusBoardingPoint[];
  droppingPoints: BusBoardingPoint[];
  rawSeats: ApiSelectSeat[];
  rawBoarding: ApiSelectPoint[];
  rawDropping: ApiSelectPoint[];
}

// ============================================================
// Service Function
// ============================================================

/**
 * Call the Bus Select API.
 *
 * POST /api/bus/select
 * Authorization: Bearer token (handled by interceptor)
 *
 * Returns seat layout, boarding/dropping points transformed for the UI.
 */
export async function selectBus(input: BusSelectInput): Promise<BusSelectResult> {
  const startTime = performance.now();

  // Build payload
  const payload = buildBusSelectPayload(input);

  // Log request
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const requestUrl = `${API_BASE_URL}/api/bus/select`;

  if (process.env.NODE_ENV === "development") {
    console.log("========== BUS SELECT REQUEST ==========");
    console.log("URL:", requestUrl);
    console.log("Method: POST");
    console.log("Authorization: Bearer", token ? `${token.substring(0, 20)}...` : "MISSING");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("========================================");
  }

  try {
    const { data, status } = await apiClient.post<ApiSelectResponse>(
      "/api/bus/select",
      payload
    );

    const elapsed = Math.round(performance.now() - startTime);

    // Log response
    if (process.env.NODE_ENV === "development") {
      const availableSeats = data.seats?.filter((s) => s.status === "AFA").length || 0;
      console.log("========== BUS SELECT RESPONSE ==========");
      console.log("Status:", status);
      console.log("Response Time:", `${elapsed}ms`);
      console.log("TraceId:", data.traceId);
      console.log("TripKey:", data.tripKey);
      console.log("Layout:", data.layout);
      console.log("Total Seats:", data.seats?.length || 0);
      console.log("Available Seats:", availableSeats);
      console.log("Boarding Count:", data.boarding?.length || 0);
      console.log("Dropping Count:", data.dropping?.length || 0);
      console.log("Verified:", data.verified);
      console.log("=========================================");
    }

    // Handle API-level errors
    const responseData = data as unknown as Record<string, unknown>;
    if (responseData.error) {
      const apiError = responseData.error as { code?: string; desc?: string };
      throw new Error(apiError.desc || apiError.code || "Bus select failed on server");
    }

    // Transform for UI
    const seatLayout = transformSeatsToLayout(data.seats, data.layout);
    const boardingPoints = transformPoints(data.boarding);
    const droppingPoints = transformPoints(data.dropping);

    return {
      traceId: data.traceId,
      tripKey: data.tripKey,
      layout: data.layout,
      verified: data.verified,
      seatLayout,
      boardingPoints,
      droppingPoints,
      rawSeats: data.seats || [],
      rawBoarding: data.boarding || [],
      rawDropping: data.dropping || [],
    };
  } catch (error: unknown) {
    const elapsed = Math.round(performance.now() - startTime);

    if (process.env.NODE_ENV === "development") {
      console.error("========== BUS SELECT ERROR ==========");
      console.error("URL:", requestUrl);
      console.error("Method: POST");
      console.error("Response Time:", `${elapsed}ms`);

      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Status Text:", error.response?.statusText);
        console.error("Axios Message:", error.message);
        console.error("Request Payload:", JSON.stringify(payload, null, 2));
        console.error("Response Body:", JSON.stringify(error.response?.data, null, 2));
      } else {
        console.error("Error:", error);
      }

      console.error("======================================");
    }

    // Re-throw with backend message if available
    if (axios.isAxiosError(error) && error.response?.data) {
      const backendMsg =
        error.response.data.message ||
        error.response.data.error?.desc ||
        error.response.data.error ||
        error.response.data.errorMessage ||
        (typeof error.response.data === "string" ? error.response.data : null);

      if (backendMsg && typeof backendMsg === "string") {
        throw new Error(backendMsg);
      }
    }

    throw error;
  }
}

// ============================================================
// Transformers
// ============================================================

/**
 * Transform API seats array into the BusSeatLayout format.
 * Uses x/y coordinates from the API to position seats dynamically.
 */
function transformSeatsToLayout(
  apiSeats: ApiSelectSeat[],
  layoutType: string
): BusSeatLayout {
  if (!apiSeats || apiSeats.length === 0) {
    return {
      busId: "",
      layoutType: "seater",
      totalSeats: 0,
      availableSeats: 0,
      decks: [],
    };
  }

  // Group seats by z-coordinate (deck)
  const deckGroups = new Map<number, ApiSelectSeat[]>();
  for (const seat of apiSeats) {
    const z = seat.z || 0;
    if (!deckGroups.has(z)) {
      deckGroups.set(z, []);
    }
    deckGroups.get(z)!.push(seat);
  }

  // Determine seat type from layout string
  const seatType: SeatType = determineSeatType(layoutType);

  // Build decks
  const decks: SeatDeck[] = [];
  const sortedZValues = [...deckGroups.keys()].sort();

  for (let i = 0; i < sortedZValues.length; i++) {
    const z = sortedZValues[i];
    const deckSeats = deckGroups.get(z)!;
    const deckType: DeckType = i === 0 ? "lower" : "upper";

    // Calculate grid dimensions from x/y
    const maxRow = Math.max(...deckSeats.map((s) => s.y)) + 1;
    const maxCol = Math.max(...deckSeats.map((s) => s.x)) + 1;

    // Transform each seat
    const transformedSeats: Seat[] = deckSeats.map((apiSeat) => ({
      seatNo: apiSeat.name || apiSeat.id,
      status: mapSeatStatus(apiSeat.status),
      price: apiSeat.fare?.total || 0,
      position: determinePosition(apiSeat.x, maxCol),
      row: apiSeat.y,
      col: apiSeat.x,
      deck: deckType,
      seatType,
    }));

    decks.push({
      deck: deckType,
      rows: maxRow,
      cols: maxCol,
      seats: transformedSeats,
    });
  }

  const totalSeats = apiSeats.length;
  const availableSeats = apiSeats.filter((s) => s.status === "AFA").length;

  return {
    busId: "",
    layoutType: seatType,
    totalSeats,
    availableSeats,
    decks,
  };
}

/**
 * Transform API boarding/dropping points to BusBoardingPoint format.
 */
function transformPoints(points: ApiSelectPoint[]): BusBoardingPoint[] {
  if (!points) return [];

  return points.map((p) => ({
    id: p.id,
    name: p.name,
    time: formatPointTime(p.time),
    address: p.location || p.address || p.landmark || "",
  }));
}

/**
 * Determine seat type from layout string.
 */
function determineSeatType(layout: string): SeatType {
  const lower = (layout || "").toLowerCase();
  if (lower.includes("sleeper")) return "sleeper";
  if (lower.includes("semi")) return "semi_sleeper";
  return "seater";
}

/**
 * Determine seat position based on column index.
 */
function determinePosition(col: number, totalCols: number): "window" | "aisle" | "middle" {
  if (col === 0 || col === totalCols - 1) return "window";
  if (col === 1 || col === totalCols - 2) return "aisle";
  return "middle";
}

/**
 * Format point time from ISO string or time string.
 */
function formatPointTime(timeStr: string): string {
  if (!timeStr) return "";
  try {
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  } catch {
    // Not a valid date, return as-is
  }
  return timeStr;
}
