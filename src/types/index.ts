// ============================================================
// Travel Platform - TypeScript Interfaces
// ============================================================

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departure: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  arrival: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  stopDetails?: string[];
  price: number;
  currency: string;
  class: "economy" | "premium_economy" | "business" | "first";
  seatsAvailable: number;
  baggage: {
    cabin: string;
    checkin: string;
  };
  refundable: boolean;
}

export interface Airport {
  airportCode: string;
  city: string;
  country: string;
  airportDesc: string;
  countryCode?: string;
  type?: string;
  showCity?: string;
  displayName?: string;
}

export interface FlightUserDetails {
  id: number;
  userName: string;
  role: number;
  memberShip: number;
  currency: string;
}

export interface FlightLoginResponse {
  tokenId: string;
  userDetails: FlightUserDetails;
}

// ============================================================
// Flight Consolidation AirSearch API Types
// ============================================================

export interface AirSearchOriginDestination {
  departureDateTime: string; // "YYYY-MM-DDT00:00:00"
  origin: string;
  destination: string;
  flightDateFlex?: number;
}

export interface AirSearchRequest {
  originDestinations: AirSearchOriginDestination[];
  adultCount: number;
  childCount: number;
  infantCount: number;
  cabinClass: string;
  includeCarrier?: string[] | null;
  excludeCarrier?: string[] | null;
  stopOver?: string;
  airTravelType: "oneWay" | "roundTrip";
  flightDateFlex?: number;
  itineraryViewType?: string;
  currencyCode?: string;
  pnrType?: string;
  consolidationWaitTime?: number;
  traceId?: string;
  isGroupingMapped?: boolean;
}

export interface AirSearchStopOverSegment {
  stopDepatureTime?: string;
  stopArrivalTime?: string;
  stopAirPortCode?: string;
  stopDuration?: string;
  stopGMTOffset?: string;
  stopEquipment?: string;
}

export interface AirSearchSegment {
  segId: string;
  isReturn: boolean;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  journeyDuration: string;
  flightNumber: string;
  operatingAirline: string;
  marketingAirline: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  stopOverSegments?: AirSearchStopOverSegment[];
}

export interface AirSearchFlightFare {
  paxType: "ADT" | "CHD" | "INF" | string;
  fareDescription?: string;
  amount: number;
  fareTag?: string;
  fareCode?: string;
}

export interface AirSearchFareRule {
  paxType: number;
  supplierParameter?: string;
}

export interface AirSearchBaggage {
  airline?: string;
  paxType: string;
  baggageInfo: string;
  cityPair: string;
  cabinBaggageInfo?: string;
}

export interface AirSearchSegmentInfo {
  cityPair: string;
  bookingClass?: string;
  seatRemaining?: number;
  cabinClass?: number | string;
  key: string;
}

export interface AirSearchFareFamily {
  purchaseType?: string;
  fareType?: string;
  coupanType?: string;
  currency: string;
  supplierParameter?: string;
  flightFares: AirSearchFlightFare[];
  fareRules?: AirSearchFareRule[];
  baggage: AirSearchBaggage[];
  segmentInfos: AirSearchSegmentInfo[];
  isRefundable: boolean;
  isGstMandatory: boolean;
  commission?: number;
  plb?: number;
  agentMarkup?: number;
  publishedFare?: number;
  adultNetFare?: number;
  childNetFare?: number;
  infantNetFare?: number;
  totalNetFare: number;
  totalTaxFare?: number;
  totalBasetFare?: number;
  fareToken: string;
}

export interface AirSearchFare {
  fareId: string;
  supplierName?: string;
  fareFamilies: AirSearchFareFamily[];
}

export interface AirSearchItineraryItem {
  validatingCarrier: string;
  segmentMapping: string[][];
  fareMapping: string;
  combinationId?: number;
  tokens?: string;
}

export interface AirSearchItineraries {
  mappingType?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  onward?: AirSearchItineraryItem[];
  return?: AirSearchItineraryItem[];
  combo?: AirSearchItineraryItem[];
}

export interface AirSearchResponse {
  traceId: string;
  fares: AirSearchFare[];
  segments: AirSearchSegment[];
  itineraries: AirSearchItineraries;
  isGroupingMapped?: boolean;
  status?: number | string;
}

// ============================================================
// Normalized / Application-Facing Flight Types
// ============================================================

export interface NormalizedFlightSegment {
  segId: string;
  origin: string;
  destination: string;
  originCity?: string;
  destinationCity?: string;
  departureDateTime: string;
  arrivalDateTime: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  durationMinutes: number;
  durationFormatted: string;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  bookingClass?: string;
  cabinClass?: string;
  seatsRemaining?: number;
}

export interface NormalizedFlightResult {
  id: string; // Unique deterministic ID: `${direction}:${fareId}:${fareToken}`
  direction: "onward" | "return";
  fareId: string;
  fareToken: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  fareType?: string;
  bookingClass?: string;
  departure: {
    code: string;
    city: string;
    time: string;
    date: string;
    dateTime: string;
    terminal?: string;
  };
  arrival: {
    code: string;
    city: string;
    time: string;
    date: string;
    dateTime: string;
    terminal?: string;
  };
  duration: string;
  durationMinutes: number;
  stops: number;
  stopDetails: string[];
  segments: NormalizedFlightSegment[];
  price: number; // totalNetFare
  baseFare: number;
  taxFare: number;
  publishedFare: number;
  currency: string;
  class: string;
  baggage: {
    cabin: string;
    checkin: string;
  };
  refundable: boolean;
  seatsAvailable: number;
  flightFares: AirSearchFlightFare[];
  fareFamilies: AirSearchFareFamily[];
  selectedFareFamily: AirSearchFareFamily;
  originalFare: AirSearchFare | { fareId: string; supplierName: string };
}

export interface FlightSearchParams {
  fromAirport: Airport;
  toAirport: Airport;
  departDate: string;
  returnDate?: string;
  tripType: "oneWay" | "roundTrip";
  passengers: PassengerCount;
  travelClass: string;
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  images: string[];
  location: {
    city: string;
    country: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  rating: number;
  reviewCount: number;
  starRating: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  roomTypes: RoomType[];
  checkIn: string;
  checkOut: string;
  description: string;
  cancellationPolicy: string;
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  available: boolean;
}

export interface BusBoardingPoint {
  id: string;
  name: string;
  time: string;
  address: string;
}

export interface BusPolicy {
  title: string;
  description: string;
}

export interface Bus {
  id: string;
  operator: string;
  operatorLogo: string;
  busType: "sleeper" | "semi_sleeper" | "seater" | "ac" | "non_ac";
  departure: {
    city: string;
    terminal: string;
    time: string;
    date: string;
  };
  arrival: {
    city: string;
    terminal: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  currency: string;
  seatsAvailable: number;
  amenities: string[];
  rating: number;
  reviewCount: number;
  boardingPoints: BusBoardingPoint[];
  droppingPoints: BusBoardingPoint[];
  policies: BusPolicy[];
  images: string[];
}

// ============================================================
// Seat Layout Types
// ============================================================

export type SeatStatus = "available" | "selected" | "booked" | "female-only" | "blocked";
export type SeatPosition = "window" | "aisle" | "middle";
export type DeckType = "upper" | "lower";
export type SeatType = "sleeper" | "semi_sleeper" | "seater";

export interface Seat {
  seatNo: string;
  status: SeatStatus;
  price: number;
  position: SeatPosition;
  row: number;
  col: number;
  deck: DeckType;
  seatType: SeatType;
}

export interface SeatDeck {
  deck: DeckType;
  rows: number;
  cols: number;
  seats: Seat[];
}

export interface BusSeatLayout {
  busId: string;
  layoutType: SeatType;
  totalSeats: number;
  availableSeats: number;
  decks: SeatDeck[];
}

export interface Activity {
  id: string;
  name: string;
  image: string;
  images: string[];
  location: {
    city: string;
    country: string;
    venue: string;
  };
  category: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  description: string;
  highlights: string[];
  includes: string[];
  availableDates: string[];
  maxGroupSize: number;
  difficulty: "easy" | "moderate" | "challenging";
}

export interface Package {
  id: string;
  name: string;
  image: string;
  images: string[];
  destination: {
    city: string;
    country: string;
  };
  duration: {
    nights: number;
    days: number;
  };
  price: number;
  originalPrice: number;
  currency: string;
  rating: number;
  reviewCount: number;
  description: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: ItineraryDay[];
  category: string;
  difficulty: "easy" | "moderate" | "adventure";
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  nationality: string;
  passport?: {
    number: string;
    expiry: string;
    country: string;
  };
  preferences: {
    currency: string;
    language: string;
    notifications: boolean;
  };
  savedTrips: string[];
  recentSearches: SearchQuery[];
}

export interface Booking {
  id: string;
  userId: string;
  type: "flight" | "hotel" | "bus" | "activity" | "package";
  status: "confirmed" | "pending" | "cancelled" | "completed";
  itemId: string;
  bookingDate: string;
  travelDate: string;
  travelers: Traveler[];
  totalAmount: number;
  currency: string;
  paymentStatus: "paid" | "pending" | "refunded";
  cancellationPolicy: string;
}

export interface Traveler {
  firstName: string;
  lastName: string;
  age: number;
  type: "adult" | "child" | "infant";
}

export interface SearchQuery {
  id: string;
  type: "flight" | "hotel" | "bus" | "activity" | "package";
  from?: string;
  to?: string;
  destination?: string;
  departDate: string;
  returnDate?: string;
  passengers: PassengerCount;
  class?: string;
  timestamp: string;
}

export interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}
