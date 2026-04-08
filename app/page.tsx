import { Suspense } from "react";

// Skip static generation for this page - it fetches dynamic data
export const dynamic = 'force-dynamic';

// --- New FoxerNew Landing Page ---
import FoxerLandingPage from "@/components/landing/FoxerLandingPage";

// --- Shared Components ---
import Navbar from "@/components/shared/Navbar";
import AuthModal from "@/components/landing/AuthModal";

// --- Search Results Components ---
import ListingCard from "@/components/landing/ListingCard";
import { getVenues } from "@/lib/server/data";
import { filterVenues } from "@/lib/helpers/filterVenues";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function HomeContent({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const locationQuery = typeof params.location === 'string' ? params.location : undefined;
  const categoryQuery = typeof params.category === 'string' ? params.category : undefined;

  // Fetch venues from API
  const venues = await getVenues();

  // --- FILTERING LOGIC ---
  const filteredVenues = filterVenues(venues, locationQuery, categoryQuery);

  const isSearchMode = locationQuery || categoryQuery;

  // --- SEARCH/FILTER RESULTS VIEW ---
  if (isSearchMode) {
    return (
      <main className="min-h-screen bg-white pt-[60px] md:pt-[70px] pb-20">
        <Navbar />
        <AuthModal />

        <div className="max-w-[1600px] mx-auto px-2 md:px-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 h-[calc(100vh-140px)]">
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

          <div className="hidden lg:block h-full sticky top-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80"
              className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
              alt="Map"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full shadow-lg font-bold text-sm">
                Map View <span className="text-xs font-normal text-gray-500">(Placeholder)</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- NEW FOXERNEW LANDING PAGE (Default) ---
  return <FoxerLandingPage />;
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
