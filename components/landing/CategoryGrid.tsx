"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types/category";

// Category images mapping
const CATEGORY_IMAGES: Record<string, string> = {
  "Classes & Workshops": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
  "Competitions & Games": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
  "Festivals & Fairs": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
  "Live Performances": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
  "Markets & Pop-Ups": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
  "Parties & Socials": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
  "Tours & Excursions": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
};

const CategoryGrid: React.FC = () => {
  const router = useRouter();
  const { categories, loading, error } = useCategories();
  const [showAllCategories, setShowAllCategories] = React.useState(false);

  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === "More") {
      router.push("/categories");
    } else {
      router.push(`/categories?type=${encodeURIComponent(categoryName)}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-700 mb-2">
            Explore by Category
          </h2>
          <p className="text-gray-500 mb-6">
            Whatever you&apos;re in the mood for, we&apos;ve got you covered.
          </p>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  // Error state - show nothing or a subtle message
  if (error || categories.length === 0) {
    return null; // Hide the section if there are no categories or an error
  }

  // Filter out "More" category from API
  const displayCategories = categories.filter(cat => cat.slug !== 'more');
  const categoriesToShow = showAllCategories ? displayCategories : displayCategories.slice(0, 4);

  // Category children mapping
  const categoryChildren: Record<string, string[]> = {
    "Festivals & Fairs": [
      'Food & Drink Fests',
      'Music & Art Festivals',
      'Wellness & Lifestyle Expos',
      'Seasonal Fairs',
      'Cultural & Heritage Days'
    ],
    "Classes & Workshops": [
      'Hands-on Maker Sessions',
      'Culinary & Mixology',
      'Fitness & Movement',
      'Nature & Survival',
      'Photography & Content'
    ],
    "Live Performances": [
      'Concerts & Live Gigs',
      'Comedy & Open Mics',
      'Stage & Theater',
      'Specialty Acts',
      'Live Talks & Podcasts'
    ],
    "Tours & Excursions": [
      'Nature & Adventure',
      'Food & Bar Crawls',
      'Heritage & City Walks',
      'Wellness Retreats',
      '"Tourist in Your Own Town"'
    ],
    "Parties & Socials": [
      'Themed Nights',
      'Club & Dance Events',
      'Networking Mixers',
      'Activity-Based Socials',
      'Intimate Soirées'
    ],
    "Markets & Pop-Ups": [
      'Artisan & Craft Markets',
      'Farmers Markets',
      'Vintage & Thrift Fairs',
      'Brand Pop-Ups',
      'Food Truck Rallies'
    ],
    "Competitions & Games": [
      'Races & Fun Runs',
      'Interactive Gaming',
      'Trivia & Pub Quizzes',
      'Community Sports',
      'Performance Contests'
    ],
    "Celebrations & Milestones": [
      'Weddings & Engagements',
      'Birthdays & Anniversaries',
      'Baby & Bridal Showers',
      'Graduations & Proms',
      'Religious & Cultural Rites'
    ]
  };

  return (
    <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end relative z-20 reveal-on-scroll">
        <div>
          <h2 className="text-3xl font-display font-bold text-white group cursor-default">
            <span className="inline-block hover:animate-wiggle">Vibe</span>{" "}
            <span className="inline-block hover:text-accent transition-colors">Check</span>
          </h2>
          <p className="text-text-muted mt-1">Browse by category</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 reveal-on-scroll" style={{ transitionDelay: '100ms' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesToShow.map((cat: Category, idx) => {
            // Icon mapping for categories
            const iconMap: Record<string, string> = {
              "Festivals & Fairs": "festival",
              "Classes & Workshops": "palette",
              "Live Performances": "mic_external_on",
              "Tours & Excursions": "map",
              "Parties & Socials": "celebration",
              "Markets & Pop-Ups": "storefront",
              "Competitions & Games": "trophy",
              "Celebrations & Milestones": "cake",
            };

            const colorMap: Record<string, string> = {
              "Festivals & Fairs": "from-orange-400 to-red-500",
              "Classes & Workshops": "from-blue-400 to-cyan-500",
              "Live Performances": "from-purple-500 to-indigo-600",
              "Tours & Excursions": "from-green-400 to-emerald-600",
              "Parties & Socials": "from-pink-400 to-rose-500",
              "Markets & Pop-Ups": "from-yellow-400 to-amber-600",
              "Competitions & Games": "from-red-500 to-rose-600",
              "Celebrations & Milestones": "from-teal-400 to-cyan-600",
            };

            const icon = iconMap[cat.name] || "star";
            const gradient = colorMap[cat.name] || "from-primary to-secondary";
            const children = categoryChildren[cat.name] || [];

            return (
              <a
                key={idx}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick(cat.name);
                }}
                className="group relative flex flex-col justify-between p-5 bg-surface-highlight/50 rounded-3xl border border-white/5 h-[280px] overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Default Content */}
                <div className="relative z-10 transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                    <span className="material-symbols-outlined text-[28px]">{icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 leading-tight font-display">{cat.name}</h3>
                  <p className="text-sm text-text-muted">{cat.description || "Discover amazing experiences"}</p>
                </div>

                {/* Child Categories Overlay (Slides up) */}
                <div className="absolute inset-0 bg-surface-highlight/95 backdrop-blur-xl p-5 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Explore</h4>
                  <ul className="space-y-2">
                    {children.map(child => (
                      <li key={child} className="flex items-center gap-2 text-sm text-white/80 hover:text-accent transition-colors cursor-pointer">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        {child}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Background Gradient Blob */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              </a>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="px-6 py-2 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white hover:text-black transition-all hover:scale-105"
          >
            {showAllCategories ? 'Show Less' : 'View All Categories'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
