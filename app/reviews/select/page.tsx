"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin } from "lucide-react";
import { HARDCODED_VENUES } from "@/data/hardcodedVenues";
import RequireAuth from "@/components/authentication/RequireAuth";

export default function ReviewSelectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  // Get first 4 venues for "recently visited" section
  const recentVenues = HARDCODED_VENUES.slice(0, 4);

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              Find a business to review
            </h1>
            <p className="text-gray-600 text-center mb-10 md:text-lg">
              Review anything from your favorite patio spot to your local flower shop.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Try restaurants, coffee shops, resorts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Philippines"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button className="px-8 py-3.5 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors shadow-md">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Recently Visited Section */}
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Visited one of these places recently?
          </h2>
          <p className="text-gray-600 mb-8">
            Share your experience with the community
          </p>

          {/* Venue Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentVenues.map((venue) => (
              <Link
                key={venue.id}
                href={`/reviews/write/${venue.id}`}
                className="group bg-white rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Venue Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <Image
                    src={venue.images[0]}
                    alt={venue.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Venue Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {venue.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">
                      {venue.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {venue.location}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < Math.floor(venue.rating)
                              ? "bg-pink-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {venue.rating} ({venue.reviews} reviews)
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-700 font-semibold">
                      Do you recommend this business?
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
