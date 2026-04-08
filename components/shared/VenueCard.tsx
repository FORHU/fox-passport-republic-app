import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Star } from "lucide-react";
import { Venue } from "@/hooks/venues/useVenuesByCategory";

interface VenueCardProps {
  venue: Venue;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const primaryImage = venue.images.find((img) => img.isPrimary);
  const imageUrl = primaryImage?.imageUrl || venue.images[0]?.imageUrl || "/placeholder-venue.jpg";
  const pricePerDay = venue.pricing[0]?.pricePerDay || 0;
  const currency = venue.pricing[0]?.currency || "PHP";

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-pink-100"
    >
      {/* Image */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={venue.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status Badge */}
        {venue.status === "active" && venue.isPublished && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Venue Type & Category */}
        <div className="flex items-center gap-2 mb-2">
          {venue.category && (
            <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-md">
              {venue.category.name}
            </span>
          )}
          <span className="text-xs text-gray-500 capitalize">
            {venue.venueType.replace(/_/g, " ")}
          </span>
        </div>

        {/* Venue Name */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-pink-600 transition-colors">
          {venue.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {venue.description}
        </p>

        {/* Location & Capacity */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{venue.city}, {venue.state}</span>
          </div>
          {venue.capacity && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{venue.capacity}</span>
            </div>
          )}
        </div>

        {/* Host */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {venue.host.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-gray-500">Hosted by</p>
              <p className="text-sm font-medium text-gray-900">{venue.host.name}</p>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-xs text-gray-500">From</p>
            <p className="text-lg font-bold text-pink-600">
              {currency} {pricePerDay.toLocaleString()}
              <span className="text-xs font-normal text-gray-500">/day</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
