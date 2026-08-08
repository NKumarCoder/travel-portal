"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SearchBox } from "@/components/ui/search-box";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "@/store/search-store";
import {
  Plane,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Compass,
  Sparkles,
  MapPin,
  Award,
  Zap,
  ArrowRight,
  Globe,
} from "lucide-react";

// Popular Flight Routes Data
const POPULAR_FLIGHT_ROUTES = [
  {
    fromCity: "New York",
    fromCode: "JFK",
    toCity: "London",
    toCode: "LHR",
    airline: "SkyWings Airlines",
    flightNo: "SW-142",
    duration: "7h 15m",
    type: "Non-stop",
    image: "/images/destinations/hyderabad.png",
  },
  {
    fromCity: "San Francisco",
    fromCode: "SFO",
    toCity: "Tokyo",
    toCode: "NRT",
    airline: "Pacific Air",
    flightNo: "PA-304",
    duration: "11h 30m",
    type: "1 Stop",
    image: "/images/destinations/bangalore.png",
  },
  {
    fromCity: "Dubai",
    fromCode: "DXB",
    toCity: "Singapore",
    toCode: "SIN",
    airline: "Emirates",
    flightNo: "EK-201",
    duration: "7h 45m",
    type: "Non-stop",
    image: "/images/destinations/goa.png",
  },
  {
    fromCity: "Los Angeles",
    fromCode: "LAX",
    toCity: "Paris",
    toCode: "CDG",
    airline: "AeroConnect",
    flightNo: "AC-589",
    duration: "10h 45m",
    type: "Non-stop",
    image: "/images/destinations/chennai.png",
  },
];

export default function FlightsLandingPage() {
  const router = useRouter();
  const {
    from,
    to,
    departDate,
    passengers,
    travelClass,
    setFrom,
    setTo,
    setDepartDate,
    setPassengers,
    setTravelClass,
    swapFromTo,
    setHasSearched,
  } = useSearchStore();

  const handleSearch = () => {
    setHasSearched(true);
    router.push("/flights/search");
  };

  const handleQuickDestination = (destCity: string) => {
    setTo(destCity);
    setHasSearched(true);
    router.push("/flights/search");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* ===== 1. Cinematic Full-Width Flight Hero Section ===== */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-between">
        {/* Background Image: Cinematic Aviation Photography */}
        <div
          className="absolute inset-0 bg-cover bg-right lg:bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url('/images/hero-flight-cinematic.png')` }}
        />

        {/* Subtle Balanced Ambient Overlay for Uniform Image Brightness & Text Readability */}
        <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />

        {/* Hero Content Area */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 sm:pt-12 sm:pb-24 lg:pt-14 lg:pb-28 w-full flex-1 flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Fly Further. <br />
              <span className="text-emerald-400">Travel Smarter.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 text-xs sm:text-sm text-slate-200 max-w-md leading-relaxed font-medium">
              Discover great flights, compare fares, and travel with confidence across world-class airlines.
            </p>

            {/* Trust Indicators */}
            <div className="mt-4 flex flex-wrap items-center gap-3.5 text-xs font-semibold text-slate-200 sm:gap-5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Trusted Airlines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Secure Booking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Best Fare Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. Floating White Search Surface ===== */}
      <section className="-mt-16 sm:-mt-20 lg:-mt-24 relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xl shadow-slate-950/15">
          {/* Desktop Form Layout */}
          <div className="hidden items-end gap-2.5 lg:flex">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                From
              </label>
              <SearchBox
                value={from}
                onChange={setFrom}
                placeholder="From (city or airport)"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={swapFromTo}
              aria-label="Swap origin and destination"
              className="h-10 w-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0 mb-0.5"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                To
              </label>
              <SearchBox
                value={to}
                onChange={setTo}
                placeholder="To (city or airport)"
              />
            </div>

            <div className="w-40">
              <DatePicker label="Departure" value={departDate} onChange={setDepartDate} />
            </div>

            <div className="w-44">
              <PassengerSelector value={passengers} onChange={setPassengers} />
            </div>

            <div className="w-36">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Cabin Class
              </label>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 shadow-2xs hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Econ</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>

            <Button
              onClick={handleSearch}
              className="h-10 gap-2 px-6 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer shrink-0"
            >
              <Search className="h-4 w-4" />
              Search Flights
            </Button>
          </div>

          {/* Mobile Form Layout */}
          <div className="space-y-3 lg:hidden">
            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">From</label>
                <SearchBox value={from} onChange={setFrom} placeholder="From (city or airport)" />
              </div>
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={swapFromTo} className="gap-1.5 text-xs text-slate-600">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>Swap</span>
                </Button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">To</label>
                <SearchBox value={to} onChange={setTo} placeholder="To (city or airport)" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <DatePicker label="Departure" value={departDate} onChange={setDepartDate} />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Cabin Class</label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900 shadow-2xs"
                >
                  <option value="economy">Economy</option>
                  <option value="premium_economy">Premium Econ</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            <PassengerSelector value={passengers} onChange={setPassengers} />

            <Button
              onClick={handleSearch}
              className="h-10 w-full gap-2 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Search Flights
            </Button>
          </div>
        </div>

        {/* ===== Quick Select Popular Destination Chips ===== */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 tracking-wide mr-1 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            Popular destinations:
          </span>
          {["London", "Tokyo", "Singapore", "Paris", "Dubai"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleQuickDestination(city)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-0.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all duration-150 cursor-pointer",
                to === city && "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
              )}
            >
              <span>{city}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== 3. Popular Flight Routes Discovery Section ===== */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="space-y-12 sm:space-y-14">
          <section>
            <div className="mb-5 flex items-end justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Popular Flight Routes
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Explore top international and domestic flight connections
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR_FLIGHT_ROUTES.map((route) => (
                <button
                  key={`${route.fromCode}-${route.toCode}`}
                  type="button"
                  onClick={() => {
                    setFrom(route.fromCity);
                    setTo(route.toCity);
                    setHasSearched(true);
                    router.push("/flights/search");
                  }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 text-left cursor-pointer"
                >
                  <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <Image
                      src={route.image}
                      alt={route.toCity}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="280px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-extrabold">
                      <span>{route.fromCode}</span>
                      <Plane className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{route.toCode}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                      <span>
                        {route.fromCity} to {route.toCity}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 font-medium flex items-center justify-between">
                      <span>{route.airline}</span>
                      <span className="text-emerald-700 font-bold">{route.type}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ===== 4. Why Book Flights With Opti Travel (Travel Confidence Section) ===== */}
          <section className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 sm:p-10 shadow-xs relative overflow-hidden">
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 mb-8 text-center max-w-2xl mx-auto">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-2.5">
                Fly With Confidence
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl tracking-tight">
                Why Book Flights with Opti Travel
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Experience seamless air travel booking with best fare guarantees, instant e-tickets, and 24/7 dedicated support
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Best Fare Guarantee
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Transparent flight pricing with zero hidden surcharges or surprise booking fees.
                </p>
              </div>

              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Instant E-Tickets
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Immediate flight confirmations and mobile boarding passes delivered straight to your inbox.
                </p>
              </div>

              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Trusted World Airlines
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Direct partnerships with top global airlines offering reliable schedules and safety.
                </p>
              </div>

              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <Headphones className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  24/7 Flight Support
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Round-the-clock concierge team available for schedule updates, cancellations, or seats.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
