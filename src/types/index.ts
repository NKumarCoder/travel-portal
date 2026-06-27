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
