'use client';

import React from 'react';
import { Star } from 'lucide-react';

const REVIEW_CATEGORIES = [
  { id: 'food', label: 'Food' },
  { id: 'service', label: 'Service' },
  { id: 'ambiance', label: 'Ambiance' },
];

interface StarRatingProps {
  rating: number;
  hoveredRating: number;
  onRate: (rating: number) => void;
  onHover: (rating: number) => void;
  onLeave: () => void;
}

export function StarRating({ rating, hoveredRating, onRate, onHover, onLeave }: StarRatingProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        How would you rate your experience?
      </h2>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-10 h-10 md:w-12 md:h-12 ${
                star <= (hoveredRating || rating)
                  ? 'fill-pink-500 text-pink-500'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-sm text-gray-600 mt-2">
          Select your rating: {rating} star{rating !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

interface CategoryTagsProps {
  selectedCategories: string[];
  onToggle: (category: string) => void;
}

export function CategoryTags({ selectedCategories, onToggle }: CategoryTagsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        A few things to consider
      </h2>
      <div className="flex flex-wrap gap-3">
        {REVIEW_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onToggle(category.label)}
            className={`px-5 py-2.5 rounded-full border-2 font-semibold transition-all ${
              selectedCategories.includes(category.label)
                ? 'bg-pink-500 border-pink-500 text-white'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RecentReviews() {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sticky top-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent reviews</h2>
      <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p>
    </div>
  );
}
