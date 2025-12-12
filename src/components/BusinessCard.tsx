import React from "react";

interface ActivityData {
  user: { name: string; image: string; action: string; time: string };
  business: { name: string; image?: string; rating: number; category: string };
  content: { text?: string; images?: string[] };
}

export default function BusinessCard({ data }: { data: ActivityData }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow h-full">
      
      {/* 1. Header: Ultra Compact (Smaller padding & avatar) */}
      <div className="p-2 flex items-center gap-2 border-b border-gray-50">
        <img 
          src={data.user.image} 
          alt={data.user.name} 
          className="w-6 h-6 rounded-full object-cover" 
        />
        <div className="flex flex-col leading-none">
          <div className="text-[11px] font-bold text-[#0073bb]">
            {data.user.name} <span className="text-gray-500 font-normal">{data.user.action}</span>
          </div>
          <span className="text-[9px] text-gray-400 mt-0.5">{data.user.time}</span>
        </div>
      </div>

      {/* 2. Media Area: Short Height (h-24 / 96px) */}
      <div className="w-full h-24 relative bg-gray-100">
        {data.content.images ? (
          <div className="grid grid-cols-2 h-full w-full gap-0.5">
            {data.content.images.slice(0, 2).map((img, idx) => (
              <img key={idx} src={img} className="w-full h-full object-cover" alt="activity" />
            ))}
          </div>
        ) : (
          <img 
            src={data.business.image || "/placeholder.jpg"} 
            alt={data.business.name} 
            className="w-full h-full object-cover" 
          />
        )}
      </div>

      {/* 3. Content: Minimal Padding & Text */}
      <div className="p-2 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xs font-bold text-[#0073bb] truncate max-w-[70%]">
            {data.business.name}
          </h3>
          {/* Rating Stars */}
          <div className="flex text-orange-400 text-[9px]">
             {[...Array(5)].map((_, i) => (
               <span key={i} className={i < data.business.rating ? "opacity-100" : "opacity-30"}>★</span>
             ))}
          </div>
        </div>

        {/* Category */}
        <div className="text-[10px] text-gray-400 mb-1.5 -mt-1">
          {data.business.category}
        </div>

        {/* Text Description: Max 2 lines, very small text */}
        {data.content.text && (
          <p className="text-[11px] text-gray-600 line-clamp-2 leading-snug">
            {data.content.text}
          </p>
        )}
      </div>

      {/* 4. Footer: Tiny Icons */}
      <div className="px-2 py-1.5 border-t border-gray-100 flex gap-3 text-gray-400 text-[10px] mt-auto bg-gray-50/50">
        <span className="cursor-pointer hover:text-gray-600 flex items-center gap-1">
          💡 Useful
        </span>
        <span className="cursor-pointer hover:text-gray-600 flex items-center gap-1">
          🙂 Funny
        </span>
        <span className="cursor-pointer hover:text-gray-600 flex items-center gap-1">
          ❤️ Love
        </span>
      </div>
    </div>
  );
}