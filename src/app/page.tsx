/* eslint-disable @next/next/no-img-element */
import { Suspense } from "react";

// Skip static generation for this page - it fetches dynamic data
export const dynamic = "force-dynamic";

// --- Features ---
// Server component: import leaves directly, not feature barrels, so the whole
// client graph of each feature doesn't get pulled into this page's bundle.
import FoxerLandingPage from "@/features/landing/components/FoxerLandingPage";
import MobileHomePage from "@/features/landing/components/MobileHomePage";

// --- Search Results Components ---
import ListingCard from "@/features/landing/components/ListingCard";
import AuthModal from "@/features/auth/components/AuthModal";
import GoogleAuthErrorToast from "@/features/auth/components/GoogleAuthErrorToast";
import { filterVenues } from "@/features/venue/helpers/filterVenues";

// --- Shared Components & Server Utils ---
import Navbar from "@/shared/components/layout/Navbar";
import { getVenues, getFeaturedEventTemplates } from "@/shared/lib/server/data";
import { getUser } from "@/shared/lib/server/auth";
import { hasPermission } from "@/shared/lib/permissions";

const VENUE_ROLES = ["eventFoxer", "venueFoxer", "gearFoxer", "serviceFoxer"];

function userCanSeeVenues(user: any): boolean {
  if (!user) return true; // unauthenticated visitors see venues freely
  if (hasPermission(user, "queue:read")) return true;
  const roleType: string[] = user?.roleType ?? [];
  return roleType.some((r) => VENUE_ROLES.includes(r));
}

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function HomeContent({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const locationQuery =
    typeof params.location === "string" ? params.location : undefined;
  const categoryQuery =
    typeof params.category === "string" ? params.category : undefined;

  const isSearchMode = Boolean(locationQuery || categoryQuery);

  // The two views need different data, so only fetch what the branch we are
  // about to render actually uses. `getVenues()` used to run unconditionally and
  // was then discarded on the default landing page - the most visited route in
  // the app - because that branch renders FoxerLandingPage, which takes no
  // venues. Fetching in parallel with the profile also removes the waterfall:
  // neither depends on the other.
  const [user, venues, featuredTemplates] = await Promise.all([
    getUser(),
    isSearchMode ? getVenues() : Promise.resolve([]),
    isSearchMode ? Promise.resolve([]) : getFeaturedEventTemplates(4),
  ]);

  const canSeeVenues = userCanSeeVenues(user);

  // --- FILTERING LOGIC ---
  const filteredVenues = filterVenues(venues, locationQuery, categoryQuery);

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
                {locationQuery
                  ? `Stays in ${locationQuery}`
                  : `${categoryQuery} Venues`}
              </h2>
              <p className="text-gray-500 text-xs md:text-sm">
                {filteredVenues.length} results found
              </p>
            </div>

            {!canSeeVenues ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">🏛️</div>
                <h3 className="text-lg font-bold text-gray-900">
                  Venues are for Venue Foxers &amp; Creators
                </h3>
                <p className="text-gray-500 max-w-xs mt-2 text-sm">
                  Venue listings are only visible to Venue Foxers and Event
                  Foxers. Apply for a role to unlock access.
                </p>
              </div>
            ) : filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-6 md:gap-x-6 md:gap-y-10">
                {filteredVenues.map((venue) => (
                  <ListingCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900">
                  No results found
                </h3>
                <p className="text-gray-500 max-w-xs mt-2 text-sm">
                  Try a different category or location.
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block h-full sticky top-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1000&q=80"
              className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
              alt="Map"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full shadow-lg font-bold text-sm">
                Map View{" "}
                <span className="text-xs font-normal text-gray-500">
                  (Placeholder)
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- NEW FOXERNEW LANDING PAGE (Default) ---
  return (
    <>
      <div className="lg:hidden">
        <MobileHomePage />
      </div>
      <div className="hidden lg:block">
        <FoxerLandingPage featuredTemplates={featuredTemplates} />
      </div>
    </>
  );
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <GoogleAuthErrorToast />
      </Suspense>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
