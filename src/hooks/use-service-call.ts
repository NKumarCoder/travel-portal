import React from "react";
import { debugLog, debugError } from "@/lib/debug";

// ============================================================
// useServiceCall - React Query-like hook for async service calls
// Provides loading, success, error states for any Promise-based service.
// ============================================================

export type ServiceState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSuccess: boolean;
};

interface UseServiceCallOptions<T> {
  /** Called automatically on mount if true (default: false) */
  immediate?: boolean;
  /** Called after successful resolution */
  onSuccess?: (data: T) => void;
  /** Called after rejection */
  onError?: (error: string) => void;
  /** Debug label for logging */
  debugLabel?: string;
}

/**
 * Hook that wraps any async service function with loading/error/success states.
 *
 * Usage:
 * ```ts
 * const { data, isLoading, isError, execute } = useServiceCall(
 *   () => searchBuses({ source, destination }),
 *   { debugLabel: "BUS_SEARCH" }
 * );
 * ```
 */
export function useServiceCall<T>(
  serviceFn: () => Promise<T>,
  options: UseServiceCallOptions<T> = {}
) {
  const { immediate = false, onSuccess, onError, debugLabel } = options;

  const [state, setState] = React.useState<ServiceState<T>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: false,
  });

  const execute = React.useCallback(async () => {
    setState({ data: null, isLoading: true, isError: false, error: null, isSuccess: false });

    if (debugLabel) {
      debugLog(`${debugLabel}_LOADING`, undefined, "info");
    }

    try {
      const result = await serviceFn();
      setState({ data: result, isLoading: false, isError: false, error: null, isSuccess: true });

      if (debugLabel) {
        debugLog(`${debugLabel}_SUCCESS`, result, "success");
      }

      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setState({ data: null, isLoading: false, isError: true, error: message, isSuccess: false });

      if (debugLabel) {
        debugError(debugLabel, err);
      }

      onError?.(message);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceFn, debugLabel]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  const reset = React.useCallback(() => {
    setState({ data: null, isLoading: false, isError: false, error: null, isSuccess: false });
  }, []);

  return { ...state, execute, reset };
}
