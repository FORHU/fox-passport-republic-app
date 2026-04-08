import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface VenueCardProps {
  venue: {
    id: string;
    title: string;
    images: string[];
    category: string;
    location: string;
    rating: number;
    reviews: number;
  };
}

export function ReviewVenueCard({ venue }: VenueCardProps) {
  return (
    <Link
      href={`/reviews/write/${venue.id}`}
      className="group bg-white rounded-xl border-2 border-gray-200 hover:border-pink-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Venue Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <Image
          src={venue.images[0]}
          alt={venue.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Venue Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
          {venue.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">
            {venue.category}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {venue.location}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < Math.floor(venue.rating) ? 'bg-pink-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {venue.rating} ({venue.reviews} reviews)
          </span>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-gray-700 font-semibold">
            Do you recommend this business?
          </p>
        </div>
      </div>
    </Link>
  );
}
