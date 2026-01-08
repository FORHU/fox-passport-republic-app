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

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Categories</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            What's your <span className="text-gradient">vibe</span>?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            From underground gigs to mountain escapes. Find experiences that match your energy.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 reveal-on-scroll">
          {displayCategories.slice(0, 8).map((cat: Category, index) => {
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

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="category-item glass-card rounded-2xl p-6 border border-white/5 cursor-pointer group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`icon-wrapper w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="material-symbols-outlined text-white text-3xl">
                    {icon}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-accent transition-colors">
                  {cat.name}
                </h3>
                <p className="text-text-muted text-sm line-clamp-2">
                  {cat.description || "Discover amazing experiences"}
                </p>
              </div>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12 reveal-on-scroll">
          <button
            onClick={() => router.push("/categories")}
            className="btn-neon px-8 py-4 rounded-full bg-accent text-black font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
          >
            View All Categories
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
