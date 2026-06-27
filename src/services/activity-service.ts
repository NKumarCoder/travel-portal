import { USE_MOCK_DATA } from "./config";
import activitySearchResponse from "@/mock-data/activities/activity-search-response.json";

/**
 * Activity Service - placeholder for future activity module
 */

export async function searchActivities(params: {
  destination: string;
  date?: string;
}) {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 800));
    return activitySearchResponse.results;
  }

  const res = await fetch(`/api/activities/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return data.results;
}
