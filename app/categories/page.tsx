"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { useCategories } from "@/hooks/data/useCategories";
import { useEventsByCategory } from "@/hooks/events/useEventsByCategory";
import { useVenuesByCategory } from "@/hooks/venues/useVenuesByCategory";
import EventCard from "@/components/shared/EventCard";
import VenueCard from "@/components/shared/VenueCard";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { CategoryListHero } from "@/components/categories/list/CategoryListHero";
import { CategoryBentoGrid } from "@/components/categories/list/CategoryBentoGrid";

function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { events, loading: eventsLoading } = useEventsByCategory(type);
  const { venues, loading: venuesLoading } = useVenuesByCategory(type);

  // State for search within categories
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter categories based on search (excluding any "More" category)
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.slug !== 'more' && 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  const handleBack = () => {
    router.push("/categories");
  };

  // --- VIEW: SPECIFIC CATEGORY (Legacy/Type Filter) ---
  if (type) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{type}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Explore the best {type.toLowerCase()} experiences
                </p>
              </div>
            </div>
          </div>

          {(eventsLoading || venuesLoading) ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Venues Section */}
              {venues.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Venues</h2>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                      {venues.map((venue) => (
                        <VenueCard key={venue.id} venue={venue} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Events Section */}
              {events.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Events</h2>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {events.length === 0 && venues.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-bold text-gray-900">No content yet</h3>
                    <p className="text-gray-500 max-w-xs mt-2 text-sm">
                      No events or venues found for {type}. Create some via the host dashboard or admin panel!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (categoriesError || categories.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {categoriesError ? "Failed to load categories" : "No categories available"}
          </h2>
          <p className="text-gray-500 mb-4">{categoriesError}</p>
          <p className="text-gray-400 text-sm">Please make sure the backend server is running.</p>
        </div>
      </div>
    );
  }

  // --- VIEW: ALL CATEGORIES LIST ---
  return (
    <div className="min-h-screen bg-[#f6f8f8] flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 lg:px-20 py-10">
        <CategoryListHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <CategoryBentoGrid 
          categories={filteredCategories} 
          onCategoryClick={handleCategoryClick}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading categories...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
