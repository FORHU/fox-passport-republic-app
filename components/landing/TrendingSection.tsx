"use client";

import React, { useMemo } from "react";
import ExperienceListing, { Experience } from "./ExperienceListing";
import { Review } from "./ReviewCard";
import { HARDCODED_VENUES } from "@/data/hardcodedVenues";

// Mock reviews data
const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Sarah K.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    category: "Cozy Retreat",
    stars: 5,
    comment:
      "So cozy! The real fireplace was the highlight. Perfect for cold Baguio nights with hot chocolate and good books.",
    likes: 38,
    comments: 6,
    shares: 18,
  },
  {
    id: "r2",
    author: "Miguel T.",
    avatar: "https://i.pravatar.cc/150?u=miguel",
    category: "Nightlife Experience",
    stars: 5,
    comment:
      "The nightlife here is amazing. Great food! Walking distance to all the local bars and restaurants in Poblacion.",
    likes: 42,
    comments: 8,
    shares: 20,
  },
  {
    id: "r3",
    author: "Anna R.",
    avatar: "https://i.pravatar.cc/150?u=anna",
    category: "Urban Living",
    stars: 4,
    comment:
      "Modern and stylish loft. Can get noisy on weekends but that's part of the Poblacion experience! Still loved it.",
    likes: 18,
    comments: 3,
    shares: 12,
  },
  {
    id: "r4",
    author: "Chris D.",
    avatar: "https://i.pravatar.cc/150?u=chris",
    category: "Island Paradise",
    stars: 5,
    comment:
      "Eco-friendly bamboo construction with modern comforts. The host's island hopping recommendations were spot on!",
    likes: 30,
    comments: 7,
    shares: 18,
  },
];

const TrendingSection: React.FC = () => {
  // Get 4 random venues from hardcoded data and transform them to Experience format
  const trendingExperiences = useMemo(() => {
    const shuffled = [...HARDCODED_VENUES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    return selected.map((venue, index): Experience => ({
      id: venue.id,
      category: venue.category,
      title: venue.title,
      location: venue.location,
      guests: venue.guestCount,
      bedrooms: venue.bedroomCount,
      type: venue.category,
      dateRange: "Jan 18 - 24",
      totalNights: Math.floor(Math.random() * 5) + 3,
      pricePerStay: `₱${venue.price.toLocaleString()}`,
      rating: venue.rating,
      imageUrl: venue.images[0],
      reviews: MOCK_REVIEWS.slice(0, index === 0 || index === 3 ? 4 : 2).map(
        (r, i) => ({
          ...r,
          id: `${venue.id}-review-${i}`,
        })
      ),
    }));
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-primary font-extrabold text-xs uppercase tracking-[0.2em] mb-3 block">
              Top Picks
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Trending Experiences
            </h2>
            <p className="text-gray-500 text-lg">
              Curated selections with real feedback from our community.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {/* First experience - vertical layout (large image + 4 reviews) */}
          <ExperienceListing
            experience={trendingExperiences[0]}
            orientation="vertical"
          />

          {/* Two experiences side by side - horizontal layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExperienceListing
              experience={trendingExperiences[1]}
              orientation="horizontal"
            />
            <ExperienceListing
              experience={trendingExperiences[2]}
              orientation="horizontal"
            />
          </div>

          {/* Fourth experience - vertical layout */}
          <ExperienceListing
            experience={trendingExperiences[3]}
            orientation="vertical"
          />
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
