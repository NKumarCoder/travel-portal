// ============================================================
// Service Configuration
// Set USE_MOCK_DATA to false when connecting to real APIs
// ============================================================

export const USE_MOCK_DATA = false;

// API base URL — reads from NEXT_PUBLIC_API_BASE_URL environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
