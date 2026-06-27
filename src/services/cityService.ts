import apiClient from "@/lib/api";

/**
 * City object returned by the Auto Suggest API.
 */
export interface City {
  code: string;
  name: string;
  type: string;
  state?: string;
}

interface CitiesResponse {
  cities: City[];
}

/**
 * In-memory cache for city search results.
 * Key: lowercase keyword, Value: array of City objects.
 */
const cityCache = new Map<string, City[]>();

/**
 * Search cities using the CDN Auto Suggest API.
 *
 * GET /api/cdn/citiesMatched/{keyword}
 *
 * Authorization is handled automatically by the Axios interceptor.
 * Results are cached in memory for the session duration.
 *
 * @param keyword - Search term (minimum 2 characters)
 * @returns Array of matching cities
 */
export async function searchCities(keyword: string): Promise<City[]> {
  const trimmed = keyword.trim().toLowerCase();

  if (trimmed.length < 2) {
    return [];
  }

  // Return cached result if available
  if (cityCache.has(trimmed)) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[CityService] Cache hit for "${trimmed}"`);
    }
    return cityCache.get(trimmed)!;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[CityService] Fetching cities for "${trimmed}"`);
  }

  const { data } = await apiClient.get<CitiesResponse>(
    `/api/cdn/citiesMatched/${encodeURIComponent(trimmed)}`
  );

  const cities = data.cities || [];

  // Store in cache
  cityCache.set(trimmed, cities);

  return cities;
}

/**
 * Clear the city search cache (useful on logout or session reset).
 */
export function clearCityCache(): void {
  cityCache.clear();
}
