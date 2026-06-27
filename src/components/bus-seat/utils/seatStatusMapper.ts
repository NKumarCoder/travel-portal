/**
 * Seat Status Mapper
 *
 * Maps raw API status codes to normalized UI status values.
 * Unknown statuses default to "blocked" — never crash.
 */

export type SeatUIStatus =
  | "available"
  | "booked"
  | "selected"
  | "ladies"
  | "blocked"
  | "partner_booked"
  | "reserved";

const STATUS_MAP: Record<string, SeatUIStatus> = {
  AFA: "available",
  AVL: "available",
  AVAILABLE: "available",
  BOK: "booked",
  BOOKED: "booked",
  BLK: "blocked",
  BLOCKED: "blocked",
  LAD: "ladies",
  LADIES: "ladies",
  FEM: "ladies",
  PBK: "partner_booked",
  PARTNER: "partner_booked",
  RSV: "reserved",
  RESERVED: "reserved",
};

/**
 * Map an API seat status string to a normalized UI status.
 */
export function mapSeatUIStatus(apiStatus: string): SeatUIStatus {
  if (!apiStatus) return "blocked";
  const mapped = STATUS_MAP[apiStatus.toUpperCase().trim()];
  if (!mapped) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SeatEngine] Unknown seat status: "${apiStatus}" → blocked`);
    }
    return "blocked";
  }
  return mapped;
}

/**
 * Check if a seat with this status can be selected by the user.
 */
export function isSelectable(status: SeatUIStatus): boolean {
  return status === "available" || status === "ladies";
}
