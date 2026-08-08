"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { debugRedirect } from "@/lib/debug";

export type GuardRequirement = "busId" | "seats" | "boardingPoint" | "droppingPoint" | "travellers" | "contact";

/**
 * Route guard hook for the bus booking flow.
 * Checks that required booking state exists before allowing page access.
 * Redirects to the appropriate step if requirements are not met.
 *
 * @param requirements - Array of state keys that must be present
 * @param busId - The current bus ID from the URL
 * @returns { isReady } - Whether all requirements are satisfied
 */
export function useBookingGuard(
  requirements: GuardRequirement[],
  busId: string
): { isReady: boolean } {
  const router = useRouter();
  const {
    busId: storeBusId,
    selectedSeats,
    boardingPoint,
    droppingPoint,
    isTravellerFormValid,
    isContactValid,
  } = useBusBookingStore();

  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    let redirectTo: string | null = null;
    let reason: string | null = null;

    for (const req of requirements) {
      switch (req) {
        case "busId":
          if (!storeBusId && !busId) {
            redirectTo = "/buses";
            reason = "No bus selected in store";
          }
          break;
        case "seats":
          if (selectedSeats.length === 0) {
            redirectTo = `/buses/${encodeURIComponent(busId)}`;
            reason = "No seats selected";
          }
          break;
        case "boardingPoint":
          if (!boardingPoint) {
            redirectTo = `/buses/${encodeURIComponent(busId)}`;
            reason = "No boarding point selected";
          }
          break;
        case "droppingPoint":
          if (!droppingPoint) {
            redirectTo = `/buses/${encodeURIComponent(busId)}`;
            reason = "No dropping point selected";
          }
          break;
        case "travellers":
          // Traveller form guard temporarily bypassed during Traveller module reset
          /*
          if (!isTravellerFormValid()) {
            redirectTo = `/buses/${encodeURIComponent(busId)}/travellers`;
            reason = "Traveller details incomplete";
          }
          */
          break;
        case "contact":
          // Contact guard temporarily bypassed during Traveller module reset
          /*
          if (!isContactValid()) {
            redirectTo = `/buses/${encodeURIComponent(busId)}/travellers`;
            reason = "Contact information incomplete";
          }
          */
          break;
      }

      if (redirectTo) break;
    }

    if (redirectTo && reason) {
      debugRedirect(reason, redirectTo);
      router.replace(redirectTo);
    } else {
      setIsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isReady };
}
