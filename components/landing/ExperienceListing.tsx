"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
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
        isVertical ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
      } gap-4 items-stretch p-4 bg-gray-50/30 border border-gray-100 rounded-[2.5rem]`}
    >
      {/* Main Image Block */}
      <div
        className={`relative ${
          isVertical ? "md:col-span-1" : "md:col-span-1"
        } min-h-[350px] rounded-[2rem] overflow-hidden shadow-lg group`}
      >
        <Link href={`/venues/${experience.id}`} className="absolute inset-0">
          <img
            src={experience.imageUrl}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt={experience.title}
          />
        </Link>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/20 transition-all"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? "fill-pink-500 text-pink-500" : ""
            }`}
          />
        </button>

        {/* Floating Info Card */}
        <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-5 rounded-[1.5rem] shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-extrabold text-gray-700 line-clamp-1">
              {experience.title}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <Star className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              {experience.rating.toFixed(1)}
            </div>
          </div>
          <div className="text-[11px] text-gray-500 font-semibold mb-3">
            {experience.guests} guests &bull; {experience.bedrooms} bedrooms
            <br />
            {experience.type} &mdash; {experience.location}
          </div>
          <div className="text-[11px] font-bold text-gray-700 mb-1">
            {experience.dateRange}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-gray-700">
              {experience.pricePerStay}
            </span>
            <span className="text-[10px] text-gray-500 font-bold">
              for {experience.totalNights} nights
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div
        className={`${
          isVertical ? "md:col-span-2" : "md:col-span-1"
        } flex flex-col`}
      >
        <div
          className={`grid ${
            isVertical ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          } gap-4 h-full auto-rows-fr`}
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
