import type { BusSeatLayout, Seat, SeatDeck, SeatStatus, SeatType, SeatPosition, DeckType } from "@/types";
import seatLayoutsData from "@/data/seat-layouts.json";

export function getSeatLayout(busId: string, busType: string, basePrice: number, availableSeats: number): BusSeatLayout {
  // Check if we have an explicit layout
  const explicit = (seatLayoutsData as BusSeatLayout[]).find((l) => l.busId === busId);
  if (explicit) return explicit;

  // Generate a default layout based on bus type
  switch (busType) {
    case "sleeper":
      return generateSleeperLayout(busId, basePrice, availableSeats);
    case "semi_sleeper":
      return generateSemiSleeperLayout(busId, basePrice, availableSeats);
    default:
      return generateSeaterLayout(busId, basePrice, availableSeats);
  }
}

function generateSeaterLayout(busId: string, basePrice: number, availableSeats: number): BusSeatLayout {
  const rows = 10;
  const cols = 4;
  const totalSeats = rows * cols;
  const seats: Seat[] = [];
  let available = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seatNo = `${r + 1}${String.fromCharCode(65 + c)}`;
      const position: SeatPosition = c === 0 || c === 3 ? "window" : "aisle";
      const status = getRandomStatus(available, availableSeats, totalSeats, r * cols + c);
      if (status === "available" || status === "female-only") available++;

      seats.push({
        seatNo,
        status,
        price: r < 3 ? basePrice + 50 : r >= 7 ? basePrice - 50 : basePrice,
        position,
        row: r,
        col: c,
        deck: "lower",
        seatType: "seater",
      });
    }
  }

  return {
    busId,
    layoutType: "seater",
    totalSeats,
    availableSeats: seats.filter((s) => s.status === "available" || s.status === "female-only").length,
    decks: [{ deck: "lower", rows, cols, seats }],
  };
}

function generateSemiSleeperLayout(busId: string, basePrice: number, availableSeats: number): BusSeatLayout {
  const rows = 9;
  const cols = 4;
  const totalSeats = rows * cols;
  const seats: Seat[] = [];
  let available = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seatNo = `${r + 1}${String.fromCharCode(65 + c)}`;
      const position: SeatPosition = c === 0 || c === 3 ? "window" : "aisle";
      const status = getRandomStatus(available, availableSeats, totalSeats, r * cols + c);
      if (status === "available" || status === "female-only") available++;

      seats.push({
        seatNo,
        status,
        price: r >= 3 && r <= 6 ? basePrice + 50 : basePrice,
        position,
        row: r,
        col: c,
        deck: "lower",
        seatType: "semi_sleeper",
      });
    }
  }

  return {
    busId,
    layoutType: "semi_sleeper",
    totalSeats,
    availableSeats: seats.filter((s) => s.status === "available" || s.status === "female-only").length,
    decks: [{ deck: "lower", rows, cols, seats }],
  };
}

function generateSleeperLayout(busId: string, basePrice: number, availableSeats: number): BusSeatLayout {
  const rows = 6;
  const cols = 3;
  const decks: SeatDeck[] = [];

  for (const deck of ["lower", "upper"] as DeckType[]) {
    const seats: Seat[] = [];
    let available = 0;
    const deckPrice = deck === "lower" ? basePrice : basePrice - 50;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const prefix = deck === "lower" ? "L" : "U";
        const seatNo = `${prefix}${r * cols + c + 1}`;
        const position: SeatPosition = c === 0 || c === 2 ? "window" : "aisle";
        const status = getRandomStatus(available, Math.ceil(availableSeats / 2), rows * cols, r * cols + c);
        if (status === "available" || status === "female-only") available++;

        seats.push({
          seatNo,
          status,
          price: r >= 2 && r <= 4 ? deckPrice + 50 : deckPrice,
          position,
          row: r,
          col: c,
          deck,
          seatType: "sleeper",
        });
      }
    }

    decks.push({ deck, rows, cols, seats });
  }

  const allSeats = decks.flatMap((d) => d.seats);
  return {
    busId,
    layoutType: "sleeper",
    totalSeats: allSeats.length,
    availableSeats: allSeats.filter((s) => s.status === "available" || s.status === "female-only").length,
    decks,
  };
}

// Deterministic pseudo-random based on seed
function getRandomStatus(currentAvailable: number, targetAvailable: number, total: number, seed: number): SeatStatus {
  const hash = ((seed * 2654435761) >>> 0) % 100;

  if (currentAvailable >= targetAvailable) return "booked";

  if (hash < 5) return "blocked";
  if (hash < 10) return "female-only";
  if (hash < 45) return "available";
  return "booked";
}
