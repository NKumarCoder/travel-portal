// ============================================================
// Debug & Logging Utility
// Set DEBUG_MODE to false to suppress all logs in production.
// ============================================================

export const DEBUG_MODE = true;

type LogLevel = "info" | "warn" | "error" | "success";

const LEVEL_STYLES: Record<LogLevel, string> = {
  info: "color: #3b82f6; font-weight: bold;",
  warn: "color: #f59e0b; font-weight: bold;",
  error: "color: #ef4444; font-weight: bold;",
  success: "color: #10b981; font-weight: bold;",
};

const LEVEL_ICONS: Record<LogLevel, string> = {
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  success: "✅",
};

/**
 * Core debug logger. Only outputs when DEBUG_MODE is true.
 */
export function debugLog(
  step: string,
  data?: unknown,
  level: LogLevel = "info"
): void {
  if (!DEBUG_MODE) return;

  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });

  const icon = LEVEL_ICONS[level];
  const style = LEVEL_STYLES[level];

  if (data !== undefined) {
    console.log(
      `%c[${step}] ${icon} ${timestamp}`,
      style,
      data
    );
  } else {
    console.log(`%c[${step}] ${icon} ${timestamp}`, style);
  }
}

/**
 * Start a grouped section in the console.
 */
export function debugGroup(label: string): void {
  if (!DEBUG_MODE) return;
  console.group(`🚌 ${label}`);
}

/**
 * End a grouped section.
 */
export function debugGroupEnd(): void {
  if (!DEBUG_MODE) return;
  console.groupEnd();
}

/**
 * Log an error with context.
 */
export function debugError(step: string, error: unknown): void {
  if (!DEBUG_MODE) return;
  console.error(
    `%c[FLOW_ERROR] ❌ Step: ${step}`,
    "color: #ef4444; font-weight: bold;",
    { step, error: error instanceof Error ? error.message : error, raw: error }
  );
}

/**
 * Log navigation events.
 */
export function debugNavigation(from: string, to: string): void {
  debugLog("NAVIGATION_STARTED", { from, to }, "info");
}

/**
 * Log redirect with reason.
 */
export function debugRedirect(reason: string, target: string): void {
  debugLog("REDIRECT_TRIGGERED", { reason, redirectTo: target }, "warn");
}

/**
 * Log validation failures.
 */
export function debugValidation(reason: string, details?: unknown): void {
  debugLog("CONTINUE_BLOCKED", { reason, ...((details as object) || {}) }, "warn");
}
