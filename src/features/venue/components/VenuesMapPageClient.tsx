"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  VenuesMap,
  MapVenue,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "@/shared/components/ui/VenuesMap";

interface VenuesMapPageClientProps {
  venues: any[];
}

interface ListVenue extends MapVenue {
  image: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  capacity: number;
  description: string;
  category: string;
}

function VenueListCard({
  venue,
  selected,
  onSelect,
}: {
  venue: ListVenue;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-2xl border transition-all overflow-hidden bg-white/5 hover:bg-white/10 ${
        selected
          ? "border-[#ccff00] ring-1 ring-[#ccff00]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-24 w-28 shrink-0 rounded-xl overflow-hidden bg-white/5">
          <Image
            src={venue.image}
            alt={venue.name}
            fill
            sizes="112px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-sm font-bold text-white truncate">
            {venue.name}
          </h3>
          {venue.location && (
            <p className="text-xs text-white/40 truncate mt-0.5">
              {venue.location}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/50">
            {venue.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#ccff00] text-[#ccff00]" />
                {venue.rating.toFixed(1)}
                {venue.reviews > 0 && (
                  <span className="text-white/30">({venue.reviews})</span>
                )}
              </span>
            )}
            {venue.capacity > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {venue.capacity}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <p className="text-sm font-bold text-white">
              ₱{venue.price.toLocaleString()}
              <span className="text-[10px] font-normal text-white/40">
                /night
              </span>
            </p>
            <Link
              href={`/venues/${venue.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating detail card over the map — the Airbnb/Google Maps pattern of
// "click a pin, a card appears over the map with more than the list row
// shows" (full description, category, a bigger picture) rather than making
// the user bounce back to the list to see anything beyond the summary.
function VenueDetailCard({
  venue,
  onClose,
}: {
  venue: ListVenue;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="absolute bottom-6 left-6 z-20 w-[calc(100%-3rem)] max-w-sm rounded-[2rem] border border-white/10 bg-[#0b0d14]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="relative h-40 w-full bg-white/5">
        <Image
          src={venue.image}
          alt={venue.name}
          fill
          sizes="384px"
          className="object-cover"
        />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {venue.category && (
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/50 text-[#ccff00]">
            {venue.category}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-base font-bold text-white leading-tight">
            {venue.name}
          </h3>
          {venue.location && (
            <p className="text-xs text-white/40 mt-0.5">{venue.location}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-white/60">
          {venue.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#ccff00] text-[#ccff00]" />
              {venue.rating.toFixed(1)}
              {venue.reviews > 0 && (
                <span className="text-white/30">
                  ({venue.reviews} review{venue.reviews === 1 ? "" : "s"})
                </span>
              )}
            </span>
          )}
          {venue.capacity > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Up to {venue.capacity}
            </span>
          )}
        </div>

        {venue.description && (
          <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
            {venue.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <p className="text-lg font-bold text-white">
            ₱{venue.price.toLocaleString()}
            <span className="text-xs font-normal text-white/40">/night</span>
          </p>
          <Link
            href={`/venues/${venue.id}`}
            className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function VenuesMapPageClient({ venues }: VenuesMapPageClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Below `sm` the list and map can't sit side by side, and the map used to
  // just disappear with `hidden sm:block` — no toggle, no indication it
  // existed at all. This makes "which one is showing" explicit instead.
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const listVenues: ListVenue[] = useMemo(
    () =>
      (venues ?? [])
        .filter((v) => v.lat != null && v.lng != null)
        .map((v) => ({
          id: v.id,
          name: v.title ?? v.name ?? "Untitled venue",
          lat: v.lat,
          lng: v.lng,
          boundary: v.boundary,
          subtitle: v.loc ?? v.location ?? undefined,
          // The pin's circular photo — no fallback image, unlike `image`
          // below: a venue with no real upload should read as "no photo"
          // (a plain colored dot), not show the same generic stock photo
          // on every pin with nothing uploaded yet.
          imageUrl: v.img || v.images?.[0] || null,
          image: v.img || v.images?.[0] || "/herobackground.jpg",
          location: v.loc ?? v.location ?? "",
          price: Number(v.price) || 0,
          rating: Number(v.rating) || 0,
          reviews: Number(v.reviews) || 0,
          capacity: Number(v.guestCount ?? v.capacity) || 0,
          description: v.description ?? "",
          category:
            typeof v.category === "object"
              ? (v.category?.name ?? v.category?.slug ?? "")
              : (v.category ?? ""),
        })),
    [venues],
  );

  const selectedVenue = useMemo(
    () => listVenues.find((v) => v.id === selectedId) ?? null,
    [listVenues, selectedId],
  );

  // Re-clicking the already-selected venue deselects it, which VenuesMap
  // reads as "pan back to where the camera started" instead of leaving it
  // sitting on the last-viewed venue.
  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // Map click selects too — scroll that card into view in the list, same as
  // clicking a card flies the map (kept bidirectional on purpose, matching
  // the Airbnb/Google Maps pattern this is modeled on).
  const handleMapVenueClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    cardRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  return (
    <div className="h-screen w-full bg-[#02040a] text-white font-body flex flex-col overflow-hidden">
      <div className="flex-1 w-full flex min-h-0 pt-16 sm:pt-28">
        {/* Left: scrollable venue list */}
        <div
          className={`${mobileView === "map" ? "hidden" : "flex"} sm:flex w-full sm:w-[400px] lg:w-[440px] shrink-0 flex-col border-r border-white/10 min-h-0`}
        >
          <div className="px-4 sm:px-6 py-4 shrink-0">
            <h1 className="text-xl font-display font-bold flex items-center gap-2">
              <button
                onClick={() => router.back()}
                aria-label="Back"
                className="h-8 w-8 -ml-1.5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">
                  arrow_back
                </span>
              </button>
              <span className="material-symbols-outlined text-[#ccff00]">
                map
              </span>
              Venues Map
            </h1>
            <p className="text-xs text-white/40 mt-1">
              {listVenues.length} venue{listVenues.length === 1 ? "" : "s"} —
              click one to see it on the map.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <span
                  key={key}
                  className="flex items-center gap-1.5 text-[10px] text-white/50"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: CATEGORY_COLORS[key] }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-3">
            {listVenues.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 py-16 flex flex-col items-center justify-center gap-2 text-white/30">
                <span className="material-symbols-outlined text-[36px]">
                  location_off
                </span>
                <p className="text-sm">No venues with a location yet</p>
              </div>
            ) : (
              listVenues.map((venue) => (
                <div
                  key={venue.id}
                  ref={(el) => {
                    cardRefs.current[venue.id] = el;
                  }}
                >
                  <VenueListCard
                    venue={venue}
                    selected={venue.id === selectedId}
                    onSelect={() => handleSelect(venue.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: map, fills the rest of the viewport */}
        <div
          className={`${mobileView === "map" ? "block" : "hidden"} sm:block relative flex-1 min-w-0 p-4`}
        >
          <VenuesMap
            venues={listVenues}
            fitToContent={false}
            zoom={6}
            selectedVenueId={selectedId}
            onVenueClick={handleMapVenueClick}
            className="h-full w-full rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
          />
          <AnimatePresence>
            {selectedVenue && (
              <VenueDetailCard
                key={selectedVenue.id}
                venue={selectedVenue}
                onClose={() => setSelectedId(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile-only List/Map toggle. Sits above MobileBottomNav (68px tall,
          anchored at bottom-4) rather than below `sm` only relying on the
          left column always winning. */}
      <div className="sm:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 p-1 shadow-2xl">
          <button
            onClick={() => setMobileView("list")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              mobileView === "list"
                ? "bg-[#ccff00] text-black"
                : "text-white/60"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              mobileView === "map" ? "bg-[#ccff00] text-black" : "text-white/60"
            }`}
          >
            Map
          </button>
        </div>
      </div>
    </div>
  );
}
