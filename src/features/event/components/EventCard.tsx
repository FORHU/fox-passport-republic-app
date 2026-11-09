"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { EventTemplate } from "@/shared/api/event-templates";
import { addFavorite, removeFavoriteByListing } from "@/shared/api/favorites";
import { Money } from "@/shared/components/ui/Money";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";

interface EventCardProps {
  /** A package from /event-templates/browse, which is what the Categories page lists. */
  event: EventTemplate;
}

/** The template's own city and state, else the city of a venue it uses. */
function templateLocation(event: EventTemplate): string {
  const target = [event.targetCity, event.targetState]
    .filter(Boolean)
    .join(", ");
  return target || event.templateVenues?.[0]?.venue?.city || "Location TBD";
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (favLoading) return;
    setFavLoading(true);
    const next = !isFavorited;
    setIsFavorited(next);
    try {
      if (next) {
        await addFavorite(event.id, "event");
      } else {
        await removeFavoriteByListing(event.id, "event");
      }
    } catch {
      setIsFavorited(!next);
    } finally {
      setFavLoading(false);
    }
  };

  const imageUrl = event.images?.find((img) => img.url)?.url || FALLBACK_IMAGE;
  const location = templateLocation(event);
  const price = event.estimatedTotal ?? 0;

  return (
    <Link href={`/event/${event.id}`} className="group cursor-pointer block">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <Image
          src={imageUrl}
          alt={event.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-60"
          onClick={handleFavorite}
          disabled={favLoading}
          aria-label={
            isFavorited ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isFavorited ? "fill-pink-500 text-pink-500" : "text-gray-700"}`}
          />
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-white line-clamp-1 group-hover:text-accent transition-colors">
          {event.name}
        </h3>

        {event.category && (
          <p className="text-sm text-gray-400 capitalize">{event.category}</p>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {price > 0 && (
          <p className="text-white">
            <span className="font-semibold">
              <Money amount={price} />
            </span>
            <span className="text-gray-400 text-sm"> est.</span>
          </p>
        )}
      </div>
    </Link>
  );
};
