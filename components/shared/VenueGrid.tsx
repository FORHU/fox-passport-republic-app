"use client";

import React from "react";
import ListingCard from "@/components/landing/ListingCard";
import { Venue } from "@/data/hardcodedVenues";

interface VenueGridProps {
  venues: Venue[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

const VenueGrid: React.FC<VenueGridProps> = ({ 
  venues, 
  title, 
  subtitle,
  emptyMessage = "No results found. Try a different category or location."
}) => {
  return (
      <div className="overflow-y-auto pr-1 md:pr-2 custom-scrollbar h-full">
        {(title || subtitle) && (
            <div className="mb-4 md:mb-6 px-1">
              {title && <h2 className="text-lg md:text-xl font-bold mb-1">{title}</h2>}
              {subtitle && <p className="text-gray-500 text-xs md:text-sm">{subtitle}</p>}
            </div>
        )}

        {venues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {venues.map((venue) => (
              <ListingCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900">No results found</h3>
            <p className="text-gray-500 max-w-xs mt-2 text-sm">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
  );
};

export default VenueGrid;
