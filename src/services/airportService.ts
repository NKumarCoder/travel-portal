import flightApiClient from "@/lib/flightApi";
import type { Airport } from "@/types";

/**
 * In-memory cache for airport search results.
 * Key: lowercase trimmed keyword, Value: array of Airport objects.
 */
const airportCache = new Map<string, Airport[]>();

/**
 * Search airports using the Flight Airport Search API.
 *
 * GET /api/Airport/Search?keyword={keyword}
 *
 * Handled via the flightApiClient proxy with automatic Bearer token injection.
 * Results are cached in memory for the session duration.
 *
 * @param keyword - Search term (minimum 2 characters)
 * @param signal - Optional AbortSignal to cancel in-flight requests
 * @returns Array of matching Airport objects
 */
export async function searchAirports(
  keyword: string,
  signal?: AbortSignal
): Promise<Airport[]> {
  const trimmed = keyword.trim().toLowerCase();

  if (trimmed.length < 2) {
    return [];
  }

  // Return cached result if available
  if (airportCache.has(trimmed)) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[AirportService] Cache hit for "${trimmed}"`);
    }
    return airportCache.get(trimmed)!;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[AirportService] Fetching airports for "${trimmed}"`);
  }

  try {
    const { data } = await flightApiClient.get<Airport[]>(
      `/api/Airport/Search?keyword=${encodeURIComponent(trimmed)}`,
      { signal }
    );

    const raw = data as unknown;
    const airports: Airport[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as any)?.data)
      ? (raw as any).data
      : [];

    // Store in cache
    airportCache.set(trimmed, airports);

    return airports;
  } catch (error: unknown) {
    // If cancelled/aborted, do not treat as error
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "CanceledError"
    ) {
      return [];
    }
    throw error;
  }
}

/**
 * Clear the airport search cache.
 */
export function clearAirportCache(): void {
  airportCache.clear();
}
