"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { HotelCard } from "@/components/travel/hotel-card";
import { SearchBox } from "@/components/ui/search-box";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/passenger-selector";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { useSearchStore } from "@/store/search-store";
import type { Hotel } from "@/types";
import hotelsData from "@/data/hotels.json";
import {
  Hotel as HotelIcon,
  Search,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Compass,
  Sparkles,
  MapPin,
  Building2,
  Waves,
  Trees,
  Award,
  Zap,
  ArrowRight,
} from "lucide-react";

// Popular Destination Discovery Data
const POPULAR_DESTINATIONS = [
  {
    name: "Bali",
    country: "Indonesia",
    tag: "Beach Resorts",
    stays: "1,240+ Stays",
    image: "/images/hotels/grand-horizon.png",
  },
  {
    name: "Tokyo",
    country: "Japan",
    tag: "City Centers",
    stays: "890+ Stays",
    image: "/images/hotels/urban-loft.png",
  },
  {
    name: "Interlaken",
    country: "Switzerland",
    tag: "Alpine Chalets",
    stays: "450+ Stays",
    image: "/images/hotels/mountain-lodge.png",
  },
  {
    name: "Goa",
    country: "India",
    tag: "Coastal Retreats",
    stays: "680+ Stays",
    image: "/images/destinations/goa.png",
  },
];

// Curated Stays Collections
const STAYS_COLLECTIONS = [
  {
    title: "Luxury Beach Resorts",
    subtitle: "Private villas, infinity pools & ocean views",
    tag: "Beachfront",
    image: "/images/hotels/grand-horizon.png",
  },
  {
    title: "Boutique City Stays",
    subtitle: "Modern lofts in prime downtown districts",
    tag: "Urban Living",
    image: "/images/hotels/urban-loft.png",
  },
  {
    title: "Alpine Mountain Lodges",
    subtitle: "Cozy chalets with panoramic valley views",
    tag: "Nature & Ski",
    image: "/images/hotels/mountain-lodge.png",
  },
  {
    title: "Heritage & Wellness Retreats",
    subtitle: "Historic estates & soothing spa sanctuaries",
    tag: "Wellness",
    image: "/images/destinations/goa.png",
  },
];

import { useRouter } from "next/navigation";

export default function HotelsPage() {
  const router = useRouter();
  const {
    destination,
    departDate,
    returnDate,
    passengers,
    setDestination,
    setDepartDate,
    setReturnDate,
    setPassengers,
    setHasSearched,
  } = useSearchStore();

  const [hotels, setHotels] = React.useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHotels(hotelsData as Hotel[]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    setHasSearched(true);
    router.push("/hotels/search");
  };

  const handleDestinationChip = (destName: string) => {
    setDestination(destName);
    setHasSearched(true);
    router.push("/hotels/search");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* ===== 1. Cinematic Full-Width Hotel Hero Section ===== */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-between">
        {/* Background Image: Cinematic 4K Hotel Photography */}
        <div
          className="absolute inset-0 bg-cover bg-right lg:bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url('/images/hero-hotel-cinematic.png')` }}
        />

        {/* Subtle Balanced Ambient Overlay for Uniform Image Brightness & Text Readability */}
        <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />

        {/* Hero Content Area */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 sm:pt-12 sm:pb-24 lg:pt-14 lg:pb-28 w-full flex-1 flex flex-col justify-center">
          <div className="max-w-xl">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Stay Somewhere <br />
              <span className="text-white">Extraordinary</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 text-xs sm:text-sm text-slate-200 max-w-md leading-relaxed font-medium">
              Discover luxury resorts, boutique city stays, and cozy lodges at unbeatable rates with verified reviews.
            </p>

            {/* Trust Indicators */}
            <div className="mt-4 flex flex-wrap items-center gap-3.5 text-xs font-semibold text-slate-200 sm:gap-5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Verified Stays</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Best Rate Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>24/7 Concierge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. Floating White Search Surface (Single Row Desktop) ===== */}
      <section className="-mt-16 sm:-mt-20 lg:-mt-24 relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xl shadow-slate-950/15">
          {/* Desktop Form Layout */}
          <div className="hidden items-end gap-3 lg:flex">
            <div className="flex-[2]">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Destination or Hotel
              </label>
              <SearchBox
                value={destination}
                onChange={setDestination}
                placeholder="Where are you going? (e.g. Bali, Tokyo)"
              />
            </div>

            <div className="w-44">
              <DatePicker label="Check-in" value={departDate} onChange={setDepartDate} />
            </div>

            <div className="w-44">
              <DatePicker
                label="Check-out"
                value={returnDate}
                onChange={setReturnDate}
                minDate={departDate}
              />
            </div>

            <div className="w-48">
              <PassengerSelector value={passengers} onChange={setPassengers} />
            </div>

            <Button
              onClick={handleSearch}
              className="h-10 gap-2 px-7 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Search Hotels
            </Button>
          </div>

          {/* Mobile Form Layout */}
          <div className="space-y-3 lg:hidden">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Destination or Hotel
              </label>
              <SearchBox
                value={destination}
                onChange={setDestination}
                placeholder="Where are you going?"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <DatePicker label="Check-in" value={departDate} onChange={setDepartDate} />
              <DatePicker
                label="Check-out"
                value={returnDate}
                onChange={setReturnDate}
                minDate={departDate}
              />
            </div>

            <PassengerSelector value={passengers} onChange={setPassengers} />

            <Button
              onClick={handleSearch}
              className="h-10 w-full gap-2 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Search Hotels
            </Button>
          </div>
        </div>

        {/* ===== Popular Destination Chips ===== */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 tracking-wide mr-1 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            Popular destinations:
          </span>
          {["Bali", "Tokyo", "Interlaken", "Goa", "Dubai"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleDestinationChip(city)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-0.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all duration-150 cursor-pointer",
                destination === city && "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
              )}
            >
              <span>{city}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== Main Page Discovery Content ===== */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="space-y-12 sm:space-y-14">
          {/* ===== 3. Popular Destinations Grid ===== */}
          <section>
            <div className="mb-5 flex items-end justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Popular Destinations
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Explore top-rated stays in places travelers love
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleDestinationChip(dest.name)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 text-left cursor-pointer h-48"
                >
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-emerald-300 bg-slate-950/60 border border-emerald-400/30 px-2 py-0.5 rounded-full mb-1">
                      {dest.tag}
                    </span>
                    <h3 className="text-base font-extrabold">{dest.name}</h3>
                    <p className="text-xs text-slate-200 flex items-center justify-between font-medium mt-0.5">
                      <span>{dest.country}</span>
                      <span className="text-emerald-400 font-bold">{dest.stays}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ===== 4. Curated Hotel Collections ("Stay Your Way") ===== */}
          <section>
            <div className="mb-5 flex items-end justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Stay Your Way
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Curated hotel collections for every travel style
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STAYS_COLLECTIONS.map((collection) => (
                <div
                  key={collection.title}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="280px"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs">
                        {collection.tag}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                      {collection.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== 5. Featured Hotel Property Stays ===== */}
          <section>
            <div className="mb-5 flex items-end justify-between border-b border-slate-200/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Featured Hotel Stays
                  </h2>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {hotels.length} verified property stays available
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} onSelect={() => {}} />
                ))}
              </div>
            )}
          </section>

          {/* ===== 6. Why Book Hotels With Opti Travel (Travel Confidence Section) ===== */}
          <section className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 sm:p-10 shadow-xs relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 mb-8 text-center max-w-2xl mx-auto">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-2.5">
                Book With Confidence
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl tracking-tight">
                Why Book Hotels with Opti Travel
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Enjoy peace of mind with guaranteed rates, verified property reviews, and round-the-clock guest support
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Verified Properties
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Every property is personally audited for quality, cleanliness, and safety standards.
                </p>
              </div>

              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Instant Confirmation
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Immediate booking vouchers sent directly to your phone and email without waiting.
                </p>
              </div>

              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Best Rate Guarantee
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Transparent room rates with zero hidden resort fees or surprise checkout surcharges.
                </p>
              </div>

              <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                  <Headphones className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  24/7 Concierge
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                  Dedicated guest support team available round-the-clock to assist with your stay.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

