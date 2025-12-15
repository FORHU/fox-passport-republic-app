import React from "react";
import Link from "next/link";
import ReviewSnippet from "./ReviewSnippet"; 

// Update ID to string to match your data
export interface ActivityData {
  id: string; 
  user: { name: string; image: string; action: string; time: string };
  business: { name: string; image?: string; rating: number; category: string };
  content: { text?: string; images?: string[] };
}

// Add 'variant' prop to control shape
interface BusinessCardProps {
  data: ActivityData;
  variant?: "square" | "wide" | "tall";
}

export default function BusinessCard({ data, variant = "square" }: BusinessCardProps) {
  const displayImage = data.content.images?.[0] || data.business.image || "/placeholder.jpg";

  // Dynamic aspect ratio based on variant
  const aspectClass = {
    square: "aspect-square",
    wide: "aspect-[2/1]",      // Wide rectangular
    tall: "aspect-[9/16] md:aspect-[1/2]" // Tall vertical
  }[variant];

  return (
    <Link href={`/venues/${data.id}`} className="group cursor-pointer flex flex-col gap-1 md:gap-2 bg-transparent w-full h-full">
      
      {/* --- IMAGE SECTION --- */}
      <div className={`relative w-full overflow-hidden rounded-md md:rounded-xl bg-gray-200 ${aspectClass}`}>
        <img 
          src={displayImage} 
          alt={data.business.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Heart Icon */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-1 right-1 md:top-2 md:right-2 p-1.5 rounded-full hover:bg-black/10 transition-colors z-10 group/heart"
        >
          <svg viewBox="0 0 32 32" className="w-4 h-4 md:w-5 md:h-5 fill-black/50 stroke-white stroke-[2px] group-hover/heart:fill-pink-500 group-hover/heart:stroke-pink-500 transition-colors">
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
          </svg>
        </button>
      </div>

      {/* --- INFO SECTION --- */}
      <div className="flex flex-col gap-0 px-0.5">
        <div className="flex justify-between items-start gap-1">
           <h3 className="font-bold text-gray-900 text-xs md:text-[15px] leading-tight group-hover:underline truncate w-full">
            {data.business.name}
           </h3>
           <div className="flex items-center gap-0.5 shrink-0 bg-gray-50 px-1 rounded-sm">
             <span className="text-[10px]">⭐</span>
             <span className="font-bold text-gray-900 text-[10px] md:text-[13px]">
               {data.business.rating.toFixed(1)}
             </span>
           </div>
        </div>
        <p className="text-gray-400 text-[10px] md:text-xs truncate">
          {data.business.category}
        </p>
        
        {/* Review Snippet */}
        <div className="mt-1">
          <ReviewSnippet user={data.user} content={data.content} />
        </div>
      </div>
    </Link>
  );
}