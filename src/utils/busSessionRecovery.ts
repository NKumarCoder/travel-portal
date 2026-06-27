import apiClient from "@/lib/api";
import { buildBusSelectPayload } from "@/services/payloadBuilders/busSelectPayload";
import { useBusSearchContextStore } from "@/store/bus-search-context-store";
import { useBusBookingStore } from "@/store/bus-booking-store";
import type { BusSelectResult } from "@/services/busSelectService";
import type { ApiBusSearchResponse } from "@/services/busService";
import type { Bus } from "@/types";
import { selectBus } from "@/services/busSelectService";

// ============================================================
// Error Detection Helpers
// ============================================================

/** Patterns that indicate an expired/invalid trace session (NOT auth failure) */
const TRACE_ERROR_PATTERNS = [
  "invalid traceid",
  "invalid busid",
  "trace session expired",
  "invalid trace",
  "traceid",
  "session expired",
  "object reference not set",
];

/**
 * Determine if an error is a trace/session error (recoverable by re-searching)
 * vs an authentication error (requires re-login).
 */
export function isTraceSessionError(error: unknown): boolean {
  if (!error) return false;

  let message = "";

  if (error instanceof Error) {
    message = error.message.toLowerCase();
  } else if (typeof error === "string") {
    message = error.toLowerCase();
  } else if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    message = (
      String(obj.message || obj.desc || obj.error || obj.errorMessage || "")
    ).toLowerCase();
  }

  return TRACE_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * Determine if an error is an authentication failure (401).
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;

  // Axios error with 401 status
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosErr = error as { response?: { status?: number } };
    return axiosErr.response?.status === 401;
  }

  if (error instanceof Error) {
    return error.message.includes("401") || error.message.includes("Unauthorized");
  }

  return false;
}

// ============================================================
// Recovery Functions
// ============================================================

/**
 * Re-run the last Bus Search using the stored payload.
 * Returns the new traceId and updated bus list.
 *
 * @returns { traceId, buses } or throws if search fails
 */
export async function recoverSearchSession(): Promise<{
  traceId: string;
  buses: Bus[];
}> {
  const store = useBusSearchContextStore.getState();
  const { lastSearchPayload } = store;

  if (!lastSearchPayload) {
    throw new Error("No stored search payload — cannot recover session.");
  }

  if (process.env.NODE_ENV === "development") {
    console.log("========== TRACE RECOVERY ==========");
    console.log("Reason: Invalid TraceId");
    console.log("Running Bus Search Again...");
    console.log("Payload:", JSON.stringify(lastSearchPayload, null, 2));
  }

  // Re-run the search using the stored payload
  const { data } = await apiClient.post<ApiBusSearchResponse>(
    "/api/bus/search",
    lastSearchPayload
  );

  // Check for API-level error in response body
  const responseData = data as unknown as Record<string, unknown>;
  if (responseData.error) {
    const apiError = responseData.error as { code?: string; desc?: string };
    throw new Error(apiError.desc || apiError.code || "Search recovery failed");
  }

  const newTraceId = data.traceId || "";

  if (!newTraceId) {
    throw new Error("Search recovery returned no traceId");
  }

  // We need to import the transformer — but to avoid circular deps,
  // we'll extract buses from the raw response and return them as-is for ID matching.
  // The full Bus[] will be updated by the caller if needed.
  const rawBusIds: string[] = data.trips?.flatMap((t) => t.buses.map((b) => b.id)) || [];

  if (process.env.NODE_ENV === "development") {
    console.log("New TraceId:", newTraceId);
    console.log("Buses in new response:", rawBusIds.length);
  }

  // Update the store with new traceId
  store.updateTraceId(newTraceId);

  // Update booking store traceId too
  useBusBookingStore.getState().setTraceId(newTraceId);

  // Return new traceId and raw bus IDs for validation
  // The bus list is stored as-is since we only need IDs for validation
  return {
    traceId: newTraceId,
    buses: store.busList, // Keep existing transformed list for now
  };
}

/**
 * Retry Bus Select with a new traceId.
 *
 * @param busId - The bus to select
 * @param newTraceId - The fresh traceId from recovery
 * @returns BusSelectResult or throws
 */
export async function retryBusSelect(
  busId: string,
  newTraceId: string
): Promise<BusSelectResult> {
  if (process.env.NODE_ENV === "development") {
    console.log("Retrying Bus Select...");
    console.log("Bus ID:", busId);
    console.log("New Trace ID:", newTraceId);
  }

  const result = await selectBus({ traceId: newTraceId, busId });

  if (process.env.NODE_ENV === "development") {
    console.log("Recovery Successful");
    console.log("===================================");
  }

  return result;
}

/**
 * Full recovery handler for Bus Select failures.
 *
 * Flow:
 * 1. Detect if error is a trace session error
 * 2. Re-run Bus Search to get a new traceId
 * 3. Check if the busId still exists in the new results
 * 4. Retry Bus Select with the new traceId
 * 5. Return result transparently
 *
 * Only retries once to avoid infinite loops.
 *
 * @param busId - The bus that failed to select
 * @param error - The original error from selectBus
 * @returns BusSelectResult if recovery succeeds
 * @throws RecoveryError with actionable message if recovery fails
 */
export async function handleTraceRecovery(
  busId: string,
  error: unknown
): Promise<BusSelectResult> {
  // Only attempt recovery for trace session errors
  if (!isTraceSessionError(error)) {
    throw error; // Not recoverable by re-searching — pass through
  }

  if (process.env.NODE_ENV === "development") {
    console.log("========== TRACE RECOVERY ==========");
    console.log("Reason:", error instanceof Error ? error.message : String(error));
  }

  try {
    // Step 1: Re-run search
    const { traceId: newTraceId } = await recoverSearchSession();

    // Step 2: Check if bus still exists
    // We check against the raw bus IDs from the new search
    // Since the store busList might not be updated yet, we'll attempt select directly
    // and let the API tell us if the busId is invalid

    // Step 3: Retry select
    const result = await retryBusSelect(busId, newTraceId);

    return result;
  } catch (recoveryError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Recovery Failed:", recoveryError);
      console.log("===================================");
    }

    // Check if the retry also failed with invalid busId — bus no longer available
    if (isTraceSessionError(recoveryError)) {
      throw new BusNoLongerAvailableError(
        "This bus is no longer available. Please select another bus."
      );
    }

    throw new SearchSessionExpiredError(
      "Your search session has expired. Please search again."
    );
  }
}

// ============================================================
// Custom Error Classes
// ============================================================

export class BusNoLongerAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusNoLongerAvailableError";
  }
}

export class SearchSessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchSessionExpiredError";
  }
}
