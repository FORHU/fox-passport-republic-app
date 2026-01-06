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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
            Explore by Category
          </h2>
          <p className="text-lg text-gray-600">
            Whatever you&apos;re in the mood for, we&apos;ve got you covered.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] grid-flow-dense">
          {displayCategories.map((cat: Category, index) => {
            const imageUrl = CATEGORY_IMAGES[cat.name] || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";

            // Create varied grid spans for bento layout
            // Index 0: Large 2x2 (Classes & Workshops)
            // Index 1-2: Regular 1x1 (Competitions, Festivals)
            // Index 3: Wide 2x1 (Live Performances)
            // Index 4-6: Regular 1x1 (Markets, Parties, Tours)
            const gridSpan = index === 0 ? 'sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2' :
                           index === 3 ? 'sm:col-span-2 lg:col-span-2' : '';
            const isLarge = index === 0;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${gridSpan}`}
              >
                {/* Background Image */}
                <img
                  src={imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-5 w-full flex justify-between items-end">
                  <div className="flex-1">
                    <h3 className={`${isLarge ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} font-bold text-white mb-1 group-hover:text-pink-200 transition-colors`}>
                      {cat.name}
                    </h3>
                    {isLarge && (
                      <p className="text-white/80 text-xs md:text-sm font-normal line-clamp-2 mt-2 max-w-md">
                        {cat.description || "Explore experiences"}
                      </p>
                    )}
                  </div>

                  {/* Arrow icon for large card */}
                  {isLarge && (
                    <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => router.push("/categories")}
            className="inline-flex items-center gap-2 px-8 py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl"
          >
            View All Categories
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
