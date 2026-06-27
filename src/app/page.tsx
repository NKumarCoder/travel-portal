"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/ui/search-box";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plane,
  Hotel,
  Bus,
  Compass,
  Package,
  Sparkles,
  ArrowRight,
  Star,
  Globe,
  Shield,
} from "lucide-react";
import React from "react";

const categories = [
  { href: "/flights", label: "Flights", icon: Plane, color: "bg-blue-50 text-blue-600" },
  { href: "/hotels", label: "Hotels", icon: Hotel, color: "bg-amber-50 text-amber-600" },
  { href: "/buses", label: "Buses", icon: Bus, color: "bg-green-50 text-green-600" },
  { href: "/activities", label: "Activities", icon: Compass, color: "bg-purple-50 text-purple-600" },
  { href: "/packages", label: "Packages", icon: Package, color: "bg-indigo-50 text-indigo-600" },
  { href: "/ai-planner", label: "AI Planner", icon: Sparkles, color: "bg-pink-50 text-pink-600" },
];

const popularDestinations = [
  { name: "Bali, Indonesia", image: "🏝️", rating: 4.8, price: "$1,299" },
  { name: "Tokyo, Japan", image: "🗼", rating: 4.7, price: "$3,200" },
  { name: "Paris, France", image: "🗼", rating: 4.6, price: "$1,850" },
  { name: "Swiss Alps", image: "🏔️", rating: 4.9, price: "$2,450" },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Travel Smarter with AI
          </h1>
          <p className="mb-8 text-lg text-blue-100 sm:text-xl">
            Plan your perfect trip with AI-powered recommendations. Flights, hotels,
            activities — all in one place.
          </p>
          <div className="mx-auto max-w-2xl">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Where do you want to go?"
              className="[&_input]:h-14 [&_input]:text-base [&_input]:shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Explore by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <Card className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex flex-col items-center gap-3 p-5">
                  <div className={`rounded-xl p-3 ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Popular Destinations</h2>
            <Link href="/packages">
              <Button variant="ghost" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularDestinations.map((dest) => (
              <Card key={dest.name} className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="mb-3 text-4xl">{dest.image}</div>
                  <h3 className="text-base font-semibold text-gray-900">{dest.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{dest.rating}</span>
                    </div>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm font-medium text-blue-600">From {dest.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">Why Choose TravelAI</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
              <Sparkles className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">AI-Powered Planning</h3>
            <p className="text-sm text-gray-500">
              Get personalized travel recommendations powered by advanced AI technology.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
              <Globe className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Global Coverage</h3>
            <p className="text-sm text-gray-500">
              Access thousands of destinations, airlines, and hotels worldwide.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50">
              <Shield className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Secure Booking</h3>
            <p className="text-sm text-gray-500">
              Book with confidence. Secure payments and free cancellation options.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
