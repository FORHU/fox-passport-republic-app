import React from "react";

interface ReviewProps {
  user: { name: string; image: string; action: string };
  content: { text?: string; images?: string[] };
}

export default function ReviewSnippet({ user, content }: ReviewProps) {
  // If there's no text content (e.g. just a photo upload), show a generic message
  const textToShow = content.text || `Added ${content.images?.length || 1} photo(s)`;

  return (
    <div className="mt-1 flex flex-col gap-0.5">
      
      {/* User Row: Avatar + Name */}
      <div className="flex items-center gap-1 opacity-90">
        <img 
          src={user.image} 
          alt={user.name} 
          className="w-3 h-3 md:w-4 md:h-4 rounded-full object-cover border border-gray-100" 
        />
        <span className="text-[8px] md:text-[11px] font-bold text-gray-700 truncate max-w-[80px]">
          {user.name}
        </span>
      </div>

      {/* Review Text (Clamped to 2 lines) */}
      <p className="text-[8px] md:text-[12px] text-gray-500 leading-tight line-clamp-2">
        "{textToShow}"
      </p>
      
      {/* Reaction/Footer (Visual flair like Yelp) */}
      <div className="flex items-center gap-1 mt-0.5">
         <span className="text-[7px] md:text-[10px] text-gray-400 font-medium">
            {user.action}
         </span>
      </div>
    </div>
  );
}