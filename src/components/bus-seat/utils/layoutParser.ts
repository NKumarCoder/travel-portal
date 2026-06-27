import { mapSeatUIStatus, type SeatUIStatus } from "./seatStatusMapper";
import { classifySeat, detectBusLayoutType, type SeatType, type BusLayoutType } from "./seatClassifier";

/**
 * Layout Parser
 *
 * Transforms raw API seat data into a structured layout model
 * that the rendering engine can consume.
 *
 * This is the bridge between the API and the UI.
 */

// ─── Raw API types ──────────────────────────────────────────────────────────────

export interface RawApiSeat {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  desc: string;
  status: string;
  fare: {
    total: number;
    base: number;
    gst: number;
    commission: number;
    totalNetFare: number;
  } | number;
}

// ─── Parsed types ───────────────────────────────────────────────────────────────

export interface ParsedSeat {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  desc: string;
  seatType: SeatType;
  status: SeatUIStatus;
  fare: number;
  fareBreakdown: {
    base: number;
    gst: number;
    total: number;
  };
  deck: number;
  isWindow: boolean;
  isAisle: boolean;
}

export interface ParsedDeck {
  deck: number;
  label: string;
  seats: ParsedSeat[];
  maxX: number;
  maxY: number;
  cols: number;
  rows: number;
}

export interface ParsedLayout {
  decks: ParsedDeck[];
  deckCount: number;
  totalSeats: number;
  availableSeats: number;
  busLayoutType: BusLayoutType;
}

// ─── Parser ─────────────────────────────────────────────────────────────────────

/**
 * Parse raw API seats into a structured layout model.
 *
 * - Splits seats by deck (z coordinate)
 * - Classifies each seat type from dimensions
 * - Maps statuses to UI values
 * - Computes grid dimensions per deck
 * - Detects window/aisle positions
 */
export function parseLayout(rawSeats: RawApiSeat[]): ParsedLayout {
  if (!rawSeats || rawSeats.length === 0) {
    return {
      decks: [],
      deckCount: 0,
      totalSeats: 0,
      availableSeats: 0,
      busLayoutType: "seater",
    };
  }

  // Group by deck (z coordinate)
  const deckMap = new Map<number, RawApiSeat[]>();
  for (const seat of rawSeats) {
    const z = seat.z ?? 0;
    if (!deckMap.has(z)) deckMap.set(z, []);
    deckMap.get(z)!.push(seat);
  }

  // Sort deck keys
  const deckKeys = [...deckMap.keys()].sort();

  // Parse each deck
  const decks: ParsedDeck[] = deckKeys.map((deckZ, index) => {
    const deckSeats = deckMap.get(deckZ)!;
    const parsedSeats = deckSeats.map((raw) => parseSeat(raw, deckZ, deckSeats));

    // Compute grid dimensions
    let maxX = 0;
    let maxY = 0;
    for (const seat of parsedSeats) {
      const endX = seat.x + seat.width;
      const endY = seat.y + seat.height;
      if (endX > maxX) maxX = endX;
      if (endY > maxY) maxY = endY;
    }

    return {
      deck: deckZ,
      label: index === 0 ? "Lower Deck" : "Upper Deck",
      seats: parsedSeats,
      maxX,
      maxY,
      cols: maxX,
      rows: maxY,
    };
  });

  // Compute totals
  const allParsed = decks.flatMap((d) => d.seats);
  const totalSeats = allParsed.length;
  const availableSeats = allParsed.filter(
    (s) => s.status === "available" || s.status === "ladies"
  ).length;

  // Detect bus layout type
  const busLayoutType = detectBusLayoutType(
    allParsed.map((s) => ({ width: s.width, height: s.height, desc: s.desc }))
  );

  return {
    decks,
    deckCount: decks.length,
    totalSeats,
    availableSeats,
    busLayoutType,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function parseSeat(
  raw: RawApiSeat,
  deckZ: number,
  allDeckSeats: RawApiSeat[]
): ParsedSeat {
  const width = Math.max(1, raw.width || 1);
  const height = Math.max(1, raw.height || 1);

  // Fare extraction
  let fare = 0;
  let fareBreakdown = { base: 0, gst: 0, total: 0 };
  if (typeof raw.fare === "number") {
    fare = raw.fare;
    fareBreakdown = { base: raw.fare, gst: 0, total: raw.fare };
  } else if (raw.fare && typeof raw.fare === "object") {
    fare = raw.fare.total || 0;
    fareBreakdown = {
      base: raw.fare.base || 0,
      gst: raw.fare.gst || 0,
      total: raw.fare.total || 0,
    };
  }

  // Detect window/aisle from x position relative to deck width
  const maxX = Math.max(...allDeckSeats.map((s) => s.x + (s.width || 1)));
  const isWindow = raw.x === 0 || raw.x + width >= maxX;
  const isAisle = !isWindow;

  return {
    id: raw.id,
    name: raw.name || raw.id,
    x: raw.x,
    y: raw.y,
    z: deckZ,
    width,
    height,
    desc: raw.desc || "",
    seatType: classifySeat(width, height, raw.desc),
    status: mapSeatUIStatus(raw.status),
    fare,
    fareBreakdown,
    deck: deckZ,
    isWindow,
    isAisle,
  };
}
