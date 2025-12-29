"use client";
import { Heart, Star } from "lucide-react";
import Link from "next/link";
import { Venue } from "@/data/hardcodedVenues";
import { useSearchParams } from "next/navigation";

export default function ListingCard({ venue }: { venue: Venue }) {
  const searchParams = useSearchParams();
  
  // Preserve current search params when clicking details
  const detailsLink = `/venues/${venue.id}?${searchParams.toString()}`;

  return (
    <Link href={detailsLink} className="group cursor-pointer block w-full">
      
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md md:rounded-xl bg-gray-200 mb-1.5 md:mb-3">
        <img 
          src={venue.images[0]} 
          alt={venue.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Heart Icon: Smaller on mobile */}
        <button className="absolute top-1 right-1 md:top-3 md:right-3 p-1 rounded-full hover:bg-white/10 transition-colors">
          <Heart className="w-4 h-4 md:w-6 md:h-6 text-white fill-black/50 stroke-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col px-0.5">
        
        {/* Top Row: Title + Rating */}
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0 flex-1">
            {/* Title: Tiny on mobile */}
            <h3 className="font-semibold text-gray-900 text-[10px] md:text-sm truncate">
              {venue.title}
            </h3>
            {/* Category: Tiny on mobile */}
            <p className="text-gray-500 text-[9px] md:text-sm truncate">
              {venue.category}
            </p>
          </div>
          
          {/* Rating Star */}
          <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-black text-black" />
            <span className="text-[9px] md:text-sm font-light">{venue.rating}</span>
          </div>
        </div>
        
        {/* Price Row */}
        <div className="mt-0.5 md:mt-1 flex items-baseline gap-0.5">
          <span className="font-semibold text-gray-900 text-[10px] md:text-base">
            ₱{venue.price.toLocaleString()}
          </span>
          <span className="text-gray-500 text-[8px] md:text-sm font-light">
             night
          </span>
        </div>
      </div>
    </Link>
  );
}