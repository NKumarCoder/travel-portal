import axios from "axios";
import type {
  AirSearchRequest,
  AirSearchResponse,
  AirSearchSegment,
  AirSearchFare,
  AirSearchFareFamily,
  NormalizedFlightResult,
  NormalizedFlightSegment,
  FlightSearchParams,
} from "@/types";
import { ensureFlightAuthentication } from "@/services/flightAuthService";

const FLIGHT_API_BASE_URL =
  process.env.NEXT_PUBLIC_FLIGHT_API_BASE_URL ||
  process.env.FLIGHT_API_BASE_URL ||
  "https://stagingflightapi.etravos.in";

const AIRLINE_NAMES: Record<string, string> = {
  "6E": "IndiGo",
  AI: "Air India",
  SG: "SpiceJet",
  QP: "Akasa Air",
  IX: "Air India Express",
  I5: "AIX Connect",
  UK: "Vistara",
  EK: "Emirates",
  QR: "Qatar Airways",
  BA: "British Airways",
  LH: "Lufthansa",
  SQ: "Singapore Airlines",
  EY: "Etihad Airways",
  FZ: "Flydubai",
  G8: "Go First",
};

const AIRPORT_CITIES: Record<string, string> = {
  HYD: "Hyderabad",
  BLR: "Bangalore",
  MAA: "Chennai",
  BOM: "Mumbai",
  DEL: "Delhi",
  CCU: "Kolkata",
  GOI: "Goa",
  GOX: "Goa (Mopa)",
  COK: "Kochi",
  AMD: "Ahmedabad",
  PNQ: "Pune",
  JAI: "Jaipur",
  LKO: "Lucknow",
  IXC: "Chandigarh",
  GAU: "Guwahati",
  IXB: "Bagdogra",
  PAT: "Patna",
  BBI: "Bhubaneswar",
  TRV: "Thiruvananthapuram",
  VTZ: "Visakhapatnam",
  VNS: "Varanasi",
  SXR: "Srinagar",
  ATQ: "Amritsar",
  IXE: "Mangalore",
  IDR: "Indore",
  NAG: "Nagpur",
};

/**
 * Maps airline IATA code to user-friendly airline name.
 */
export function getAirlineName(code: string): string {
  return AIRLINE_NAMES[code?.toUpperCase()] || code || "Airline";
}

/**
 * Maps airport code to city name.
 */
export function getAirportCity(code: string): string {
  return AIRPORT_CITIES[code?.toUpperCase()] || code || "";
}

/**
 * Formats duration in minutes to human-readable string (e.g. 145 -> "2h 25m").
 */
export function formatMinutesToHours(minutes: number): string {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Formats "YYYY-MM-DD" into API format "YYYY-MM-DDT00:00:00".
 */
function formatApiDateTime(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) return dateStr;
  return `${dateStr}T00:00:00`;
}

/**
 * Maps UI cabin class string to API format.
 */
function mapCabinClassToApi(cabin: string): string {
  switch (cabin?.toLowerCase()) {
    case "premium_economy":
    case "premiumeconomy":
      return "PremiumEconomy";
    case "business":
      return "Business";
    case "first":
      return "First";
    case "economy":
    default:
      return "Economy";
  }
}

/**
 * Extracts "HH:MM" time from ISO datetime string.
 */
function extractTime(dateTimeStr: string): string {
  if (!dateTimeStr) return "--:--";
  const parts = dateTimeStr.split("T");
  if (parts.length > 1) {
    return parts[1].substring(0, 5);
  }
  return "--:--";
}

/**
 * Extracts "YYYY-MM-DD" date from ISO datetime string.
 */
function extractDate(dateTimeStr: string): string {
  if (!dateTimeStr) return "";
  return dateTimeStr.split("T")[0] || "";
}

/**
 * Computes layover duration between two datetime strings in minutes.
 */
function computeMinutesBetween(arrivalStr: string, nextDepartureStr: string): number {
  try {
    const arrival = new Date(arrivalStr).getTime();
    const nextDep = new Date(nextDepartureStr).getTime();
    if (isNaN(arrival) || isNaN(nextDep)) return 0;
    const diffMs = nextDep - arrival;
    return Math.max(0, Math.round(diffMs / (1000 * 60)));
  } catch {
    return 0;
  }
}

/**
 * Normalizes an array of raw segments into NormalizedFlightSegment structures.
 */
function normalizeSegments(
  rawSegments: AirSearchSegment[],
  requestedClass: string
): {
  segments: NormalizedFlightSegment[];
  durationMinutes: number;
  durationFormatted: string;
  stops: number;
  stopDetails: string[];
} {
  const normalized: NormalizedFlightSegment[] = rawSegments.map((seg) => {
    const durMins = parseInt(seg.journeyDuration || "0", 10) || 0;
    const airlineCode = seg.operatingAirline || seg.marketingAirline || "";
    const origCity = AIRPORT_CITIES[seg.origin?.toUpperCase()] || seg.origin;
    const destCity = AIRPORT_CITIES[seg.destination?.toUpperCase()] || seg.destination;
    return {
      segId: seg.segId,
      origin: seg.origin,
      destination: seg.destination,
      originCity: origCity,
      destinationCity: destCity,
      departureDateTime: seg.departureDateTime,
      arrivalDateTime: seg.arrivalDateTime,
      departureTime: extractTime(seg.departureDateTime),
      arrivalTime: extractTime(seg.arrivalDateTime),
      departureDate: extractDate(seg.departureDateTime),
      arrivalDate: extractDate(seg.arrivalDateTime),
      durationMinutes: durMins,
      durationFormatted: formatMinutesToHours(durMins),
      flightNumber: `${airlineCode}-${seg.flightNumber}`,
      airlineCode,
      airlineName: getAirlineName(airlineCode),
      departureTerminal: seg.departureTerminal,
      arrivalTerminal: seg.arrivalTerminal,
      cabinClass: requestedClass,
    };
  });

  const stops = Math.max(0, rawSegments.length - 1);
  const stopDetails: string[] = [];

  let totalMinutes = 0;
  for (let i = 0; i < rawSegments.length; i++) {
    const segDur = parseInt(rawSegments[i].journeyDuration || "0", 10) || 0;
    totalMinutes += segDur;

    if (i < rawSegments.length - 1) {
      const layoverMins = computeMinutesBetween(
        rawSegments[i].arrivalDateTime,
        rawSegments[i + 1].departureDateTime
      );
      totalMinutes += layoverMins;
      stopDetails.push(
        `Layover in ${rawSegments[i].destination} (${formatMinutesToHours(layoverMins)})`
      );
    }
  }

  return {
    segments: normalized,
    durationMinutes: totalMinutes,
    durationFormatted: formatMinutesToHours(totalMinutes),
    stops,
    stopDetails,
  };
}

/**
 * Normalizes the full AirSearch API response into separated Onward and Return results.
 * Preserves all fare, segment, baggage, and tax data.
 */
export function normalizeAirSearchResponse(
  response: AirSearchResponse,
  params: FlightSearchParams
): {
  onwardResults: NormalizedFlightResult[];
  returnResults: NormalizedFlightResult[];
  traceId: string;
} {
  const traceId = response?.traceId || "";
  const rawFares = Array.isArray(response?.fares) ? response.fares : [];
  const rawSegments = Array.isArray(response?.segments) ? response.segments : [];
  const itineraries = response?.itineraries || {};

  // Build lookup maps
  const segmentMap = new Map<string, AirSearchSegment>();
  rawSegments.forEach((seg) => {
    if (seg?.segId) segmentMap.set(seg.segId, seg);
  });

  // Map fareId -> itinerary data if itineraries exist
  const fareItineraryMap = new Map<
    string,
    { direction: "onward" | "return" | "combo"; it: any }
  >();

  for (const it of itineraries.onward || []) {
    if (it?.fareMapping) fareItineraryMap.set(it.fareMapping, { direction: "onward", it });
  }
  for (const it of itineraries.return || []) {
    if (it?.fareMapping) fareItineraryMap.set(it.fareMapping, { direction: "return", it });
  }
  for (const it of itineraries.combo || []) {
    if (it?.fareMapping) fareItineraryMap.set(it.fareMapping, { direction: "combo", it });
  }

  const onwardResults: NormalizedFlightResult[] = [];
  const returnResults: NormalizedFlightResult[] = [];

  const onwardOrigin = params.fromAirport.airportCode.toUpperCase().trim();
  const onwardDest = params.toAirport.airportCode.toUpperCase().trim();
  const returnOrigin = onwardDest;
  const returnDest = onwardOrigin;

  // Traversal: Iterate response.fares -> fare.fareFamilies
  for (const fare of rawFares) {
    if (!fare) continue;
    const itInfo = fareItineraryMap.get(fare.fareId);
    let itinerarySegs: AirSearchSegment[] = [];
    const validatingCarrier = itInfo?.it?.validatingCarrier || "";

    if (itInfo?.it?.segmentMapping?.[0]) {
      itinerarySegs = itInfo.it.segmentMapping[0]
        .map((id: string) => segmentMap.get(id))
        .filter((s: any): s is AirSearchSegment => !!s);
    }

    const families = Array.isArray(fare.fareFamilies) ? fare.fareFamilies : [];
    for (const fareFamily of families) {
      if (!fareFamily) continue;

      // 1. Resolve Segments: use itinerarySegs or fallback to segmentInfos / rawSegments
      let segList: AirSearchSegment[] = itinerarySegs.length > 0 ? [...itinerarySegs] : [];

      if (segList.length === 0 && Array.isArray(fareFamily.segmentInfos) && fareFamily.segmentInfos.length > 0) {
        // Match from rawSegments using segmentInfos key or cityPair
        for (const sInfo of fareFamily.segmentInfos) {
          const matchedSeg = rawSegments.find(
            (rs) => rs.segId === sInfo.key || (sInfo.key && sInfo.key.includes(rs.segId))
          );
          if (matchedSeg) {
            segList.push(matchedSeg);
          }
        }
      }

      // 2. Determine Direction
      let direction = itInfo?.direction;
      if (!direction || direction === "combo") {
        if (segList.length > 0) {
          const firstOrigin = segList[0].origin?.toUpperCase().trim();
          const lastDest = segList[segList.length - 1].destination?.toUpperCase().trim();
          if (
            firstOrigin === returnOrigin ||
            lastDest === returnDest ||
            segList.some((s) => s.isReturn)
          ) {
            direction = "return";
          } else {
            direction = "onward";
          }
        } else if (fareFamily.segmentInfos?.[0]) {
          const cp = (fareFamily.segmentInfos[0].cityPair || "").toUpperCase().trim();
          if (cp.endsWith(returnDest) || cp.startsWith(returnOrigin)) {
            direction = "return";
          } else {
            direction = "onward";
          }
        } else {
          direction = "onward";
        }
      }

      // 3. Fallback synthetic segment if no segments could be linked
      if (segList.length === 0) {
        const defaultPair =
          direction === "onward" ? `${onwardOrigin}-${onwardDest}` : `${returnOrigin}-${returnDest}`;
        const cp = (fareFamily.segmentInfos?.[0]?.cityPair || defaultPair).toUpperCase().trim();
        const [pOrig, pDest] = cp.split("-");
        const depDate =
          direction === "onward"
            ? params.departDate
            : params.returnDate || params.departDate;
        const airline = fareFamily.baggage?.[0]?.airline || "AI";

        segList = [
          {
            segId: fareFamily.segmentInfos?.[0]?.key || fare.fareId,
            isReturn: direction === "return",
            origin: pOrig || (direction === "onward" ? onwardOrigin : returnOrigin),
            destination: pDest || (direction === "onward" ? onwardDest : returnDest),
            departureDateTime: formatApiDateTime(depDate),
            arrivalDateTime: formatApiDateTime(depDate),
            journeyDuration: "120",
            flightNumber: "Flight",
            operatingAirline: airline,
            marketingAirline: airline,
          },
        ];
      }

      const firstSeg = segList[0];
      const lastSeg = segList[segList.length - 1];

      // 4. Normalize Segments
      const { segments, durationMinutes, durationFormatted, stops, stopDetails } =
        normalizeSegments(segList, params.travelClass);

      const carrier =
        validatingCarrier ||
        firstSeg.operatingAirline ||
        firstSeg.marketingAirline ||
        fareFamily.baggage?.[0]?.airline ||
        "";

      const baggageList = fareFamily.baggage || [];
      const checkinBaggage =
        baggageList.find((b) => b.baggageInfo && !b.baggageInfo.toLowerCase().includes("cabin"))
          ?.baggageInfo ||
        baggageList[0]?.baggageInfo ||
        "15 Kg (1 Piece)";
      const cabinBaggage =
        baggageList.find((b) => b.cabinBaggageInfo)?.cabinBaggageInfo ||
        baggageList.find((b) => b.baggageInfo?.toLowerCase().includes("cabin"))?.baggageInfo ||
        "7 Kg";

      const totalNetFare = fareFamily.totalNetFare || 0;
      const baseFare =
        fareFamily.totalBasetFare ||
        fareFamily.flightFares
          ?.filter((f) => f.fareTag?.toLowerCase() === "base")
          .reduce((sum, f) => sum + (f.amount || 0), 0) ||
        0;
      const taxFare =
        fareFamily.totalTaxFare ||
        fareFamily.flightFares
          ?.filter((f) => f.fareTag?.toLowerCase() === "tax")
          .reduce((sum, f) => sum + (f.amount || 0), 0) ||
        0;
      const publishedFare = fareFamily.publishedFare || totalNetFare;
      const seatInfo = fareFamily.segmentInfos?.[0]?.seatRemaining ?? 9;

      const depCity =
        (direction === "onward" ? params.fromAirport.city : params.toAirport.city) ||
        AIRPORT_CITIES[firstSeg.origin?.toUpperCase()] ||
        firstSeg.origin;

      const arrCity =
        (direction === "onward" ? params.toAirport.city : params.fromAirport.city) ||
        AIRPORT_CITIES[lastSeg.destination?.toUpperCase()] ||
        lastSeg.destination;

      const combinedFlightNo =
        segments.length > 1
          ? segments.map((s) => s.flightNumber).join(" / ")
          : `${carrier}-${firstSeg.flightNumber}`;

      const deterministicId = `${direction}:${fare.fareId}:${fareFamily.fareToken || Math.random().toString(36).substring(2)}`;

      const flightResult: NormalizedFlightResult = {
        id: deterministicId,
        direction: direction as "onward" | "return",
        fareId: fare.fareId,
        fareToken: fareFamily.fareToken,
        airlineCode: carrier,
        airlineName: getAirlineName(carrier),
        flightNumber: combinedFlightNo,
        fareType: fareFamily.fareType || "Publish",
        bookingClass: fareFamily.segmentInfos?.[0]?.bookingClass || "",
        departure: {
          code: firstSeg.origin,
          city: depCity,
          time: extractTime(firstSeg.departureDateTime),
          date: extractDate(firstSeg.departureDateTime),
          dateTime: firstSeg.departureDateTime,
          terminal: firstSeg.departureTerminal,
        },
        arrival: {
          code: lastSeg.destination,
          city: arrCity,
          time: extractTime(lastSeg.arrivalDateTime),
          date: extractDate(lastSeg.arrivalDateTime),
          dateTime: lastSeg.arrivalDateTime,
          terminal: lastSeg.arrivalTerminal,
        },
        duration: durationFormatted,
        durationMinutes,
        stops,
        stopDetails,
        segments,
        price: totalNetFare,
        baseFare,
        taxFare,
        publishedFare,
        currency: fareFamily.currency || "INR",
        class: params.travelClass || "economy",
        baggage: {
          cabin: cabinBaggage,
          checkin: checkinBaggage,
        },
        refundable: !!fareFamily.isRefundable,
        seatsAvailable: seatInfo,
        flightFares: fareFamily.flightFares || [],
        fareFamilies: [fareFamily],
        selectedFareFamily: fareFamily,
        originalFare: {
          fareId: fare.fareId,
          supplierName: fare.supplierName || "NotAssigned",
        },
      };

      if (direction === "return") {
        returnResults.push(flightResult);
      } else {
        onwardResults.push(flightResult);
      }
    }
  }

  // Diagnostic logging (Requirement 10)
  console.log("[FLIGHT SEARCH] Raw fares:", response.fares?.length);
  console.log("[FLIGHT SEARCH] Onward results:", onwardResults.length);
  console.log("[FLIGHT SEARCH] Return results:", returnResults.length);
  if (onwardResults.length > 0) {
    console.log("[FLIGHT SEARCH] Sample normalized result:", onwardResults[0]);
  }

  return {
    onwardResults,
    returnResults,
    traceId,
  };
}

/**
 * Performs a Flight Search against the Staging Consolidation AirSearch API.
 *
 * Endpoint: POST https://stagingflightapi.etravos.in/api/FlightConsolidation/AirSearch
 * Method: POST
 * Headers: Authorization: Bearer <flight_access_token>
 */
export async function searchFlights(
  params: FlightSearchParams,
  signal?: AbortSignal
): Promise<{
  onwardResults: NormalizedFlightResult[];
  returnResults: NormalizedFlightResult[];
  traceId: string;
  rawResponse: AirSearchResponse;
}> {
  // 1. Ensure valid Flight authentication token
  const token = await ensureFlightAuthentication();
  if (!token) {
    throw new Error("Unable to obtain valid Flight authorization token");
  }

  // 2. Build originDestinations array
  const fromCode = params.fromAirport.airportCode.toUpperCase();
  const toCode = params.toAirport.airportCode.toUpperCase();

  const originDestinations = [
    {
      departureDateTime: formatApiDateTime(params.departDate),
      origin: fromCode,
      destination: toCode,
      flightDateFlex: 0,
    },
  ];

  if (params.tripType === "roundTrip" && params.returnDate) {
    originDestinations.push({
      departureDateTime: formatApiDateTime(params.returnDate),
      origin: toCode,
      destination: fromCode,
      flightDateFlex: 0,
    });
  }

  const payload: AirSearchRequest = {
    originDestinations,
    adultCount: Math.max(1, params.passengers.adults),
    childCount: Math.max(0, params.passengers.children),
    infantCount: Math.max(0, params.passengers.infants),
    cabinClass: mapCabinClassToApi(params.travelClass),
    includeCarrier: null,
    excludeCarrier: null,
    stopOver: "None",
    airTravelType: params.tripType === "roundTrip" ? "roundTrip" : "oneWay",
    flightDateFlex: 0,
    itineraryViewType: "1",
    currencyCode: "INR",
    pnrType: "null",
    consolidationWaitTime: 0,
    traceId: "",
    isGroupingMapped: false,
  };

  const endpointUrl = `${FLIGHT_API_BASE_URL.replace(/\/+$/, "")}/api/FlightConsolidation/AirSearch`;

  if (process.env.NODE_ENV === "development") {
    console.log("[FLIGHT SEARCH] Request started");
    console.log("[FLIGHT SEARCH] Method: POST");
    console.log("[FLIGHT SEARCH] URL:", endpointUrl);
    console.log(
      `[FLIGHT SEARCH] Route: ${fromCode} -> ${toCode} (${params.tripType}) | Adults: ${payload.adultCount}, Children: ${payload.childCount}, Infants: ${payload.infantCount}`
    );
  }

  const startTime = Date.now();

  try {
    const { data: response, status } = await axios.post<AirSearchResponse>(
      endpointUrl,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 45000,
        signal,
      }
    );

    const elapsed = Date.now() - startTime;

    if (process.env.NODE_ENV === "development") {
      console.log(`[FLIGHT SEARCH] Request completed in ${elapsed}ms | Status: ${status}`);
    }

    if (!response || !response.fares) {
      console.warn("[FLIGHT SEARCH] Response has no fares array", response);
      return {
        onwardResults: [],
        returnResults: [],
        traceId: response?.traceId || "",
        rawResponse: response,
      };
    }

    // 3. Normalize & separate response
    const { onwardResults, returnResults, traceId } = normalizeAirSearchResponse(
      response,
      params
    );

    if (process.env.NODE_ENV === "development") {
      console.log(`[FLIGHT SEARCH] Raw Fares Count: ${response.fares.length}`);
      console.log(`[FLIGHT SEARCH] Onward Results Count: ${onwardResults.length}`);
      console.log(`[FLIGHT SEARCH] Return Results Count: ${returnResults.length}`);
    }

    return {
      onwardResults,
      returnResults,
      traceId,
      rawResponse: response,
    };
  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "CanceledError"
    ) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      console.error("[FLIGHT SEARCH] Request failed", {
        url: endpointUrl,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        durationMs: elapsed,
      });
      const serverMsg =
        (error.response?.data as any)?.message ||
        (error.response?.data as any)?.error ||
        error.message ||
        "Flight search failed. Please try again.";
      throw new Error(serverMsg);
    } else if (error instanceof Error) {
      console.error("[FLIGHT SEARCH] Error:", error.message);
      throw error;
    }
    throw new Error("An unexpected error occurred while searching for flights.");
  }
}
