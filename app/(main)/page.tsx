"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// --- Components Imports ---
import Navbar from "@/src/components/Navbar";
import HeroSection from "@/src/components/HeroSection";
import RecentActivity from "@/src/components/RecentActivity";
import Categories from "@/src/components/Categories";

// --- Search Logic Components ---
import ListingCard from "@/src/components/ListingCard";
import { HARDCODED_VENUES } from "@/src/data/hardcodedVenues";

function HomeContent() {
  const searchParams = useSearchParams();
  const locationQuery = searchParams.get("location");
  const categoryQuery = searchParams.get("category"); // Get category from URL

  // --- FILTERING LOGIC ---
  let filteredVenues = HARDCODED_VENUES;

  // 1. Filter by Location (if exists)
  if (locationQuery) {
    filteredVenues = filteredVenues.filter(
      (v) =>
        v.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
        v.province.toLowerCase().includes(locationQuery.toLowerCase())
    );
  }

  // 2. Filter by Category (if exists)
  if (categoryQuery) {
    filteredVenues = filteredVenues.filter((v) => {
      const cat = v.category.toLowerCase();
      const q = categoryQuery.toLowerCase();

      // Map Broad Categories to Specific Data Types
      if (q === "hotels & travel") return ["hotel", "resort", "villa", "condo", "apartment", "suite", "inn", "lodge", "room", "cabin", "glamping"].some(t => cat.includes(t));
      if (q === "event planning & services") return ["garden", "function", "events", "historic"].some(t => cat.includes(t));
      if (q === "restaurants" || q === "food") return ["dining", "restaurant"].some(t => cat.includes(t));
      if (q === "arts & entertainment") return ["art", "gallery", "museum", "historic"].some(t => cat.includes(t));
      if (q === "nightlife") return ["bar", "club", "lounge"].some(t => cat.includes(t));
      if (q === "real estate") return ["house", "condo", "apartment", "loft"].some(t => cat.includes(t));

      // Default: Direct text match
      return cat.includes(q);
    });
  }

  // Determine if we are in "Search Mode" (Location OR Category selected)
  const isSearchMode = locationQuery || categoryQuery;

  // --- 1. SEARCH/FILTER RESULTS VIEW ---
  if (isSearchMode) {
    return (
      <main className="min-h-screen bg-white pt-[80px] md:pt-[100px] pb-20">
        <Navbar />
        
        <div className="max-w-[1600px] mx-auto px-2 md:px-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 h-[calc(100vh-140px)]">
          
          {/* LEFT: Results Grid */}
          <div className="overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
            <div className="mb-4 md:mb-6 px-1">
                <h2 className="text-lg md:text-xl font-bold mb-1">
                  {locationQuery ? `Stays in ${locationQuery}` : `${categoryQuery} Venues`}
                </h2>
                <p className="text-gray-500 text-xs md:text-sm">{filteredVenues.length} results found</p>
            </div>

            {filteredVenues.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-x-2 gap-y-6 md:gap-x-6 md:gap-y-10">
                {filteredVenues.map((venue) => (
                  <ListingCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="text-4xl mb-4">🔍</div>
                 <h3 className="text-lg font-bold text-gray-900">No results found</h3>
                 <p className="text-gray-500 max-w-xs mt-2 text-sm">Try a different category or location.</p>
              </div>
            )}
          </div>

          {/* RIGHT: Map Placeholder */}
          <div className="hidden lg:block h-full sticky top-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
            <img 
               src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80" 
               className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
               alt="Map"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <button className="bg-white text-gray-900 px-6 py-3 rounded-full shadow-lg font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                 Map View <span className="text-xs font-normal text-gray-500">(Placeholder)</span>
               </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- 2. LANDING PAGE VIEW (Default) ---
  return (
    <main className="min-h-screen font-sans bg-gray-50">
      <Navbar />
      <HeroSection />
      <RecentActivity />
      <Categories />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}