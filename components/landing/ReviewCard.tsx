"use client";

import React from "react";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";

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
    <div className="bg-white border border-gray-100 rounded-[1.5rem] p-4 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      {/* User Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <img
          src={review.avatar}
          alt={review.author}
          className="w-9 h-9 rounded-full object-cover border border-gray-100"
        />
        <div>
          <h4 className="text-xs font-bold text-gray-700 leading-tight">
            {review.author}
          </h4>
          <p className="text-[9px] text-gray-500 font-medium">wrote a review</p>
        </div>
      </div>

      {/* Category & Rating */}
      <div className="mb-2.5">
        <h5 className="text-[10px] font-extrabold text-gray-700 mb-1 uppercase tracking-tight">
          {review.category}
        </h5>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < review.stars ? "bg-pink-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="text-[11px] text-gray-500 leading-relaxed mb-3 line-clamp-2 font-medium flex-1">
        {review.comment}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1 cursor-pointer hover:text-pink-500 transition-colors">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">{review.likes}</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-pink-500 transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">{review.comments}</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-pink-500 transition-colors">
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">{review.shares}</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
