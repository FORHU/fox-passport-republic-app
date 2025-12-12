import React from "react";

interface ActivityData {
  user: { name: string; image: string; action: string; time: string };
  business: { name: string; image?: string; rating: number; category: string };
  content: { text?: string; images?: string[] };
}

export default function BusinessCard({ data }: { data: ActivityData }) {
  // Use the first image from content, or fallback to business image
  const displayImage = data.content.images?.[0] || data.business.image || "/placeholder.jpg";

  return (
    <div className="group cursor-pointer flex flex-col gap-2 bg-transparent w-full">
      
      {/* 1. IMAGE AREA (Relative for overlays) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-200">
        
        {/* Main Image */}
        <img 
          src={displayImage} 
          alt={data.business.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />

        {/* OVERLAY: Top Left Badge (User Info) */}
        {/* Mimics the white 'Guest favorite' badge style */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md pl-1 pr-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-2 transition-transform hover:scale-105">
           <img src={data.user.image} className="w-5 h-5 rounded-full object-cover" alt="User" />
           <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase">
             {data.user.action}
           </span>
        </div>

        {/* OVERLAY: Top Right Heart Icon */}
        <button className="absolute top-3 right-3 p-1 transition-transform hover:scale-110 active:scale-95">
          <svg 
            viewBox="0 0 32 32" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-6 h-6 fill-black/50 stroke-white stroke-[2px]"
            style={{ overflow: 'visible' }}
          >
            <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
          </svg>
        </button>

      </div>

      {/* 2. TEXT CONTENT */}
      <div className="flex justify-between items-start mt-1 px-1">
        
        <div className="flex flex-col gap-0.5">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-[15px] leading-tight group-hover:underline">
            {data.business.name}
          </h3>
          {/* Category */}
          <p className="text-gray-500 text-[13px]">
            {data.business.category}
          </p>
          {/* Time / Status */}
          <p className="text-gray-900 font-medium text-[13px] mt-0.5">
            {data.user.time}
          </p>
        </div>

        {/* Rating Star */}
        <div className="flex items-center gap-1 text-[13px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-black">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          <span className="font-light text-gray-900">{data.business.rating.toFixed(1)}</span>
        </div>
      </div>

    </div>
  );
}