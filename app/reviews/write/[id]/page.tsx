"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Star, ArrowLeft } from "lucide-react";
import { getVenueById } from "@/data/hardcodedVenues";
import Image from "next/image";

export default function WriteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  const venue = getVenueById(venueId);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = ["Food", "Service", "Ambiance"];

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Venue not found</h1>
          <button
            onClick={() => router.push("/reviews/select")}
            className="text-pink-600 hover:text-pink-700 font-semibold"
          >
            ← Back to venue selection
          </button>
        </div>
      </div>
    );
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI demonstration only - show success message
    toast.success("Thank you for your review!");
    router.push("/reviews/select");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {venue.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{venue.location}, {venue.province}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    How would you rate your experience?
                  </h2>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 md:w-12 md:h-12 ${
                            star <= (hoveredRating || rating)
                              ? "fill-pink-500 text-pink-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Select your rating: {rating} star{rating !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {/* Category Tags */}
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    A few things to consider
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-5 py-2.5 rounded-full border-2 font-semibold transition-all ${
                          selectedCategories.includes(category)
                            ? "bg-pink-500 border-pink-500 text-white"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

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
                  disabled={rating === 0 || reviewText.length < 50}
                  className="w-full md:w-auto px-8 py-3.5 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  Post Review
                </button>
              </form>
            </div>
          </div>

          {/* Right: Recent Reviews */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent reviews</h2>
              
              {/* Mock Reviews */}
              <div className="space-y-6">
                {[
                  {
                    user: { name: "Rocco B.", avatar: "https://i.pravatar.cc/150?u=1" },
                    rating: 5,
                    date: "Oct 7, 2025",
                    text: "This is the Tony's Slice House of the East Bay. The pizza is phenomenal and so glad to have found a place like this in Albany when I'm craving 'the good stuff'.",
                  },
                  {
                    user: { name: "Elle D.", avatar: "https://i.pravatar.cc/150?u=2" },
                    rating: 5,
                    date: "Dec 16, 2025",
                    text: "I read about Raymond's on a Bay Area Reddit post. Rating a coconut slice of champorado. Nilagang and Gata. I was excited to try some gourmet pizza...",
                  },
                ].map((review, idx) => (
                  <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3 mb-3">
                      <Image
                        src={review.user.avatar}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{review.user.name}</p>
                        <div className="flex gap-1 my-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-pink-500 text-pink-500"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
