"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  VenuesMap,
  MapVenue,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from "@/shared/components/ui/VenuesMap";

interface AdminVenuesMapProps {
  venues: any[];
  isLoading: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  archived: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending review",
  available: "Available",
  rejected: "Rejected",
  archived: "Archived",
};

function extractImageUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img?.url ?? img?.imageUrl ?? null;
}

interface ListVenue extends MapVenue {
  image: string;
  location: string;
  status: string;
  owner: string;
  capacity: number;
  description: string;
  category: string;
}

function AdminVenueListCard({
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
            <span
              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_STYLES[venue.status] ?? "bg-white/5 text-white/60 border-white/10"}`}
            >
              {STATUS_LABELS[venue.status] ?? venue.status}
            </span>
            {venue.capacity > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {venue.capacity}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <p className="text-xs text-white/50 truncate">
              Owner: <span className="text-white/80">{venue.owner}</span>
            </p>
            <Link
              href={`/venues/${venue.id}`}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors shrink-0"
            >
              View Listing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Same "click a pin, a bigger card floats over the map" pattern as the
// public venues map — slides in from the left on select, back out on
// deselect (AnimatePresence keeps it mounted long enough to play the exit).
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
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLES[venue.status] ?? "bg-black/50 text-white border-white/20"}`}
        >
          {STATUS_LABELS[venue.status] ?? venue.status}
        </span>
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
          <span>
            Owner: <span className="text-white/90">{venue.owner}</span>
          </span>
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
          {venue.category && (
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              {venue.category}
            </span>
          )}
          <Link
            href={`/venues/${venue.id}`}
            target="_blank"
            className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors ml-auto"
          >
            View Listing
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export const AdminVenuesMap: React.FC<AdminVenuesMapProps> = ({
  venues,
  isLoading,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const listVenues: ListVenue[] = useMemo(
    () =>
      (venues ?? [])
        .filter((v) => v.lat != null && v.lng != null)
        .map((v) => {
          const images: string[] = (v.images ?? [])
            .map(extractImageUrl)
            .filter(Boolean) as string[];
          return {
            id: v.id,
            name: v.name ?? "Untitled venue",
            lat: v.lat,
            lng: v.lng,
            boundary: v.boundary,
            subtitle: `${STATUS_LABELS[v.status] ?? v.status ?? ""} · ${v.mayor?.name ?? "Unknown owner"}`,
            // No fallback for the pin's circular photo — a venue with
            // nothing uploaded should show as a plain colored dot, not the
            // same generic stock photo on every pin.
            imageUrl: images[0] || null,
            image: images[0] || "/herobackground.jpg",
            location:
              [v.city, v.state, v.country].filter(Boolean).join(", ") || "",
            status: v.status ?? "pending",
            owner: v.mayor?.name ?? "Unknown",
            capacity: Number(v.capacity) || 0,
            description: v.description ?? "",
            category: v.category ?? "",
          };
        }),
    [venues],
  );

  const selectedVenue = useMemo(
    () => listVenues.find((v) => v.id === selectedId) ?? null,
    [listVenues, selectedId],
  );

  // Re-clicking the already-selected venue deselects it, which VenuesMap
  // reads as "pan back to where the camera started."
  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleMapVenueClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    cardRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const total = venues?.length ?? 0;

  if (isLoading) {
    return (
      <div className="glass-panel p-20 flex flex-col items-center justify-center rounded-[2rem] border border-white/5">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
        <p className="text-white/40 font-display text-sm tracking-widest uppercase">
          Fetching Venues…
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col lg:flex-row h-[calc(100vh-260px)] min-h-[520px]">
      {/* Left: scrollable venue list */}
      <div className="w-full lg:w-[380px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 min-h-0">
        <div className="p-6 border-b border-white/5 shrink-0">
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent">map</span>
            Venues Map
          </h3>
          <p className="text-xs text-white/40 mt-1">
            {listVenues.length} of {total} venue{total === 1 ? "" : "s"} have a
            location — click one to see it on the map.
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {listVenues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-2">
              <span className="material-symbols-outlined text-[40px]">
                location_off
              </span>
              <p className="text-sm">No venues have a location yet</p>
            </div>
          ) : (
            listVenues.map((venue) => (
              <div
                key={venue.id}
                ref={(el) => {
                  cardRefs.current[venue.id] = el;
                }}
              >
                <AdminVenueListCard
                  venue={venue}
                  selected={venue.id === selectedId}
                  onSelect={() => handleSelect(venue.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: map */}
      <div className="relative flex-1 min-w-0 min-h-[320px] p-4">
        <VenuesMap
          venues={listVenues}
          fitToContent={false}
          zoom={6}
          selectedVenueId={selectedId}
          onVenueClick={handleMapVenueClick}
          className="h-full w-full rounded-[1.5rem] border border-white/10 overflow-hidden shadow-xl"
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
  );
};
