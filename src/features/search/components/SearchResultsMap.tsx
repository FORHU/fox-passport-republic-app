"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VenuesMap, type MapVenue } from "@/shared/components/ui/VenuesMap";

interface SearchVenue {
  id: string;
  title?: string;
  name?: string;
  type?: string;
  lat?: number | null;
  lng?: number | null;
  images?: string[];
}

/** The real venues map beside the search results — the venues in the list,
 * pinned, with a click going to the venue. */
export function SearchResultsMap({ venues }: { venues: SearchVenue[] }) {
  const router = useRouter();

  const pins: MapVenue[] = useMemo(
    () =>
      venues
        .filter((v) => v.lat != null && v.lng != null)
        .map((v) => ({
          id: v.id,
          name: v.title || v.name || "Venue",
          lat: v.lat,
          lng: v.lng,
          category: v.type ?? null,
          imageUrl: v.images?.[0] ?? null,
        })),
    [venues],
  );

  if (pins.length === 0) {
    return (
      <div className="h-full w-full rounded-[2rem] border border-white/10 bg-surface flex flex-col items-center justify-center gap-3 text-center p-8">
        <span className="material-symbols-outlined text-[40px] text-white/20">
          map
        </span>
        <p className="text-sm text-white/50 max-w-xs">
          None of these results have a map location yet.
        </p>
        <Link
          href="/venues/map"
          className="text-sm font-bold text-accent hover:underline"
        >
          Browse all venues on the map
        </Link>
      </div>
    );
  }

  return (
    <VenuesMap
      venues={pins}
      // A search result set is small and deliberately bounded — frame it.
      fitToContent
      onVenueClick={(id) => router.push(`/venues/${id}`)}
      className="h-full w-full rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
    />
  );
}
