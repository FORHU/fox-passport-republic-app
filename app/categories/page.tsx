"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import { useCategories } from "@/hooks/useCategories";
import { useEventsByCategory } from "@/hooks/useEventsByCategory";
import { useVenuesByCategory } from "@/hooks/useVenuesByCategory";
import EventCard from "@/components/shared/EventCard";
import VenueCard from "@/components/shared/VenueCard";
import {
  Utensils, Mountain, Tent, Music, Building2,
  PartyPopper, Sparkles, MoreHorizontal, ArrowLeft, Search,
  Loader2, AlertCircle, LucideIcon, Grid3X3, GraduationCap,
  Trophy, MapPin, Users, ShoppingBag
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
  GraduationCap: GraduationCap,
  Trophy: Trophy,
  MapPin: MapPin,
  Users: Users,
  ShoppingBag: ShoppingBag,
};

// Default icon if the icon name is not found in the map
const DEFAULT_ICON = Grid3X3;

// Helper function to get icon component from icon name
function getIconComponent(iconName: string | null): LucideIcon {
  if (!iconName) return DEFAULT_ICON;
  return ICON_MAP[iconName] || DEFAULT_ICON;
}

// Category images mapping
const CATEGORY_IMAGES: Record<string, string> = {
  "Classes & Workshops": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
  "Competitions & Games": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
  "Festivals & Fairs": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
  "Live Performances": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
  "Markets & Pop-Ups": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
  "Parties & Socials": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
  "Tours & Excursions": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
};

function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { events, loading: eventsLoading, error: eventsError } = useEventsByCategory(type);
  const { venues, loading: venuesLoading, error: venuesError } = useVenuesByCategory(type);

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

          {/* Loading State */}
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
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-10">
          <a href="/" className="hover:text-pink-500 transition-colors">Home</a>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Select Category</span>
        </nav>

        {/* Hero Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-xl">
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
              What's the <span className="text-pink-500 italic">vibe</span> today?
            </h2>
            <p className="text-xl text-slate-500 font-medium">
              Let's find your next core memory. Select a category to get started.
            </p>
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl border-none ring-1 ring-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-500 focus:shadow-lg transition-all outline-none"
            />
          </div>
        </div>

        {/* Bento Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-24 auto-rows-[240px]">
            {filteredCategories.map((cat: Category, index) => {
              const Icon = getIconComponent(cat.icon);
              const imageUrl = CATEGORY_IMAGES[cat.name] || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";

              // Create varied grid spans for bento layout
              const gridSpan = index === 0 ? 'lg:col-span-2 lg:row-span-2' :
                             index === 3 ? 'lg:col-span-2' : '';
              const isLarge = gridSpan.includes('lg:col-span-2');

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-lg transition-transform duration-500 hover:-translate-y-1 ${gridSpan}`}
                >
                  {/* Category background image */}
                  <img
                    src={imageUrl}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity group-hover:from-black/80" />

                  <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                    <div className="flex-1">
                      <h3 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-bold text-white mb-1 group-hover:text-pink-200 transition-colors`}>
                        {cat.name}
                      </h3>
                      <p className="text-white/80 text-sm font-medium line-clamp-2">
                        {cat.description || "Explore experiences"}
                      </p>
                    </div>
                    {isLarge && (
                      <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl text-slate-200 mb-4">🔍</div>
            <p className="text-slate-500 font-medium">
              {searchQuery ? `No vibes found matching "${searchQuery}"` : "No categories available"}
            </p>
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
