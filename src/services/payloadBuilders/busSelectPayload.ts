/**
 * Bus Select API Payload Builder
 *
 * POST /api/bus/select
 *
 * Request:
 * {
 *   "traceId": "<traceId from search response>",
 *   "busId": "<selected bus id>",
 *   "bpid": null,
 *   "dpid": null,
 *   "type": "etravos_ui",
 *   "ext": {
 *     "timeout": 60000,
 *     "layout": "Horizontal"
 *   }
 * }
 */

export interface BusSelectPayload {
  traceId: string;
  busId: string;
  bpid: string | null;
  dpid: string | null;
  type: string;
  ext: {
    timeout: number;
    layout: string;
  };
}

export interface BusSelectInput {
  traceId: string;
  busId: string;
}

/**
 * Build the Bus Select API request payload.
 *
 * This is the ONLY place responsible for constructing the select request body.
 * All future schema changes should be made here without touching React components.
 *
 * @param input - traceId from search response + selected busId
 * @returns The payload object to send to POST /api/bus/select
 * @throws Error if required fields are missing
 */
export function buildBusSelectPayload(input: BusSelectInput): BusSelectPayload {
  const { traceId, busId } = input;

  if (!traceId) {
    throw new Error("traceId is required (from search response)");
  }
  if (!busId) {
    throw new Error("busId is required (selected bus)");
  }

  const payload: BusSelectPayload = {
    traceId,
    busId,
    bpid: null,
    dpid: null,
    type: "etravos_ui",
    ext: {
      timeout: 60000,
      layout: "Horizontal",
    },
  };

  if (process.env.NODE_ENV === "development") {
    console.log("========== BUS SELECT PAYLOAD ==========");
    console.log("Trace ID:", traceId);
    console.log("Bus ID:", busId);
    console.log("Final Payload:", JSON.stringify(payload, null, 2));
    console.log("========================================");
  }

  return payload;
}
