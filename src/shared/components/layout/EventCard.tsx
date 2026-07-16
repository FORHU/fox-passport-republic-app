"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, MapPin } from "lucide-react";
import { Event } from "@/features/event/types/event";
import { addFavorite, removeFavoriteByListing } from "@/features/user/api/favorites";

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
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
  // Get the primary image or first image
  const primaryImage = event.images.find(img => img.isPrimary) || event.images[0];
  const imageUrl = primaryImage?.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80";
  
  // Calculate average rating
  const averageRating = event.reviews && event.reviews.length > 0
    ? (event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length).toFixed(2)
    : null;
  
  // Get price
  const price = event.pricing && event.pricing.length > 0
    ? parseFloat(event.pricing[0].basePrice)
    : null;
  
  const currency = event.pricing && event.pricing.length > 0
    ? event.pricing[0].currency
    : "PHP";

  // Get location
  const location = event.details
    ? `${event.details.city}, ${event.details.state}`
    : "Location TBD";

  return (
    <Link href={`/venues/${event.id}`} className="group cursor-pointer block">
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-60"
          onClick={handleFavorite}
          disabled={favLoading}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-5 h-5 transition-colors ${isFavorited ? "fill-pink-500 text-pink-500" : "text-gray-700"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-pink-600 transition-colors">
            {event.title}
          </h3>
          {averageRating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 fill-current text-gray-900" />
              <span className="text-sm text-gray-900">{averageRating}</span>
            </div>
          )}
        </div>

        {/* Category */}
        {event.category && (
          <p className="text-sm text-gray-500">{event.category.name}</p>
        )}

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Price */}
        {price !== null && (
          <p className="text-gray-900">
            <span className="font-semibold">
              {currency === "PHP" ? "₱" : "$"}{price.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm"> / event</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
