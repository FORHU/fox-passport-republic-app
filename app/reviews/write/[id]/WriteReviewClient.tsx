'use client';

import React from "react";
import { MapPin, ArrowLeft } from "lucide-react";
import { useWriteReview } from "@/hooks/reviews/useWriteReview";
import { StarRating, CategoryTags, RecentReviews } from "@/components/reviews";

interface WriteReviewClientProps {
  venue: any;
}

export default function WriteReviewClient({ venue }: WriteReviewClientProps) {
  const {
    rating,
    hoveredRating,
    reviewText,
    selectedCategories,
    isValid,
    setRating,
    setHoveredRating,
    setReviewText,
    toggleCategory,
    handleBack,
    handleSubmit,
  } = useWriteReview(venue.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Review Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8">
              {/* Venue Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>
                    {venue.city}, {venue.country || 'PH'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <StarRating
                  rating={rating}
                  hoveredRating={hoveredRating}
                  onRate={setRating}
                  onHover={setHoveredRating}
                  onLeave={() => setHoveredRating(0)}
                />

                <CategoryTags
                  selectedCategories={selectedCategories}
                  onToggle={toggleCategory}
                />

                {/* Review Text */}
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    Tell us about your experience
                  </h2>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Start your review..."
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:outline-none text-gray-700 resize-none"
                    required
                    minLength={50}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {reviewText.length} characters (minimum 50 required)
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isValid}
                  className="w-full md:w-auto px-8 py-3.5 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          {/* Right: Recent Reviews */}
          <div className="lg:col-span-1">
            <RecentReviews />
          </div>
        </div>
      </div>
    </div>
  );
}