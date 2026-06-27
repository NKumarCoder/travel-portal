import { USE_MOCK_DATA } from "./config";
import hotelSearchResponse from "@/mock-data/hotels/hotel-search-response.json";

/**
 * Hotel Service - placeholder for future hotel module
 */

export async function searchHotels(params: {
  destination: string;
  checkIn?: string;
  checkOut?: string;
}) {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 800));
    return hotelSearchResponse.results;
  }

  const res = await fetch(`/api/hotels/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return data.results;
}
