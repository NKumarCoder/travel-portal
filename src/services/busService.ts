import axios from "axios";
import apiClient, { API_BASE_URL, TOKEN_KEY } from "@/lib/api";
import { buildBusSearchPayload, type BusSearchInput } from "@/services/payloadBuilders/busSearchPayload";
import type { Bus, BusBoardingPoint, BusPolicy } from "@/types";

// ============================================================
// Bus Search API Types (raw response)
// ============================================================

export interface ApiBusFare {
  total: number;
  base: number;
  gst: number;
  toll: number;
  sCharge: number;
  levyCharge: number;
  txnFee: number;
  commission: number;
  totalNetFare: number;
}

export interface ApiBusPoint {
  id: string;
  name: string;
  time: string;
  address: string;
  landmark: string;
  location: string;
  mainPointID: string;
}

export interface ApiBusCancelPolicy {
  span: string;
  unit: string;
  rate: string;
}

export interface ApiBus {
  id: string;
  name: string;
  type: string;
  nmbr: string;
  timeD: string;
  timeA: string;
  busStartTime: string;
  duration: number; // in minutes
  nextDay: boolean;
  seats: {
    avlAll: number;
  };
  fares: ApiBusFare[];
  policy: {
    cancel: ApiBusCancelPolicy[];
  };
  tags: {
    ac: boolean;
    nonAc: boolean;
    seater: boolean;
    sleeper: boolean;
    singleLadies: boolean;
  };
  amenities: string[];
  required: {
    poi: boolean;
    bdp: boolean;
  };
  optional: {
    gst: boolean;
  };
  boarding: ApiBusPoint[];
  dropping: ApiBusPoint[];
  apiId: number;
  ecode: string;
  verified: boolean;
  partialCancellation: boolean;
}

export interface ApiBusTrip {
  buses: ApiBus[];
  filters: Record<string, unknown>;
  summary: {
    src: string;
    dst: string;
    doj: string;
  };
}

export interface ApiBusSearchResponse {
  traceId: string;
  trips: ApiBusTrip[];
}

// ============================================================
// Search Params (re-exported for convenience)
// ============================================================

export type { BusSearchInput };

/**
 * Search result including traceId needed for bus select.
 */
export interface BusSearchResult {
  buses: Bus[];
  traceId: string;
}

// ============================================================
// Service Functions
// ============================================================

/**
 * Search buses using the real API.
 *
 * POST /api/bus/search
 * Authorization: Bearer token (handled by interceptor)
 *
 * Returns buses transformed to the existing Bus type + traceId for subsequent select calls.
 */
export async function searchBuses(input: BusSearchInput): Promise<BusSearchResult> {
  const startTime = performance.now();

  // ─── Build payload using the centralized payload builder ─────────────────────
  const payload = buildBusSearchPayload(input);

  // ─── Log complete request ────────────────────────────────────────────────────
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const requestUrl = `${API_BASE_URL}/api/bus/search`;

  console.log("[API DEBUG] BUS API REQUEST");
  console.log("[API DEBUG] General API base URL:", API_BASE_URL);
  console.log("[API DEBUG] URL:", requestUrl);
  console.log("[API DEBUG] Authorization token present:", !!token);

  try {
    const { data, status, headers } = await apiClient.post<ApiBusSearchResponse>(
      "/api/bus/search",
      payload
    );

    const elapsed = Math.round(performance.now() - startTime);

    // ─── Log complete response ───────────────────────────────────────────────────
    if (process.env.NODE_ENV === "development") {
      console.log("========== BUS SEARCH RESPONSE ==========");
      console.log("Status:", status);
      console.log("Response Time:", `${elapsed}ms`);
      console.log("Trace ID:", data.traceId);
      console.log("Trips:", data.trips?.length || 0);
      const totalBuses = data.trips?.reduce((sum, t) => sum + (t.buses?.length || 0), 0) || 0;
      console.log("Total Buses:", totalBuses);
      console.log("Response Headers:", Object.fromEntries(
        Object.entries(headers).filter(([k]) => typeof k === "string")
      ));
      console.log("Full Response:", JSON.stringify(data, null, 2).substring(0, 2000));
      console.log("=========================================");
    }

    // Handle API-level errors (200 status but error in response body)
    const responseData = data as unknown as Record<string, unknown>;
    if (responseData.error) {
      const apiError = responseData.error as { code?: string; desc?: string };
      if (process.env.NODE_ENV === "development") {
        console.error("[BusService] API returned error in response body:", apiError);
      }
      throw new Error(apiError.desc || apiError.code || "Bus search failed on server");
    }

    // Extract buses from all trips
    const apiBuses: ApiBus[] = data.trips?.flatMap((trip) => trip.buses) || [];

    // Transform API buses to the existing Bus type
    return {
      buses: apiBuses.map(transformApiBusToUiBus),
      traceId: data.traceId || "",
    };
  } catch (error: unknown) {
    const elapsed = Math.round(performance.now() - startTime);

    // ─── Log complete error ──────────────────────────────────────────────────────
    if (process.env.NODE_ENV === "development") {
      console.error("========== BUS SEARCH ERROR ==========");
      console.error("URL:", requestUrl);
      console.error("Method: POST");
      console.error("Response Time:", `${elapsed}ms`);

      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Status Text:", error.response?.statusText);
        console.error("Axios Message:", error.message);
        console.error("Axios Code:", error.code);
        console.error("Request Payload:", JSON.stringify(payload, null, 2));
        console.error("Response Body:", JSON.stringify(error.response?.data, null, 2));
        console.error("Response Headers:", error.response?.headers);
      } else {
        console.error("Error:", error);
      }

      console.error("=======================================");
    }

    // Re-throw with backend message if available
    if (axios.isAxiosError(error) && error.response?.data) {
      const backendMsg =
        error.response.data.message ||
        error.response.data.error ||
        error.response.data.errorMessage ||
        (typeof error.response.data === "string" ? error.response.data : null);

      if (backendMsg) {
        throw new Error(backendMsg);
      }
    }

    throw error;
  }
}

/**
 * Get bus details by ID (placeholder for future API integration).
 */
export async function getBusDetails(busId: string): Promise<Bus | null> {
  if (process.env.NODE_ENV === "development") {
    console.log("[BusService] getBusDetails:", busId);
  }
  // TODO: Implement when API endpoint is available
  return null;
}

// ============================================================
// Transformer
// ============================================================

/**
 * Converts an API bus object to the existing UI Bus type.
 * This allows the BusCard component to work without modification.
 */
function transformApiBusToUiBus(apiBus: ApiBus): Bus {
  const departureDate = new Date(apiBus.timeD);
  const arrivalDate = new Date(apiBus.timeA);

  // Format duration from minutes to "Xh Ym"
  const hours = Math.floor(apiBus.duration / 60);
  const minutes = apiBus.duration % 60;
  const durationStr = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;

  // Determine bus type for the UI
  const busType = determineBusType(apiBus.tags, apiBus.type);

  // Get best price from fares
  const price = apiBus.fares.length > 0 ? apiBus.fares[0].total : 0;

  // Transform boarding points
  const boardingPoints: BusBoardingPoint[] = apiBus.boarding.map((bp) => ({
    id: bp.id,
    name: bp.name,
    time: formatTime(bp.time),
    address: bp.location || bp.address,
  }));

  // Transform dropping points
  const droppingPoints: BusBoardingPoint[] = apiBus.dropping.map((dp) => ({
    id: dp.id,
    name: dp.name,
    time: formatTime(dp.time),
    address: dp.location || dp.address,
  }));

  // Transform cancellation policies
  const policies: BusPolicy[] = apiBus.policy.cancel.map((cp) => ({
    title: cp.span,
    description: `Cancellation charge: ${cp.rate}`,
  }));

  return {
    id: apiBus.id,
    operator: apiBus.name,
    operatorLogo: "",
    busType,
    departure: {
      city: boardingPoints.length > 0 ? boardingPoints[0].name.split(",")[0] : "",
      terminal: boardingPoints.length > 0 ? boardingPoints[0].name : "",
      time: formatTime(apiBus.timeD),
      date: departureDate.toISOString().split("T")[0],
    },
    arrival: {
      city: droppingPoints.length > 0 ? droppingPoints[0].name.split(",")[0] : "",
      terminal: droppingPoints.length > 0 ? droppingPoints[0].name : "",
      time: formatTime(apiBus.timeA),
      date: arrivalDate.toISOString().split("T")[0],
    },
    duration: durationStr,
    price,
    currency: "INR",
    seatsAvailable: apiBus.seats.avlAll,
    amenities: apiBus.amenities || [],
    rating: 0,
    reviewCount: 0,
    boardingPoints,
    droppingPoints,
    policies,
    images: [],
  };
}

/**
 * Determine the bus type enum from API tags and type string.
 */
function determineBusType(
  tags: ApiBus["tags"],
  typeStr: string
): Bus["busType"] {
  const lower = typeStr.toLowerCase();

  if (tags.sleeper && tags.ac) return "sleeper";
  if (tags.sleeper && !tags.ac) return "sleeper";
  if (tags.seater && tags.ac) return "ac";
  if (tags.seater && !tags.ac) return "seater";

  // Fallback to parsing the type string
  if (lower.includes("sleeper")) return "sleeper";
  if (lower.includes("semi")) return "semi_sleeper";
  if (lower.includes("seater") && lower.includes("ac")) return "ac";
  if (lower.includes("seater")) return "seater";
  if (lower.includes("ac")) return "ac";
  if (lower.includes("non ac") || lower.includes("non-ac")) return "non_ac";

  return "seater";
}

/**
 * Format ISO datetime string to 12h time (e.g., "04:15 PM").
 */
function formatTime(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoStr;
  }
}
