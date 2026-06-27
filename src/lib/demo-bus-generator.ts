import type { Bus, BusBoardingPoint, BusPolicy } from "@/types";

// ============================================================
// DEMO MODE FLAG
// Set to false when connecting to real API
// ============================================================
export const DEMO_MODE = true;

// ============================================================
// Operator Pool
// ============================================================
const OPERATORS = [
  "Orange Travels",
  "VRL Travels",
  "KSRTC Airavat",
  "SRS Travels",
  "KPN Travels",
  "IntrCity SmartBus",
  "Sharma Travels",
  "National Travels",
];

const BUS_TYPES: Bus["busType"][] = [
  "sleeper",
  "semi_sleeper",
  "ac",
  "seater",
  "non_ac",
];

const BUS_TYPE_LABELS: Record<string, string> = {
  sleeper: "AC Sleeper",
  semi_sleeper: "Semi Sleeper",
  ac: "Volvo Multi Axle",
  seater: "AC Seater",
  non_ac: "Non AC Sleeper",
};

const AMENITY_POOL = [
  "WiFi",
  "Charging Point",
  "Water Bottle",
  "Blanket",
  "GPS Tracking",
  "AC",
  "USB Charging",
  "Reclining Seats",
  "Reading Light",
  "Entertainment System",
  "Snacks",
  "Pillow",
  "Curtains",
  "Emergency Exit",
];

const POLICIES: BusPolicy[] = [
  { title: "Cancellation Policy", description: "Free cancellation up to 24 hours before departure. 50% refund between 12-24 hours. No refund within 12 hours." },
  { title: "Refund Policy", description: "Refunds are processed within 5-7 business days to the original payment method." },
  { title: "Luggage Policy", description: "Each passenger is allowed 1 bag (max 15kg) in the luggage compartment and 1 small handbag." },
  { title: "Reporting Time", description: "Please arrive at the boarding point 15 minutes before the scheduled departure time." },
];

// ============================================================
// Seeded random for deterministic-per-search results
// ============================================================
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// ============================================================
// Generator
// ============================================================
export function generateDemoBuses(source: string, destination: string): Bus[] {
  const seed = hashString(`${source.toLowerCase()}-${destination.toLowerCase()}`);
  const rand = createSeededRandom(seed);

  const count = 15 + Math.floor(rand() * 6); // 15-20 buses
  const buses: Bus[] = [];

  // Generate departure times spread across the day
  const baseHours = [
    "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
    "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
    "23:00", "23:30",
  ];

  for (let i = 0; i < count; i++) {
    const operator = OPERATORS[Math.floor(rand() * OPERATORS.length)];
    const busType = BUS_TYPES[Math.floor(rand() * BUS_TYPES.length)];
    const departureTime = baseHours[Math.floor(rand() * baseHours.length)];

    // Duration: 3-12 hours depending on "distance"
    const durationHours = 3 + Math.floor(rand() * 10);
    const durationMinutes = Math.floor(rand() * 4) * 15; // 0, 15, 30, 45
    const durationStr = durationMinutes > 0
      ? `${durationHours}h ${durationMinutes.toString().padStart(2, "0")}m`
      : `${durationHours}h 00m`;

    // Calculate arrival time
    const [depH, depM] = departureTime.split(":").map(Number);
    const totalMin = depH * 60 + depM + durationHours * 60 + durationMinutes;
    const arrH = Math.floor(totalMin / 60) % 24;
    const arrM = totalMin % 60;
    const arrivalTime = `${arrH.toString().padStart(2, "0")}:${arrM.toString().padStart(2, "0")}`;
    const nextDay = totalMin >= 1440;

    // Price: ₹499-₹2499
    const price = 499 + Math.floor(rand() * 2000);

    // Rating: 3.5-4.9
    const rating = parseFloat((3.5 + rand() * 1.4).toFixed(1));

    // Seats: 2-35
    const seatsAvailable = 2 + Math.floor(rand() * 34);

    // Amenities: pick 3-7
    const amenityCount = 3 + Math.floor(rand() * 5);
    const shuffled = [...AMENITY_POOL].sort(() => rand() - 0.5);
    const amenities = shuffled.slice(0, amenityCount);

    // Boarding points
    const boardingPoints: BusBoardingPoint[] = [
      { id: `bp-${i}-1`, name: `${source} Central`, time: departureTime, address: `${source} Central Bus Station, Platform ${Math.floor(rand() * 10) + 1}` },
      { id: `bp-${i}-2`, name: `${source} South`, time: addMinutes(departureTime, 20), address: `${source} South Terminal, Near Metro Station` },
      { id: `bp-${i}-3`, name: `${source} Ring Road`, time: addMinutes(departureTime, 40), address: `${source} Ring Road Toll Gate` },
    ];

    // Dropping points
    const droppingPoints: BusBoardingPoint[] = [
      { id: `dp-${i}-1`, name: `${destination} North`, time: addMinutes(arrivalTime, -30), address: `${destination} North Bus Stop` },
      { id: `dp-${i}-2`, name: `${destination} Central`, time: arrivalTime, address: `${destination} Central Bus Station` },
      { id: `dp-${i}-3`, name: `${destination} South`, time: addMinutes(arrivalTime, 15), address: `${destination} South Terminal` },
    ];

    const bus: Bus = {
      id: `demo-${seed}-${i}`,
      operator,
      operatorLogo: `/buses/${operator.toLowerCase().replace(/\s+/g, "")}.png`,
      busType,
      departure: {
        city: source,
        terminal: `${source} Bus Station`,
        time: departureTime,
        date: "2026-07-15",
      },
      arrival: {
        city: destination,
        terminal: `${destination} Bus Station`,
        time: arrivalTime,
        date: nextDay ? "2026-07-16" : "2026-07-15",
      },
      duration: durationStr,
      price,
      currency: "INR",
      seatsAvailable,
      amenities,
      rating,
      reviewCount: 100 + Math.floor(rand() * 3000),
      boardingPoints,
      droppingPoints,
      policies: POLICIES,
      images: [`/buses/demo-${i}.jpg`],
    };

    buses.push(bus);
  }

  // Sort by departure time for a natural ordering
  buses.sort((a, b) => a.departure.time.localeCompare(b.departure.time));

  return buses;
}

// ============================================================
// Helpers
// ============================================================
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = ((total % 1440) + 1440) % 1440;
  return `${Math.floor(newH / 60).toString().padStart(2, "0")}:${(newH % 60).toString().padStart(2, "0")}`;
}
