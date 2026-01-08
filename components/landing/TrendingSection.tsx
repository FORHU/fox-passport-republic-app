"use client";

import React, { useMemo } from "react";
import ExperienceListing, { Experience } from "./ExperienceListing";
import { Review } from "./ReviewCard";
import { HARDCODED_VENUES } from "@/data/hardcodedVenues";

// Mock reviews data - aligned with new category system
const ALL_REVIEWS: Review[] = [
  // Set 1 - For first experience
  {
    id: "r1",
    author: "Sarah K.",
    avatar: "https://i.pravatar.cc/150?u=sarah101",
    category: "Festivals & Fairs",
    stars: 5,
    comment:
      "The music festival was incredible! Amazing lineup and the venue atmosphere was electric. Best weekend ever!",
    likes: 38,
    comments: 6,
    shares: 18,
  },
  {
    id: "r2",
    author: "Miguel T.",
    avatar: "https://i.pravatar.cc/150?u=miguel202",
    category: "Live Performances",
    stars: 5,
    comment:
      "The acoustic night was magical. Intimate venue, talented artists, and perfect sound quality throughout.",
    likes: 42,
    comments: 8,
    shares: 20,
  },
  {
    id: "r3",
    author: "Anna R.",
    avatar: "https://i.pravatar.cc/150?u=anna303",
    category: "Classes & Workshops",
    stars: 4,
    comment:
      "Learned so much in the cooking class! Hands-on experience with professional chefs. Will definitely come back.",
    likes: 18,
    comments: 3,
    shares: 12,
  },
  // Set 2 - For second experience
  {
    id: "r4",
    author: "Chris D.",
    avatar: "https://i.pravatar.cc/150?u=chris404",
    category: "Tours & Excursions",
    stars: 5,
    comment:
      "The hiking tour was well-organized and breathtaking. Our guide was knowledgeable and made it fun for everyone!",
    likes: 30,
    comments: 7,
    shares: 18,
  },
  {
    id: "r5",
    author: "Liza M.",
    avatar: "https://i.pravatar.cc/150?u=liza505",
    category: "Parties & Socials",
    stars: 5,
    comment:
      "Best networking event I've attended! Met amazing people and the venue vibe was perfect for socializing.",
    likes: 56,
    comments: 12,
    shares: 24,
  },
  {
    id: "r6",
    author: "Daniel P.",
    avatar: "https://i.pravatar.cc/150?u=daniel606",
    category: "Competitions & Games",
    stars: 4,
    comment:
      "The trivia night was competitive and fun! Great prizes and the host kept the energy high all night.",
    likes: 29,
    comments: 5,
    shares: 15,
  },
  // Set 3 - For third experience
  {
    id: "r7",
    author: "Jessica L.",
    avatar: "https://i.pravatar.cc/150?u=jessica707",
    category: "Markets & Pop-Ups",
    stars: 5,
    comment:
      "Found unique handmade items at the craft fair. Supporting local artists while shopping was so fulfilling!",
    likes: 47,
    comments: 9,
    shares: 21,
  },
  {
    id: "r8",
    author: "Marco S.",
    avatar: "https://i.pravatar.cc/150?u=marco808",
    category: "Classes & Workshops",
    stars: 5,
    comment:
      "The painting workshop exceeded expectations. Great instructor and left with a piece I'm proud of!",
    likes: 33,
    comments: 4,
    shares: 16,
  },
  {
    id: "r9",
    author: "Kim C.",
    avatar: "https://i.pravatar.cc/150?u=kim909",
    category: "Live Performances",
    stars: 5,
    comment:
      "The theater production was world-class! Stunning performances and beautiful stage design throughout.",
    likes: 64,
    comments: 14,
    shares: 32,
  },
];

const TrendingSection: React.FC = () => {
  // Get 4 random venues from hardcoded data and transform them to Experience format
  const trendingExperiences = useMemo(() => {
    const shuffled = [...HARDCODED_VENUES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    return selected.map((venue, index): Experience => {
      // Each experience gets exactly 3 reviews (maximum)
      const reviewStartIndex = (index * 3) % ALL_REVIEWS.length;
      const venueReviews = ALL_REVIEWS.slice(
        reviewStartIndex,
        reviewStartIndex + 3
      ).map((r, i) => ({
        ...r,
        id: `${venue.id}-review-${i}`,
      }));

      return {
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
        reviews: venueReviews,
      };
    });
  }, []);

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Top Picks</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Trending <span className="text-gradient">Experiences</span>
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Curated selections with real feedback from our community.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* First experience - vertical layout (large image + 3 reviews) */}
          <ExperienceListing
            experience={trendingExperiences[0]}
            orientation="vertical"
          />

          {/* Two experiences side by side - horizontal layout (3 reviews each) */}
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

          {/* Fourth experience - vertical layout (3 reviews) */}
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
