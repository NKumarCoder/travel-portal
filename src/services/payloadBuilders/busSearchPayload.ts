import type { City } from "@/services/cityService";

/**
 * Bus Search API request payload interface.
 *
 * Confirmed via API validation errors:
 * - "The Trips field is required." → top-level `trips` array needed
 * - "Trips[0].Src is required." → each trip needs `src`
 * - "Trips[0].Dst is required." → each trip needs `dst`
 *
 * Correct schema:
 * {
 *   "trips": [
 *     {
 *       "src": "<city_code>",
 *       "dst": "<city_code>",
 *       "doj": "<date>"
 *     }
 *   ]
 * }
 */

export interface BusSearchTrip {
  src: string;
  dst: string;
  doj: string;
}

export interface BusSearchExt {
  timeout: number;
  filters: boolean;
  tags: string[];
}

export interface BusSearchPayload {
  trips: BusSearchTrip[];
  ext: BusSearchExt;
}

export interface BusSearchInput {
  fromCity: City | null;
  toCity: City | null;
  departDate: string;
}

/**
 * Build the Bus Search API request payload.
 *
 * This is the ONLY place responsible for constructing the search request body.
 * All future schema changes should be made here without touching React components.
 *
 * @param input - Search parameters from the store (cities + date)
 * @returns The payload object to send to POST /api/bus/search
 * @throws Error if required fields are missing
 */
export function buildBusSearchPayload(
  input: BusSearchInput
): BusSearchPayload {
  const { fromCity, toCity, departDate } = input;

  if (!fromCity?.code) {
    throw new Error("Source city is required.");
  }

  if (!toCity?.code) {
    throw new Error("Destination city is required.");
  }

  if (!departDate) {
    throw new Error("Journey date is required.");
  }

  // Convert to API format
  const doj = new Date(departDate)
    .toISOString()
    .split(".")[0];

  const payload: BusSearchPayload = {
    trips: [
      {
        src: String(fromCity.code),
        dst: String(toCity.code),
        doj,
      },
    ],
    ext: {
      timeout: 60000,
      filters: true,
      tags: [],
    },
  };

  if (process.env.NODE_ENV === "development") {
    console.log("========== BUS SEARCH PAYLOAD ==========");
    console.log(JSON.stringify(payload, null, 2));
    console.log("========================================");
  }

  return payload;
}
