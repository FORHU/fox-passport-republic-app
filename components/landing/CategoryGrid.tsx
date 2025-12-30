"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Mountain,
  Tent,
  Music,
  Building2,
  PartyPopper,
  Sparkles,
  MoreHorizontal,
  Grid3X3,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types/category";

// Icon mapping - maps icon name strings from the backend to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  Utensils: Utensils,
  Mountain: Mountain,
  Tent: Tent,
  Music: Music,
  Building2: Building2,
  PartyPopper: PartyPopper,
  Sparkles: Sparkles,
  MoreHorizontal: MoreHorizontal,
  Grid3X3: Grid3X3,
};

// Default icon if the icon name is not found
const DEFAULT_ICON = Grid3X3;

// Helper function to get icon component from icon name
function getIconComponent(iconName: string | null): LucideIcon {
  if (!iconName) return DEFAULT_ICON;
  return ICON_MAP[iconName] || DEFAULT_ICON;
}

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

  // Filter out "More" category from API and add it manually at the end
  const displayCategories = categories.filter(cat => cat.slug !== 'more');

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-700 mb-2">
          Explore by Category
        </h2>
        <p className="text-gray-500 mb-6">
          Whatever you&apos;re in the mood for, we&apos;ve got you covered.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayCategories.map((cat: Category) => {
            const Icon = getIconComponent(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="group cursor-pointer p-8 rounded-2xl border border-gray-100 bg-white hover:border-pink-300 hover:shadow-xl hover:shadow-pink-100 transition-all flex flex-col items-center gap-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 transition-all group-hover:scale-110">
                  <Icon className="w-9 h-9" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-bold text-gray-700 transition-colors group-hover:text-pink-500">
                  {cat.name}
                </span>
              </button>
            );
          })}
          
          {/* Always show "More" button at the end */}
          <button
            onClick={() => router.push("/categories")}
            className="group cursor-pointer p-8 rounded-2xl border border-gray-100 bg-white hover:border-pink-300 hover:shadow-xl hover:shadow-pink-100 transition-all flex flex-col items-center gap-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 transition-all group-hover:scale-110">
              <MoreHorizontal className="w-9 h-9" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-bold text-gray-700 transition-colors group-hover:text-pink-500">
              More
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
