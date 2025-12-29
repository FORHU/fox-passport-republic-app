"use client";

import React, { useMemo } from "react";
import ExperienceListing, { Experience } from "./ExperienceListing";
import { Review } from "./ReviewCard";
import { HARDCODED_VENUES } from "@/data/hardcodedVenues";

// Extended mock reviews data - 16 unique reviewers for variety
const ALL_REVIEWS: Review[] = [
  // Set 1 - For first venue
  {
    id: "r1",
    author: "Sarah K.",
    avatar: "https://i.pravatar.cc/150?u=sarah101",
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
    avatar: "https://i.pravatar.cc/150?u=miguel202",
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
    avatar: "https://i.pravatar.cc/150?u=anna303",
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
    avatar: "https://i.pravatar.cc/150?u=chris404",
    category: "Island Paradise",
    stars: 5,
    comment:
      "Eco-friendly bamboo construction with modern comforts. The host's island hopping recommendations were spot on!",
    likes: 30,
    comments: 7,
    shares: 18,
  },
  // Set 2 - For second venue
  {
    id: "r5",
    author: "Liza M.",
    avatar: "https://i.pravatar.cc/150?u=liza505",
    category: "Beach Vibes",
    stars: 5,
    comment:
      "Woke up to stunning ocean views every morning. The private beach access made this trip unforgettable!",
    likes: 56,
    comments: 12,
    shares: 24,
  },
  {
    id: "r6",
    author: "Daniel P.",
    avatar: "https://i.pravatar.cc/150?u=daniel606",
    category: "Adventure Ready",
    stars: 4,
    comment:
      "Perfect base camp for island hopping. The kayaks and snorkeling gear provided were a great bonus!",
    likes: 29,
    comments: 5,
    shares: 15,
  },
  // Set 3 - For third venue
  {
    id: "r7",
    author: "Jessica L.",
    avatar: "https://i.pravatar.cc/150?u=jessica707",
    category: "Mountain Escape",
    stars: 5,
    comment:
      "The fog rolling through the pine trees in the morning was magical. Best coffee I've ever had up there!",
    likes: 47,
    comments: 9,
    shares: 21,
  },
  {
    id: "r8",
    author: "Marco S.",
    avatar: "https://i.pravatar.cc/150?u=marco808",
    category: "Peaceful Stay",
    stars: 5,
    comment:
      "Finally found a place where I could disconnect. No WiFi was actually a blessing in disguise.",
    likes: 33,
    comments: 4,
    shares: 16,
  },
  // Set 4 - For fourth venue
  {
    id: "r9",
    author: "Kim C.",
    avatar: "https://i.pravatar.cc/150?u=kim909",
    category: "Luxury Experience",
    stars: 5,
    comment:
      "The infinity pool overlooking the rice terraces was breathtaking. Worth every peso!",
    likes: 64,
    comments: 14,
    shares: 32,
  },
  {
    id: "r10",
    author: "Paolo G.",
    avatar: "https://i.pravatar.cc/150?u=paolo010",
    category: "Cultural Immersion",
    stars: 5,
    comment:
      "The host arranged a traditional cooking class with locals. Such an authentic experience!",
    likes: 51,
    comments: 11,
    shares: 27,
  },
  {
    id: "r11",
    author: "Mia V.",
    avatar: "https://i.pravatar.cc/150?u=mia111",
    category: "Family Friendly",
    stars: 4,
    comment:
      "Kids loved the treehouse! Safe area for children to explore. Will definitely come back.",
    likes: 39,
    comments: 7,
    shares: 19,
  },
  {
    id: "r12",
    author: "Bryan A.",
    avatar: "https://i.pravatar.cc/150?u=bryan212",
    category: "Romantic Getaway",
    stars: 5,
    comment:
      "Proposed to my girlfriend here during sunset. She said yes! The ambiance was perfect.",
    likes: 88,
    comments: 23,
    shares: 45,
  },
  // Extra reviews for more variety
  {
    id: "r13",
    author: "Carla J.",
    avatar: "https://i.pravatar.cc/150?u=carla313",
    category: "Solo Travel",
    stars: 5,
    comment:
      "As a solo traveler, I felt completely safe here. Met amazing people at the communal breakfast!",
    likes: 44,
    comments: 8,
    shares: 22,
  },
  {
    id: "r14",
    author: "Renz B.",
    avatar: "https://i.pravatar.cc/150?u=renz414",
    category: "Work Remote",
    stars: 4,
    comment:
      "Fast WiFi and quiet workspace. Perfect for digital nomads. The coffee shop downstairs is a bonus!",
    likes: 36,
    comments: 6,
    shares: 17,
  },
  {
    id: "r15",
    author: "Nina F.",
    avatar: "https://i.pravatar.cc/150?u=nina515",
    category: "Wellness Retreat",
    stars: 5,
    comment:
      "The in-house spa and yoga sessions were incredible. Left feeling completely rejuvenated.",
    likes: 52,
    comments: 10,
    shares: 26,
  },
  {
    id: "r16",
    author: "Jake H.",
    avatar: "https://i.pravatar.cc/150?u=jake616",
    category: "Group Trip",
    stars: 5,
    comment:
      "Brought 8 friends for a birthday celebration. The space was perfect and the host was so accommodating!",
    likes: 61,
    comments: 15,
    shares: 30,
  },
];

const TrendingSection: React.FC = () => {
  // Get 4 random venues from hardcoded data and transform them to Experience format
  const trendingExperiences = useMemo(() => {
    const shuffled = [...HARDCODED_VENUES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    return selected.map((venue, index): Experience => {
      // Each venue gets a unique set of reviews (no duplicates across venues)
      const reviewStartIndex = index * 4;
      const reviewCount = index === 0 || index === 3 ? 4 : 2;
      const venueReviews = ALL_REVIEWS.slice(
        reviewStartIndex,
        reviewStartIndex + reviewCount
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
    <section className="pt-8 pb-4 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-pink-500 font-extrabold text-xs uppercase tracking-[0.2em] mb-2 block">
              Top Picks
            </span>
            <h2 className="text-4xl font-extrabold text-gray-700 mb-2">
              Trending Experiences
            </h2>
            <p className="text-gray-500 text-lg">
              Curated selections with real feedback from our community.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
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
