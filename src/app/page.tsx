import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "FoxPassport — Book any event, anywhere" },
  description:
    "Book the venue, the gear and the crew for any event: concerts, weddings, festivals and private parties. Search by event type, city and date.",
  openGraph: {
    title: "FoxPassport — Book any event, anywhere",
    description:
      "Book the venue, the gear and the crew for any event, in one booking.",
  },
};

// Skip static generation for this page - it fetches dynamic data
export const dynamic = "force-dynamic";

// --- Features ---
// Server component: import leaves directly, not feature barrels, so the whole
// client graph of each feature doesn't get pulled into this page's bundle.
import JourneyLanding from "@/features/landing/journey/JourneyLanding";
import WelcomeGuide from "@/features/onboarding/components/WelcomeGuide";

// --- Search Results Components ---
import Link from "next/link";
import ListingCard from "@/features/landing/components/ListingCard";
import { SearchResultsMap } from "@/features/search/components/SearchResultsMap";
import AuthModal from "@/features/auth/components/AuthModal";
import GoogleAuthErrorToast from "@/features/auth/components/GoogleAuthErrorToast";
import FacebookAuthErrorToast from "@/features/auth/components/FacebookAuthErrorToast";
import { filterVenues } from "@/features/venue/helpers/filterVenues";

// --- Shared Components & Server Utils ---
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { getVenues } from "@/shared/lib/server/data";
import { getUser } from "@/shared/lib/server/auth";
import { hasPermission } from "@/shared/lib/permissions";
import { isFoxer } from "@/shared/constants/roles";

function userCanSeeVenues(user: any): boolean {
  if (!user) return true; // unauthenticated visitors see venues freely
  if (hasPermission(user, "queue:read")) return true;
  const roleType: string[] = user?.roleType ?? [];
  return isFoxer(roleType);
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
  // the app - because that branch renders the landing page, which loads its own
  // data. Fetching in parallel with the profile also removes the waterfall:
  // neither depends on the other.
  const [user, venues] = await Promise.all([
    getUser(),
    isSearchMode ? getVenues() : Promise.resolve([]),
  ]);

  const canSeeVenues = userCanSeeVenues(user);

  // --- FILTERING LOGIC ---
  const filteredVenues = filterVenues(venues, locationQuery, categoryQuery);

  // --- SEARCH/FILTER RESULTS VIEW ---
  if (isSearchMode) {
    return (
      <main className="min-h-screen bg-background bg-gradient-dark text-text-main font-body pt-28 md:pt-32 pb-20">
        <LandingHeader />
        <AuthModal />

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:h-[calc(100vh-140px)]">
          <div className="lg:overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
            <div className="mb-6 px-1">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
                {locationQuery
                  ? `Venues in ${locationQuery}`
                  : `${categoryQuery} Venues`}
              </h1>
              {canSeeVenues && (
                <p className="text-white/50 text-sm">
                  {filteredVenues.length}{" "}
                  {filteredVenues.length === 1 ? "result" : "results"}
                </p>
              )}
            </div>

            {!canSeeVenues ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-[2rem] border border-white/10 bg-surface">
                <div className="h-16 w-16 rounded-2xl bg-accent/15 flex items-center justify-center mb-5">
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={{ color: "var(--accent-text)" }}
                  >
                    storefront
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  Venues are for Venue &amp; Event Foxers
                </h2>
                <p className="text-white/50 max-w-sm mt-2 text-sm">
                  Venue listings are visible to Venue Foxers and Event Foxers.
                  Apply for one of those roles to unlock them.
                </p>
                <Link
                  href="/onboarding"
                  className="mt-6 px-6 py-3 rounded-xl bg-accent text-black text-sm font-bold hover:bg-accent-hover transition-colors"
                >
                  See the roles
                </Link>
              </div>
            ) : filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                {filteredVenues.map((venue) => (
                  <ListingCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-[2rem] border border-white/10 bg-surface">
                <span className="material-symbols-outlined text-[40px] text-white/20 mb-4">
                  search_off
                </span>
                <h2 className="text-lg font-bold text-white">
                  No results found
                </h2>
                <p className="text-white/50 max-w-xs mt-2 text-sm">
                  Try a different category or location.
                </p>
              </div>
            )}
          </div>

          {/* Real venues map — only for people allowed to see the venues. */}
          {canSeeVenues && (
            <div className="hidden lg:block h-full sticky top-0">
              <SearchResultsMap venues={filteredVenues} />
            </div>
          )}
        </div>
      </main>
    );
  }

  // --- LANDING PAGE (Default) ---
  return (
    <>
      <WelcomeGuide />
      <JourneyLanding />
    </>
  );
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <GoogleAuthErrorToast />
        <FacebookAuthErrorToast />
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
