"use client";

import React from "react";
import { Building2, Plus, MapPin, DollarSign, Star, LogOut } from "lucide-react";
import { useHostDashboard } from "@/hooks/useHostDashboard";

export default function HostDashboard() {
  const { handleLogout, openModal, stats } = useHostDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Host Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your venues and listings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
               >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors shadow-lg shadow-pink-500/30"
              >
                <Plus className="w-5 h-5" />
                List a Venue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Venues */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Venues
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalVenues}
                </p>
              </div>
              <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                <Building2 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>

          {/* Active Listings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Listings
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.activeListings}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  ₱{stats.totalRevenue}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Rating
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {stats.totalVenues === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-200 dark:border-gray-700 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/20 mb-4">
                <Building2 className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No venues yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start by listing your first venue. Share your space with foxers and event planners!
              </p>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                List Your First Venue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
