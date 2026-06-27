import { USE_MOCK_DATA } from "./config";
import plannerResponse from "@/mock-data/planner/planner-response.json";

/**
 * AI Planner Service - placeholder for future planner module
 */

export async function generatePlan(params: {
  destination: string;
  duration: number;
  preferences?: string[];
}) {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 1500));
    return plannerResponse.plan;
  }

  const res = await fetch(`/api/planner/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return data.plan;
}
