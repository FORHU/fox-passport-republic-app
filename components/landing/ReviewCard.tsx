"use client";

import React from "react";

export interface Review {
  id: string;
  author: string;
  avatar: string;
  category: string;
  stars: number;
  comment: string;
  likes: number;
  comments: number;
  shares: number;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all h-full flex flex-col group">
      {/* User Header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={review.avatar}
          alt={review.author}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-accent/30 transition-all"
        />
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">
            {review.author}
          </h4>
          <p className="text-[10px] text-text-muted font-medium">wrote a review</p>
        </div>
      </div>

      {/* Category & Rating */}
      <div className="mb-3">
        <h5 className="text-[11px] font-bold text-accent mb-2 uppercase tracking-wide">
          {review.category}
        </h5>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < review.stars ? "bg-accent shadow-[0_0_8px_rgba(204,255,0,0.5)]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-3 font-normal flex-1">
        {review.comment}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 text-text-muted pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-accent transition-colors group/action">
          <span className="material-symbols-outlined text-[18px] group-hover/action:scale-110 transition-transform">thumb_up</span>
          <span className="text-xs font-bold">{review.likes}</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors group/action">
          <span className="material-symbols-outlined text-[18px] group-hover/action:scale-110 transition-transform">chat_bubble</span>
          <span className="text-xs font-bold">{review.comments}</span>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-secondary transition-colors group/action">
          <span className="material-symbols-outlined text-[18px] group-hover/action:scale-110 transition-transform">share</span>
          <span className="text-xs font-bold">{review.shares}</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
