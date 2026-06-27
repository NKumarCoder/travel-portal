/**
 * API Service Layer
 *
 * This is a placeholder service for future API integration.
 * Currently all data comes from local JSON files.
 *
 * When ready to integrate with a backend:
 * 1. Configure the BASE_URL below
 * 2. Implement the fetch methods
 * 3. Replace mock data imports in pages/stores
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = config;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  flights: {
    search: (params: Record<string, string>) =>
      request(`/flights?${new URLSearchParams(params)}`),
    getById: (id: string) => request(`/flights/${id}`),
  },
  hotels: {
    search: (params: Record<string, string>) =>
      request(`/hotels?${new URLSearchParams(params)}`),
    getById: (id: string) => request(`/hotels/${id}`),
  },
  buses: {
    search: (params: Record<string, string>) =>
      request(`/buses?${new URLSearchParams(params)}`),
    getById: (id: string) => request(`/buses/${id}`),
  },
  activities: {
    search: (params: Record<string, string>) =>
      request(`/activities?${new URLSearchParams(params)}`),
    getById: (id: string) => request(`/activities/${id}`),
  },
  packages: {
    search: (params: Record<string, string>) =>
      request(`/packages?${new URLSearchParams(params)}`),
    getById: (id: string) => request(`/packages/${id}`),
  },
  bookings: {
    getAll: () => request("/bookings"),
    getById: (id: string) => request(`/bookings/${id}`),
    create: (data: unknown) => request("/bookings", { method: "POST", body: data }),
    cancel: (id: string) => request(`/bookings/${id}/cancel`, { method: "POST" }),
  },
  user: {
    getProfile: () => request("/user/profile"),
    updateProfile: (data: unknown) => request("/user/profile", { method: "PUT", body: data }),
  },
};
