"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { useCategories } from "@/hooks/useCategories";
import { useEventsByCategory } from "@/hooks/useEventsByCategory";
import EventCard from "@/components/shared/EventCard";
import { 
  Utensils, Mountain, Tent, Music, Building2, 
  PartyPopper, Sparkles, MoreHorizontal, ArrowLeft, Search,
  Loader2, AlertCircle, LucideIcon, Grid3X3
} from "lucide-react";
import { Category } from "@/types/category";

// Icon mapping - maps icon name strings from the backend to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  Utensils: Utensils,
  Mountain: Mountain,
  Tent: Tent,
  Music: Music,
  Building2: Building2,
  PartyPopper: PartyPopper,
  Sparkles: Sparkles,
  MoreHorizontal: MoreHorizontal,
  Grid3X3: Grid3X3,
};

// Default icon if the icon name is not found in the map
const DEFAULT_ICON = Grid3X3;

// Helper function to get icon component from icon name
function getIconComponent(iconName: string | null): LucideIcon {
  if (!iconName) return DEFAULT_ICON;
  return ICON_MAP[iconName] || DEFAULT_ICON;
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { events, loading: eventsLoading, error: eventsError } = useEventsByCategory(type);
  
  // State for search within categories
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter categories based on search (excluding any "More" category)
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.slug !== 'more' && 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories?type=${encodeURIComponent(categoryName)}`);
  };

  const handleBack = () => {
    router.push("/categories");
  };

  // --- VIEW: SPECIFIC CATEGORY ---
  if (type) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          
          {/* Header / Breadcrumb-ish */}
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

          {/* Events Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
            {eventsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            ) : eventsError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Error loading events</h3>
                <p className="text-gray-500 max-w-xs mt-2 text-sm">{eventsError}</p>
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-gray-900">No events yet</h3>
                <p className="text-gray-500 max-w-xs mt-2 text-sm">
                  No events found for {type}. Add events via the backend API with this category.
                </p>
              </div>
            )}
          </div>
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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Explore All Categories
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Browse through our curated collection of experiences, from dining to adventures.
          </p>
          
          {/* Search Box */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Find a category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((cat: Category) => {
              const Icon = getIconComponent(cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group flex items-center gap-4 p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:shadow-pink-500/5 hover:border-pink-100 transition-all duration-300 text-left"
                >
                  <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-pink-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-500">
                      {cat.description || "Explore"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">
            {searchQuery ? (
              <>No categories found matching &quot;{searchQuery}&quot;</>
            ) : (
              <>No categories available. Add categories via the backend API.</>
            )}
          </div>
        )}
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
