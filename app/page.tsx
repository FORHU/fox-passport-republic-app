"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VenueMap from "@/src/components/VenueMap";
import SearchBar from "@/src/components/SearchBar";
import Categories from "@/src/components/Categories";
import RecentActivity from "@/src/components/RecentActivity"; 
import { useVenueMapLogic } from "@/src/hooks/useVenueMapLogic";
import { config } from "@/src/config";
import { X } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loading, venues, searchCoordinates, searchForVenues } = useVenueMapLogic();
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    const locationName = searchParams.get("location");
    if (locationName) {
      handleUrlSearch(locationName);
    } else {
      setShowMapModal(false);
    }
  }, [searchParams]);

  const handleUrlSearch = async (locationName: string) => {
    setShowMapModal(true);
    if (!config.mapboxToken) return;

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName + ", Philippines")}.json?access_token=${config.mapboxToken}&limit=1`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        await searchForVenues(locationName, lat, lng);
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    }
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    router.push('/', { scroll: false });
  };

  return (
    <main className="min-h-screen font-sans bg-gray-50">
      {/* HERO SECTION */}
      <div className="relative w-full h-[650px] md:h-[850px] bg-black z-20 flex items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836" 
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 px-4 w-full max-w-5xl">
          <div className="flex flex-col items-center text-center">
             <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight drop-shadow-lg">
               Let's Make Life An Event
             </h1>
             <div className="w-full max-w-4xl shadow-2xl rounded-full">
               <SearchBar isHero={true} />
             </div>
             <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-8 text-white text-sm md:text-base font-semibold drop-shadow-md">
               <span className="hover:text-pink-400 transition-colors cursor-pointer">Venues</span>
               <span className="hover:text-pink-400 transition-colors cursor-pointer">Catering</span>
               <span className="hover:text-pink-400 transition-colors cursor-pointer">Photography</span>
               <span className="hover:text-pink-400 transition-colors cursor-pointer">More</span>
             </div>
          </div>
        </div>
      </div>

      {/* MODAL MAP SECTION */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Venues near {searchParams.get("location")}
                </h2>
                <p className="text-sm text-gray-500">Found {venues.length} results</p>
              </div>
              <button onClick={closeMapModal} className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors focus:outline-none">
                <X size={24} />
              </button>
            </div>
            <div className="h-[60vh] md:h-[70vh] w-full relative">
              <VenueMap venues={venues} loading={loading} center={searchCoordinates} />
            </div>
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY COMPONENT */}
      <RecentActivity />

      {/* CATEGORIES SECTION */}
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