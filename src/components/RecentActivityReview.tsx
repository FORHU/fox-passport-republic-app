import React from "react";

export interface ReviewCardData {
  id: string;
  user: { 
    name: string; 
    avatar: string; 
  };
  title: string;
  status: string;
  price: string;
  description: string;
  image?: string;
  likes: number;
  comments: number;
  helpful: number;
  time?: string;
}

interface ReviewCardProps {
  review: ReviewCardData;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full p-3 md:p-4">
      
      {/* User Header - Compacted for 260px */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <img 
          src={review.user.avatar} 
          alt={review.user.name}
          className="w-7 h-7 rounded-full object-cover border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{review.user.name}</p>
          <p className="text-[11px] text-gray-400 leading-none">wrote a review</p>
        </div>
      </div>

      {/* Title & Rating */}
      <div className="mb-2 flex-shrink-0">
        <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1 line-clamp-1">{review.title}</h4>
        <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            ))}
        </div>
      </div>
      
      {/* Description - Optimized for 260px height (approx 5-6 lines) */}
      <div className="flex-1 min-h-0 mb-2 relative">
          <p className="text-xs md:text-[13px] text-gray-600 leading-relaxed line-clamp-5 md:line-clamp-6 text-ellipsis">
            {review.description}
          </p>
      </div>
      
      {/* Read more link */}
      <button className="text-xs text-blue-500 hover:underline text-left mb-2 block flex-shrink-0">
        Read more
      </button>
      
      {/* Actions Footer - Compact & Pinned */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 mt-auto flex-shrink-0">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1 hover:text-gray-600 cursor-pointer transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {review.likes}
          </span>
          <span className="flex items-center gap-1 hover:text-gray-600 cursor-pointer transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {review.comments}
          </span>
          <span className="flex items-center gap-1 hover:text-gray-600 cursor-pointer transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {review.helpful}
          </span>
        </div>
      </div>
    </div>
  );
}