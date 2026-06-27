// ============================================================
// Reusable Error Definitions & Utilities
// ============================================================

export type ErrorType =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BOOKING_FAILED"
  | "PAYMENT_FAILED"
  | "SESSION_EXPIRED"
  | "UNKNOWN_ERROR";

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  retryable: boolean;
}

/**
 * Predefined error templates for common scenarios.
 */
export const ERRORS: Record<ErrorType, AppError> = {
  NETWORK_ERROR: {
    type: "NETWORK_ERROR",
    message: "Unable to connect",
    details: "Please check your internet connection and try again.",
    retryable: true,
  },
  NOT_FOUND: {
    type: "NOT_FOUND",
    message: "Not found",
    details: "The requested resource could not be found.",
    retryable: false,
  },
  VALIDATION_ERROR: {
    type: "VALIDATION_ERROR",
    message: "Invalid input",
    details: "Please check your input and try again.",
    retryable: false,
  },
  BOOKING_FAILED: {
    type: "BOOKING_FAILED",
    message: "Booking failed",
    details: "We could not complete your booking. Please try again.",
    retryable: true,
  },
  PAYMENT_FAILED: {
    type: "PAYMENT_FAILED",
    message: "Payment failed",
    details: "Your payment could not be processed. Please try a different method.",
    retryable: true,
  },
  SESSION_EXPIRED: {
    type: "SESSION_EXPIRED",
    message: "Session expired",
    details: "Your session has timed out. Please start again.",
    retryable: false,
  },
  UNKNOWN_ERROR: {
    type: "UNKNOWN_ERROR",
    message: "Something went wrong",
    details: "An unexpected error occurred. Please try again later.",
    retryable: true,
  },
};

/**
 * Create a custom app error with optional override.
 */
export function createAppError(
  type: ErrorType,
  overrides?: Partial<Omit<AppError, "type">>
): AppError {
  return { ...ERRORS[type], ...overrides };
}

/**
 * Simulate a random error for testing (use in dev only).
 * Returns null if no error triggered, or an AppError if triggered.
 */
export function simulateRandomError(probability: number = 0.1): AppError | null {
  if (Math.random() < probability) {
    const types: ErrorType[] = ["NETWORK_ERROR", "BOOKING_FAILED", "PAYMENT_FAILED"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return ERRORS[randomType];
  }
  return null;
}
