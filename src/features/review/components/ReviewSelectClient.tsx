"use client";

import React from "react";
import { Search, MapPin } from "lucide-react";
import RequireAuth from "@/features/auth/components/RequireAuth";
import { useReviewSelectStore } from "@/features/review/store/useReviewsStore";
import { ReviewVenueCard } from "@/features/review/components";

interface ReviewSelectClientProps {
  recentVenues: any[]
}

export default function ReviewSelectClient({ recentVenues }: ReviewSelectClientProps) {
  const { searchQuery, locationQuery, setSearchQuery, setLocationQuery } =
    useReviewSelectStore();

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
          <p className="text-gray-600 mb-8">Share your experience with the community</p>

          {/* Venue Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentVenues.map((venue) => (
              <ReviewVenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}