"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchBox } from "@/components/ui/search-box";
import { Button } from "@/components/ui/button";
import { ComingSoonModal, type ComingSoonServiceType } from "@/components/common/coming-soon-modal";
import { cn } from "@/lib/utils";
import {
  Plane,
  Hotel,
  Bus,
  Compass,
  Package,
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  Headphones,
  Star,
  CheckCircle2,
  Globe,
} from "lucide-react";

// Category Services Configuration
const CATEGORY_SERVICES = [
  {
    id: "flights",
    href: "/flights",
    label: "Flights",
    description: "Search & compare global flights",
    icon: Plane,
    isComingSoon: false,
  },
  {
    id: "hotels",
    href: "/hotels",
    label: "Hotels",
    description: "Luxury resorts & boutique stays",
    icon: Hotel,
    isComingSoon: false,
  },
  {
    id: "buses",
    href: "/buses",
    label: "Buses",
    description: "Intercity express coaches",
    icon: Bus,
    isComingSoon: false,
  },
  {
    id: "activities",
    href: "/activities",
    label: "Activities",
    description: "Tours & outdoor experiences",
    icon: Compass,
    isComingSoon: true,
  },
  {
    id: "packages",
    href: "/packages",
    label: "Packages",
    description: "Curated vacation bundles",
    icon: Package,
    isComingSoon: true,
  },
  {
    id: "ai-planner",
    href: "/ai-planner",
    label: "AI Planner",
    description: "Intelligent trip itineraries",
    icon: Sparkles,
    isComingSoon: true,
  },
];

// Curated Popular Destinations with Photorealistic Assets
const POPULAR_DESTINATIONS = [
  {
    name: "Hyderabad, India",
    tagline: "Heritage & Modern Hub",
    rating: 4.9,
    price: "$120",
    image: "/images/destinations/hyderabad.png",
  },
  {
    name: "Bangalore, India",
    tagline: "Garden City & Tech Hub",
    rating: 4.8,
    price: "$140",
    image: "/images/destinations/bangalore.png",
  },
  {
    name: "Goa, India",
    tagline: "Tropical Beaches & Culture",
    rating: 4.9,
    price: "$195",
    image: "/images/destinations/goa.png",
  },
  {
    name: "Chennai, India",
    tagline: "Coastal Heritage & Arts",
    rating: 4.7,
    price: "$115",
    image: "/images/destinations/chennai.png",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [comingSoonService, setComingSoonService] = React.useState<ComingSoonServiceType>(null);

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    // Default search routing to flights or buses search
    router.push("/flights/search");
  };

  const handleCategoryClick = (
    e: React.MouseEvent,
    service: (typeof CATEGORY_SERVICES)[number]
  ) => {
    if (service.isComingSoon) {
      e.preventDefault();
      setComingSoonService(service.label as ComingSoonServiceType);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        {/* ===== 1. Hero Section ===== */}
        <section className="relative overflow-hidden bg-slate-950 text-white min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-between">
          {/* Background Image: Finalized TravelAI Hero Photography */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{ backgroundImage: `url('/images/home-page.png')` }}
          />

          {/* Subtle Balanced Ambient Overlay for Uniform Image Brightness & Text Readability */}
          <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />

          {/* Hero Copy Content */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 pt-14 pb-20 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8 text-center w-full flex-1 flex flex-col justify-center items-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Travel Smarter <span className="text-emerald-400">with AI</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed font-medium">
              Plan your perfect trip with AI-powered recommendations. Compare flights, book luxury hotels, reserve express buses, and explore experiences — all in one place.
            </p>

            {/* Feature Chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Multi-Service Search</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Secure Booking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 2. Hero Search Surface ===== */}
        <section className="-mt-14 sm:-mt-16 relative z-20 mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xl shadow-slate-950/15">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex-1 w-full">
                <SearchBox
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Where do you want to go? (e.g. London, Bali, Tokyo...)"
                />
              </div>
              <Button
                onClick={handleSearchSubmit}
                className="w-full sm:w-auto h-10 gap-2 px-6 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all duration-200 cursor-pointer shrink-0"
              >
                <Search className="h-4 w-4" />
                <span>Search All</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ===== 3. Explore by Category Section ===== */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-16">
          <div className="space-y-12 sm:space-y-16">
            <section>
              <div className="mb-6 flex items-end justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Globe className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl tracking-tight">
                      Explore Travel Services
                    </h2>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 font-medium">
                    Select a travel service to start your journey
                  </p>
                </div>
              </div>

              {/* 6 Category Cards Grid */}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
                {CATEGORY_SERVICES.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.id}
                      href={service.href}
                      onClick={(e) => handleCategoryClick(e, service)}
                      className={cn(
                        "group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 text-left cursor-pointer",
                        service.isComingSoon && "hover:border-slate-300"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
                            <Icon className="h-5 w-5" />
                          </div>
                          {service.isComingSoon && (
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 border border-emerald-200/90 px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                              SOON
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                          <span>{service.label}</span>
                          {!service.isComingSoon && (
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                          )}
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ===== 4. Popular Destinations Section ===== */}
            <section>
              <div className="mb-6 flex items-end justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl tracking-tight">
                    Popular Destinations
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 font-medium">
                    Handpicked destinations for your next vacation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <div
                    key={dest.name}
                    onClick={() => router.push("/hotels/search")}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="280px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-extrabold">
                        <span>{dest.name}</span>
                        <div className="flex items-center gap-1 bg-slate-950/70 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{dest.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{dest.tagline}</span>
                      <span className="text-xs font-extrabold text-emerald-700">From {dest.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== 5. Why Choose TravelAI (Travel Benefits Section) ===== */}
            <section className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 sm:p-10 shadow-xs relative overflow-hidden">
              {/* Ambient Glows */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

              <div className="relative z-10 mb-8 text-center max-w-2xl mx-auto">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-2.5">
                  Trusted Travel Platform
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl tracking-tight">
                  Why Book with TravelAI
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Enjoy intelligent recommendations, guaranteed best fares, and 24/7 dedicated travel concierge support
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Best Price Guarantee
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                    Get competitive rates across flights, hotels, and intercity buses with zero hidden fees.
                  </p>
                </div>

                <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Secure Instant Booking
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                    Protected payment transactions with instant e-ticket and hotel reservation confirmation.
                  </p>
                </div>

                <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    24/7 Travel Support
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                    Round-the-clock assistance for schedule changes, seat upgrades, or booking inquiries.
                  </p>
                </div>

                <div className="flex flex-col items-start p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 group">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-2xs transition-transform duration-200 group-hover:scale-105">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Trusted Network
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">
                    Partnered with verified global airlines, top luxury resorts, and premium bus operators.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* ===== 6. Global Application Footer ===== */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand Info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                  <Compass className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">TravelAI</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
                AI-powered travel planning for modern explorers. Book flights, luxury hotels, and express buses seamlessly in one platform.
              </p>
            </div>

            {/* Products */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Products</h4>
              <ul className="space-y-1.5 font-medium">
                <li><Link href="/flights" className="hover:text-white transition-colors">Flights</Link></li>
                <li><Link href="/hotels" className="hover:text-white transition-colors">Hotels</Link></li>
                <li><Link href="/buses" className="hover:text-white transition-colors">Buses</Link></li>
                <li><span className="text-slate-500">Activities (Soon)</span></li>
                <li><span className="text-slate-500">Packages (Soon)</span></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-1.5 font-medium">
                <li><span className="hover:text-white transition-colors cursor-pointer">About Us</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Careers</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Press</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Blog</span></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Support</h4>
              <ul className="space-y-1.5 font-medium">
                <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-medium">
            <p>© 2026 TravelAI. All rights reserved.</p>
            <p>Opti Travel Portal</p>
          </div>
        </div>
      </footer>

      {/* Global Coming Soon Modal Interceptor */}
      <ComingSoonModal
        isOpen={!!comingSoonService}
        service={comingSoonService}
        onClose={() => setComingSoonService(null)}
      />
    </div>
  );
}
