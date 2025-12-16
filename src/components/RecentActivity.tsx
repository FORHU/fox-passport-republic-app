"use client";

import BusinessCard from "@/src/components/BusinessCard";
import { useRecentActivity } from "@/src/hooks/useRecentActivity";

export default function RecentActivity() {
  const { 
    activities, 
    isLoading, 
    hasMore, 
    loadMore,
    filterByCategory,
    sortActivities 
  } = useRecentActivity();

  return (
    <section className="py-8 md:py-16 px-4 md:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">
          Recent Activity
        </h2>
        
        {/* Optional: Filter/Sort Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <button
            onClick={() => filterByCategory(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            All
          </button>
          <button
            onClick={() => filterByCategory("Villa")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Villas
          </button>
          <button
            onClick={() => filterByCategory("Beach Resort")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Beach Resorts
          </button>
          <button
            onClick={() => filterByCategory("Apartment")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Apartments
          </button>
          <button
            onClick={() => sortActivities("rating")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Sort by Rating
          </button>
        </div>
        
        {/* Loading State */}
        {isLoading && activities.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="w-full aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Simple Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activities.map((activity) => (
                <BusinessCard key={activity.id} data={activity} />
              ))}
            </div>

            {/* Empty State */}
            {activities.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No activities found</p>
              </div>
            )}
          </>
        )}
        
        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 md:mt-12 text-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="text-black font-semibold hover:bg-gray-100 border-2 border-black px-8 py-3 rounded-lg text-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Show more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}