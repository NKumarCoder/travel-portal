/**
 * Seat Classifier
 *
 * Determines seat type (seater, vertical sleeper, horizontal sleeper)
 * automatically from API metadata (width, height, desc).
 *
 * Never hardcodes operator-specific logic.
 */

export type SeatType = "seater" | "vertical_sleeper" | "horizontal_sleeper";
export type BusLayoutType = "seater" | "sleeper" | "mixed";

/**
 * Classify a single seat's type from its dimensions and description.
 *
 * Rules:
 * - width == 1 && height == 1 → Seater
 * - height > 1 → Vertical Sleeper
 * - width > 1 → Horizontal Sleeper
 * - desc fallback for edge cases
 */
export function classifySeat(
  width: number,
  height: number,
  desc?: string
): SeatType {
  // Dimension-based detection (primary)
  if (height > 1 && width <= 1) return "vertical_sleeper";
  if (width > 1 && height <= 1) return "horizontal_sleeper";
  if (width > 1 && height > 1) return "horizontal_sleeper"; // large berths

  // Description fallback
  if (desc) {
    const lower = desc.toLowerCase();
    if (lower.includes("sleeper") || lower.includes("berth")) {
      return "horizontal_sleeper";
    }
    if (lower.includes("semi")) return "seater";
  }

  // Default: 1×1 is a seater
  return "seater";
}

/**
 * Detect the overall bus layout type from all seats.
 *
 * - All seaters → "seater"
 * - All sleepers → "sleeper"
 * - Mix → "mixed"
 */
export function detectBusLayoutType(
  seats: Array<{ width: number; height: number; desc?: string }>
): BusLayoutType {
  if (seats.length === 0) return "seater";

  let hasSeater = false;
  let hasSleeper = false;

  for (const seat of seats) {
    const type = classifySeat(seat.width, seat.height, seat.desc);
    if (type === "seater") hasSeater = true;
    else hasSleeper = true;

    if (hasSeater && hasSleeper) return "mixed";
  }

  if (hasSleeper) return "sleeper";
  return "seater";
}

/**
 * Get human-readable label for bus layout type.
 */
export function getBusLayoutLabel(type: BusLayoutType): string {
  switch (type) {
    case "seater":
      return "Seater";
    case "sleeper":
      return "Sleeper";
    case "mixed":
      return "Sleeper + Seater";
  }
}
