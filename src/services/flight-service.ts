import { USE_MOCK_DATA } from "./config";
import flightSearchResponse from "@/mock-data/flights/flight-search-response.json";

/**
 * Flight Service - placeholder for future flight module
 */

export async function searchFlights(params: {
  source: string;
  destination: string;
  date?: string;
}) {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 800));
    return flightSearchResponse.results;
  }

  const res = await fetch(`/api/flights/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return data.results;
}
