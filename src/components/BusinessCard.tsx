import React from "react";
import Link from "next/link"; // 1. Import Link
import ReviewSnippet from "./ReviewSnippet"; 

interface ActivityData {
  id: number; // 2. Add ID to interface so we can link to it
  user: { name: string; image: string; action: string; time: string };
  business: { name: string; image?: string; rating: number; category: string };
  content: { text?: string; images?: string[] };
}

export default function BusinessCard({ data }: { data: ActivityData }) {
  const displayImage = data.content.images?.[0] || data.business.image || "/placeholder.jpg";

  return (
    // 3. Changed <div> to <Link> and added href
    <Link href={`/venues/${data.id}`} className="group cursor-pointer flex flex-col gap-1 md:gap-2 bg-transparent w-full">
      
      {/* --- TOP: AIRBNB STYLE (Image + Heart) --- */}
      <div className="relative aspect-square w-full overflow-hidden rounded-md md:rounded-xl bg-gray-200">
        <img 
          src={displayImage} 
          alt={data.business.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Heart Icon (Prevent link click when clicking heart using e.preventDefault) */}
        <button 
          onClick={(e) => e.preventDefault()}
          className="absolute top-1 right-1 md:top-2 md:right-2 p-1 rounded-full hover:bg-black/10 transition-colors z-10"
        >
          <svg viewBox="0 0 32 32" className="w-4 h-4 md:w-5 md:h-5 fill-black/50 stroke-white stroke-[2px]">
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
          </svg>
        </button>
      </div>

      {/* --- MIDDLE: BUSINESS INFO --- */}
      <div className="flex flex-col gap-0 px-0.5">
        
        <div className="flex justify-between items-start gap-1">
           {/* Title */}
           <h3 className="font-bold text-gray-900 text-[10px] md:text-[15px] leading-tight group-hover:underline truncate w-full">
            {data.business.name}
           </h3>
           
           {/* Rating */}
           <div className="flex items-center gap-0.5 shrink-0 bg-gray-50 px-1 rounded-sm">
             <span className="text-[8px] md:text-[10px]">⭐</span>
             <span className="font-bold text-gray-900 text-[9px] md:text-[13px]">
               {data.business.rating.toFixed(1)}
             </span>
           </div>
        </div>

        {/* Category */}
        <p className="text-gray-400 text-[8px] md:text-[12px] truncate">
          {data.business.category}
        </p>

        {/* --- BOTTOM: YELP STYLE REVIEW --- */}
        <ReviewSnippet user={data.user} content={data.content} />
        
      </div>
    </Link>
  );
}