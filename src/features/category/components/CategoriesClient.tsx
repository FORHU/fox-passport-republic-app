'use client';

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/shared/components/layout/Navbar";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useEventsByCategory } from "@/features/category/hooks/useEventsByCategory";
import { useVenuesByCategory } from "@/features/category/hooks/useVenuesByCategory";
import EventCard from "@/shared/components/layout/EventCard";
import VenueCard from "@/shared/components/layout/VenueCard";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { CategoryListHero } from "@/features/category/components/list/CategoryListHero";
import { CategoryBentoGrid } from "@/features/category/components/list/CategoryBentoGrid";

interface CategoriesClientProps {
  initialCategories: any[];
  initialEvents: any[];
  initialVenues: any[];
  initialType?: string;
}

function CategoriesContent({ initialCategories, initialEvents, initialVenues, initialType }: CategoriesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || initialType || "all";
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { events, loading: eventsLoading } = useEventsByCategory(type);
  const { venues, loading: venuesLoading } = useVenuesByCategory(type);

  // Use initial data if hooks don't have data
  const displayCategories = categories.length > 0 ? categories : initialCategories;
  const displayEvents = events.length > 0 ? events : initialEvents;
  const displayVenues = venues.length > 0 ? venues : initialVenues;

  // State for search within categories
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories based on search (excluding any "More" category)
  const filteredCategories = useMemo(() => {
    return displayCategories.filter(cat =>
      cat.slug !== 'more' &&
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayCategories, searchQuery]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  const handleBack = () => {
    router.push("/categories");
  };

  // View logic for category display
  const currentCategory = useMemo(() => {
    if (!type || !displayCategories.length) return null;
    return displayCategories.find(c => c.slug === type) ||
      displayCategories.flatMap(c => c.subCategories || []).find(sc => sc.slug === type);
  }, [type, displayCategories]);

  const displayTitle = currentCategory ? currentCategory.name : type;

  // --- VIEW: SPECIFIC CATEGORY (Legacy/Type Filter) ---
  if (type) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navbar />

        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/10 rounded-full transition-colors border border-transparent hover:border-white/20"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{displayTitle}</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Explore the best {displayTitle?.toLowerCase()} experiences
                </p>
              </div>
            </div>
          </div>

          {(eventsLoading || venuesLoading) ? (
            <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 p-6 min-h-[500px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#ccff00] animate-spin" />
            </div>
          ) : (
            <>
              {/* Venues Section */}
              {displayVenues.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Venues</h2>
                  <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                      {displayVenues.map((venue) => (
                        <VenueCard key={venue.id} venue={venue} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Events Section */}
              {displayEvents.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Events</h2>
                  <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                      {displayEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {displayEvents.length === 0 && displayVenues.length === 0 && (
                <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 p-6 min-h-[500px] flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-lg font-bold text-white">No content yet</h3>
                  <p className="text-gray-400 max-w-xs mt-2 text-sm">
                    No events or venues found for {type}. Create some via the host dashboard or admin panel!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (categoriesLoading && displayCategories.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin mb-4" />
          <p className="text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (categoriesError || displayCategories.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            {categoriesError ? "Failed to load categories" : "No categories available"}
          </h2>
          <p className="text-gray-400 mb-4">{categoriesError?.message}</p>
          <p className="text-gray-500 text-sm">Please make sure the backend server is running.</p>
        </div>
      </div>
    );
  }

  // --- VIEW: ALL CATEGORIES LIST ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
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

export default function CategoriesClient(props: CategoriesClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading categories...</div>}>
      <CategoriesContent {...props} />
    </Suspense>
  );
}