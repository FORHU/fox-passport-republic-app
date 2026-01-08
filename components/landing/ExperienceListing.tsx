"use client";

import React, { useState } from "react";
import Link from "next/link";
import ReviewCard, { Review } from "./ReviewCard";

export interface Experience {
  id: string;
  category: string;
  title: string;
  location: string;
  guests: number;
  bedrooms: number;
  type: string;
  dateRange: string;
  totalNights: number;
  pricePerStay: string;
  rating: number;
  imageUrl: string;
  reviews: Review[];
}

interface ExperienceListingProps {
  experience: Experience;
  orientation?: "vertical" | "horizontal";
}

const ExperienceListing: React.FC<ExperienceListingProps> = ({
  experience,
  orientation = "vertical",
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`grid ${
        isVertical ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"
      } gap-6 items-stretch p-6 glass-card rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all reveal-on-scroll`}
    >
      {/* Main Image Block */}
      <div
        className={`relative ${
          isVertical ? "lg:col-span-1" : "lg:col-span-1"
        } min-h-[400px] lg:min-h-[500px] rounded-3xl overflow-hidden shadow-2xl group`}
      >
        <Link href={`/venues/${experience.id}`} className="absolute inset-0">
          <img
            src={experience.imageUrl}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={experience.title}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </Link>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-6 right-6 w-12 h-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/20 transition-all group/fav z-10"
        >
          <span
            className={`material-symbols-outlined text-[24px] transition-all ${
              isFavorite ? "fill-current text-secondary" : ""
            } group-hover/fav:scale-110`}
          >
            favorite
          </span>
        </button>

        {/* Floating Info Card */}
        <div className="absolute bottom-6 left-6 right-6 glass-panel p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-base font-display font-bold text-white line-clamp-1 flex-1">
              {experience.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm font-bold text-white bg-accent/20 px-2.5 py-1 rounded-full ml-2">
              <span className="material-symbols-outlined text-accent text-[18px] fill-current">star</span>
              <span className="text-white">{experience.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-xs text-text-muted font-medium mb-3 space-y-1">
            <div>
              <span className="text-white font-semibold">{experience.guests}</span> guests · <span className="text-white font-semibold">{experience.bedrooms}</span> bedrooms
            </div>
            <div>
              {experience.type} · {experience.location}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted mb-3">
            <span className="material-symbols-outlined text-accent text-[16px]">calendar_month</span>
            {experience.dateRange}
          </div>
          <div className="flex items-baseline gap-2 pt-3 border-t border-white/10">
            <span className="text-xl font-display font-bold text-white">
              {experience.pricePerStay}
            </span>
            <span className="text-xs text-text-muted font-medium">
              for {experience.totalNights} nights
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div
        className={`${
          isVertical ? "lg:col-span-2" : "lg:col-span-1"
        } flex flex-col justify-between`}
      >
        <div
          className={`grid ${
            isVertical ? "grid-cols-1" : "grid-cols-1"
          } gap-4 content-start`}
        >
          {experience.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceListing;
