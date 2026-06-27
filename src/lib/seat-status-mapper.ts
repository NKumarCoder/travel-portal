import type { SeatStatus } from "@/types";

/**
 * Seat Status Mapper
 *
 * Maps API seat status codes to the UI SeatStatus type.
 * Unknown statuses are treated as "blocked" (unavailable) — never crashes.
 */

const STATUS_MAP: Record<string, SeatStatus> = {
  AFA: "available",
  BOK: "booked",
  BLK: "blocked",
  // Future status codes can be added here
};

/**
 * Map an API seat status string to the UI SeatStatus.
 *
 * @param apiStatus - Status string from the API (e.g. "AFA", "BOK", "BLK")
 * @returns Mapped SeatStatus for the UI
 */
export function mapSeatStatus(apiStatus: string): SeatStatus {
  const mapped = STATUS_MAP[apiStatus?.toUpperCase()];

  if (!mapped) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SeatMapper] Unknown seat status: "${apiStatus}" — treating as blocked`);
    }
    return "blocked";
  }

  return mapped;
}

/**
 * Check if a seat status allows selection.
 */
export function isSeatSelectable(status: SeatStatus): boolean {
  return status === "available" || status === "female-only";
}
