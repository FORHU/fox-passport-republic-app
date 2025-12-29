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
} from "lucide-react";

const CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: Utensils },
  { id: "adventure", name: "Adventures", icon: Mountain },
  { id: "camping", name: "Camping", icon: Tent },
  { id: "music", name: "Music & Arts", icon: Music },
  { id: "venues", name: "Venues", icon: Building2 },
  { id: "nightlife", name: "Nightlife", icon: PartyPopper },
  { id: "wellness", name: "Wellness", icon: Sparkles },
  { id: "more", name: "More", icon: MoreHorizontal },
];

const CategoryGrid: React.FC = () => {
  const router = useRouter();

  const handleCategoryClick = (categoryName: string) => {
    if (categoryName === "More") {
      // Could open a modal or navigate to all categories
      router.push("/?category=Hotels%20%26%20Travel");
    } else {
      router.push(`/?category=${encodeURIComponent(categoryName)}`);
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          Explore by Category
        </h2>
        <p className="text-gray-500 mb-12">
          Whatever you're in the mood for, we've got you covered.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="group cursor-pointer p-8 rounded-2xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-gray-100 transition-all flex flex-col items-center gap-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary transition-all group-hover:scale-110">
                  <Icon className="w-9 h-9" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-bold text-gray-900 transition-colors group-hover:text-primary">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
