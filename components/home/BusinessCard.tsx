import React from "react";
import Link from "next/link";

export interface ActivityData {
  id: string; 
  user: { name: string; image: string; action: string; time: string };
  business: { name: string; image?: string; rating: number; category: string; location: string; details: string };
  content: { text?: string; images?: string[] };
}

interface BusinessCardProps {
  data: ActivityData;
}

export default function BusinessCard({ data }: BusinessCardProps) {
  const displayImage = data.content.images?.[0] || data.business.image || "/placeholder.jpg";

  return (
    <Link 
      href={`/venues/${data.id}`} 
      className="group cursor-pointer flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 h-full"
    >
      {/* IMAGE SECTION */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
        <img 
          src={displayImage} 
          alt={data.business.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Heart Icon */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors z-10 group/heart shadow-md"
        >
          <svg viewBox="0 0 32 32" className="w-5 h-5 fill-transparent stroke-gray-700 stroke-[2px] group-hover/heart:fill-pink-500 group-hover/heart:stroke-pink-500 transition-colors">
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
          </svg>
        </button>

        {/* Guest Favorite Badge (if high rating) */}
        {data.business.rating >= 4.9 && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-gray-900">Guest favorite</span>
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Title and Rating */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:underline flex-1">
            {data.business.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-sm">⭐</span>
            <span className="font-semibold text-gray-900 text-sm">
              {data.business.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Category/Type */}
        <p className="text-gray-600 text-sm">
          {data.business.category}
        </p>

        {/* Location and Details */}
        <p className="text-gray-500 text-sm">
          {data.business.location} · {data.business.details}
        </p>

        {/* User Review Info */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
          <img 
            src={data.user.image} 
            alt={data.user.name} 
            className="w-6 h-6 rounded-full object-cover border border-gray-200" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700 font-medium truncate">
              {data.user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {data.user.action}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}