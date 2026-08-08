"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/store/search-store";
import { useBusFilterStore } from "@/store/bus-filter-store";
import { useRouter } from "next/navigation";
import type { City } from "@/services/cityService";
import {
  ArrowRightLeft,
  Bus as BusIcon,
  Search,
  Clock,
  ShieldCheck,
  Zap,
  Headphones,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Compass,
} from "lucide-react";

// Mock data for Popular Routes (Preserved)
const POPULAR_ROUTES = [
  {
    from: { name: "Vijayawada", code: "VJA", type: "city", state: "Andhra Pradesh" },
    to: { name: "Hyderabad", code: "HYD", type: "city", state: "Telangana" },
    duration: "5h 30m",
    price: 599,
    tag: "Popular",
  },
  {
    from: { name: "Bangalore", code: "BLR", type: "city", state: "Karnataka" },
    to: { name: "Hyderabad", code: "HYD", type: "city", state: "Telangana" },
    duration: "8h 00m",
    price: 899,
    tag: "Top Route",
  },
  {
    from: { name: "Chennai", code: "MAA", type: "city", state: "Tamil Nadu" },
    to: { name: "Bangalore", code: "BLR", type: "city", state: "Karnataka" },
    duration: "6h 30m",
    price: 499,
    tag: "Frequent",
  },
  {
    from: { name: "Visakhapatnam", code: "VTZ", type: "city", state: "Andhra Pradesh" },
    to: { name: "Vijayawada", code: "VJA", type: "city", state: "Andhra Pradesh" },
    duration: "6h 00m",
    price: 499,
    tag: "Daily",
  },
];

// Mock data for Highly Booked Routes (Preserved)
const HIGHLY_BOOKED_ROUTES = [
  {
    from: { name: "Hyderabad", code: "HYD", type: "city", state: "Telangana" },
    to: { name: "Bangalore", code: "BLR", type: "city", state: "Karnataka" },
    duration: "9h 00m",
    price: 999,
    tag: "98% Booked",
  },
  {
    from: { name: "Bangalore", code: "BLR", type: "city", state: "Karnataka" },
    to: { name: "Goa", code: "GOI", type: "city", state: "Goa" },
    duration: "11h 30m",
    price: 1199,
    tag: "Weekend Favorite",
  },
  {
    from: { name: "Hyderabad", code: "HYD", type: "city", state: "Telangana" },
    to: { name: "Vijayawada", code: "VJA", type: "city", state: "Andhra Pradesh" },
    duration: "5h 15m",
    price: 599,
    tag: "Sold Out Fast",
  },
  {
    from: { name: "Pune", code: "PNQ", type: "city", state: "Maharashtra" },
    to: { name: "Goa", code: "GOI", type: "city", state: "Goa" },
    duration: "9h 30m",
    price: 850,
    tag: "High Demand",
  },
];

export default function BusesPage() {
  const router = useRouter();

  const {
    fromCity,
    toCity,
    departDate,
    passengers,
    setFromCity,
    setToCity,
    setDepartDate,
    setPassengers,
    setHasSearched,
    swapFromTo,
  } = useSearchStore();

  const { resetFilters } = useBusFilterStore();

  // Reset search context on landing page so results are never shown here
  React.useEffect(() => {
    setHasSearched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    if (!fromCity || !toCity || !departDate) return;
    resetFilters();
    setHasSearched(true);
    router.push("/buses/search");
  };

  const handleRouteClick = (fromCityObj: City, toCityObj: City) => {
    setFromCity(fromCityObj);
    setToCity(toCityObj);

    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setDepartDate(dateStr);

    resetFilters();
    setHasSearched(true);
    router.push("/buses/search");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* ===== 1. Cinematic Full-Width Bus Hero Section (First-Viewport Optimized) ===== */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-between">
        {/* Background Image: Cinematic 4K Bus Photography */}
        <div 
          className="absolute inset-0 bg-cover bg-right lg:bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url('/images/hero-bus-cinematic.png')` }}
        />

        {/* Subtle Balanced Ambient Overlay for Uniform Image Brightness & Text Readability */}
        <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />

        {/* Hero Content Area */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 sm:pt-12 sm:pb-24 lg:pt-14 lg:pb-28 w-full flex-1 flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your Journey, <br />
              <span className="text-white">Our Priority</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 text-xs sm:text-sm text-slate-200 max-w-md leading-relaxed font-medium">
              Book bus tickets to thousands of destinations with trusted operators at unbeatable prices.
            </p>

            {/* Trust Indicators */}
            <div className="mt-4 flex flex-wrap items-center gap-3.5 text-xs font-semibold text-slate-200 sm:gap-5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Verified Operators</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Secure Booking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. Floating White Search Surface (Upward Offset & Compacted) ===== */}
      <section className="-mt-16 sm:-mt-20 lg:-mt-24 relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xl shadow-slate-950/15">
          {/* Desktop Form Layout (No Tab Header - Direct Search Inputs) */}
          <div className="hidden items-end gap-3 lg:flex">
            {/* From -> To Connected Container */}
            <div className="flex-[2] flex items-end gap-2 bg-slate-50/80 p-2 rounded-xl border border-slate-200/80">
              <div className="flex-1">
                <CityAutocomplete
                  label="From"
                  value={fromCity}
                  onSelect={setFromCity}
                  placeholder="Enter source city"
                />
              </div>

              <div className="flex items-center pb-0.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapFromTo}
                  aria-label="Swap source and destination"
                  className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200 shadow-xs active:rotate-180 cursor-pointer"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <CityAutocomplete
                  label="To"
                  value={toCity}
                  onSelect={setToCity}
                  placeholder="Enter destination city"
                />
              </div>
            </div>

            <div className="w-44">
              <DatePicker
                label="Journey Date"
                value={departDate}
                onChange={setDepartDate}
                minDate={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="w-44">
              <PassengerSelector value={passengers} onChange={setPassengers} />
            </div>

            <Button
              onClick={handleSearch}
              className="h-11 gap-2 px-7 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer"
              disabled={!fromCity || !toCity || !departDate}
            >
              <Search className="h-4 w-4" />
              Search Buses
            </Button>
          </div>

          {/* Mobile Form Layout */}
          <div className="space-y-3 lg:hidden">
            <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <CityAutocomplete
                label="From"
                value={fromCity}
                onSelect={setFromCity}
                placeholder="Enter source city"
              />

              <div className="flex justify-center -my-1 relative z-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapFromTo}
                  aria-label="Swap source and destination"
                  className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-600 shadow-md hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </Button>
              </div>

              <CityAutocomplete
                label="To"
                value={toCity}
                onSelect={setToCity}
                placeholder="Enter destination city"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <DatePicker
                label="Journey Date"
                value={departDate}
                onChange={setDepartDate}
                minDate={new Date().toISOString().split("T")[0]}
              />
              <PassengerSelector value={passengers} onChange={setPassengers} />
            </div>

            <Button
              onClick={handleSearch}
              className="h-10 w-full gap-2 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
              disabled={!fromCity || !toCity || !departDate}
            >
              <Search className="h-4 w-4" />
              Search Buses
            </Button>
          </div>
        </div>

        {/* ===== 3. Popular journeys Chips Area ===== */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 tracking-wide mr-1 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            Popular journeys:
          </span>
          {POPULAR_ROUTES.map((r) => (
            <button
              key={`chip-${r.from.code}-${r.to.code}`}
              type="button"
              onClick={() => handleRouteClick(r.from, r.to)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-0.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all duration-150 cursor-pointer"
            >
              <span>{r.from.name}</span>
              <span className="text-slate-400">→</span>
              <span>{r.to.name}</span>
              <span className="font-semibold text-emerald-600 ml-0.5">₹{r.price}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== Main Content Area ===== */}
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="space-y-12 sm:space-y-14">
          {/* ===== 4. Popular Bus Routes ===== */}
          <section>
            <div className="mb-5 flex items-end justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Popular Bus Routes
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Most travelled routes connecting major metropolitan hubs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR_ROUTES.map((route) => (
                <PopularRouteCard
                  key={`popular-${route.from.code}-${route.to.code}`}
                  route={route}
                  onClick={() => handleRouteClick(route.from, route.to)}
                />
              ))}
            </div>
          </section>

          {/* ===== 5. Highly Booked Routes ===== */}
          <section>
            <div className="mb-5 flex items-end justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Highly Booked Routes
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  High demand routes with maximum passenger bookings
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HIGHLY_BOOKED_ROUTES.map((route) => (
                <HighlyBookedRouteCard
                  key={`booked-${route.from.code}-${route.to.code}`}
                  route={route}
                  onClick={() => handleRouteClick(route.from, route.to)}
                />
              ))}
            </div>
          </section>

          {/* ===== 6. Why Book Buses With Opti Travel (Travel Confidence Section) ===== */}
          <section className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 sm:p-10 shadow-xs relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 mb-8 text-center max-w-2xl mx-auto">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-2.5">
                Travel With Confidence
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl tracking-tight">
                Why Book Buses with Opti Travel
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Enjoy seamless intercity travel with industry-leading booking protection and customer care
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ValuePropCard
                icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
                badgeBg="bg-emerald-50 border-emerald-100"
                title="Instant Refund Protection"
                description="Hassle-free 100% automated refunds on eligible ticket cancellations."
              />
              <ValuePropCard
                icon={<Zap className="h-5 w-5 text-blue-600" />}
                badgeBg="bg-blue-50 border-blue-100"
                title="Real-Time GPS Tracking"
                description="Live bus location tracking and automated boarding point notification alerts."
              />
              <ValuePropCard
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                badgeBg="bg-emerald-50 border-emerald-100"
                title="Guaranteed Lowest Fare"
                description="Transparent pricing with zero hidden convenience charges or surprise fees."
              />
              <ValuePropCard
                icon={<Headphones className="h-5 w-5 text-blue-600" />}
                badgeBg="bg-blue-50 border-blue-100"
                title="24/7 Priority Support"
                description="Dedicated customer support team available round-the-clock for any query."
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import Image from "next/image";

// Destination Photography Mapping
const DESTINATION_IMAGES: Record<string, string> = {
  Hyderabad: "/images/destinations/hyderabad.png",
  Bangalore: "/images/destinations/bangalore.png",
  Vijayawada: "/images/destinations/vijayawada.png",
  Chennai: "/images/destinations/chennai.png",
  Visakhapatnam: "/images/destinations/visakhapatnam.png",
  Goa: "/images/destinations/goa.png",
  Pune: "/images/destinations/pune.png",
};

// ===== Popular Route Card Component =====
interface RouteCardProps {
  route: typeof POPULAR_ROUTES[number];
  onClick: () => void;
}

function PopularRouteCard({ route, onClick }: RouteCardProps) {
  const destImage = DESTINATION_IMAGES[route.to.name] || DESTINATION_IMAGES[route.from.name];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col justify-between text-left rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer w-full"
    >
      <div>
        {/* Header: Destination Thumbnail + Tag */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {destImage && (
              <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs">
                <Image
                  src={destImage}
                  alt={route.to.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="48px"
                />
              </div>
            )}
            <div className="min-w-0">
              <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-full mb-1">
                {route.tag}
              </span>
              <p className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                {route.from.name} → {route.to.name}
              </p>
            </div>
          </div>
        </div>

        {/* Duration & Bus Type */}
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium pl-0.5">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{route.duration}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">AC Sleeper</span>
        </p>
      </div>

      {/* Divider & Starting Price */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">Starting from</span>
        <span className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
          ₹{route.price}
        </span>
      </div>
    </button>
  );
}

// ===== Highly Booked Route Card Component =====
function HighlyBookedRouteCard({ route, onClick }: RouteCardProps) {
  const destImage = DESTINATION_IMAGES[route.to.name] || DESTINATION_IMAGES[route.from.name];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col justify-between text-left rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 cursor-pointer w-full relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 opacity-80" />

      <div>
        {/* Header: Destination Thumbnail + Demand Badge */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {destImage && (
              <div className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs">
                <Image
                  src={destImage}
                  alt={route.to.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="48px"
                />
              </div>
            )}
            <div className="min-w-0">
              <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full mb-1">
                {route.tag}
              </span>
              <p className="text-sm font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                {route.from.name} → {route.to.name}
              </p>
            </div>
          </div>
        </div>

        {/* Duration & Bus Type */}
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium pl-0.5">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{route.duration}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">Express AC</span>
        </p>
      </div>

      {/* Divider & Starting Price */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">Starting from</span>
        <span className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
          ₹{route.price}
        </span>
      </div>
    </button>
  );
}

// ===== Value Proposition Card Component =====
function ValuePropCard({
  icon,
  badgeBg = "bg-emerald-50 border-emerald-100",
  title,
  description,
}: {
  icon: React.ReactNode;
  badgeBg?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
      <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105", badgeBg)}>
        {icon}
      </div>
      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
}




