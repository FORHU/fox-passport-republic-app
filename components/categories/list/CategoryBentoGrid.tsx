import React from "react";
import Image from "next/image";
import { Category } from "@/types/category";

interface CategoryBentoGridProps {
  categories: Category[];
  onCategoryClick: (id: string) => void;
  searchQuery: string;
}

// Category images mapping (moved from page)
const CATEGORY_IMAGES: Record<string, string> = {
  "Classes & Workshops": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
  "Competitions & Games": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
  "Festivals & Fairs": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
  "Live Performances": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
  "Markets & Pop-Ups": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800",
  "Parties & Socials": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
  "Tours & Excursions": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800",
};

export const CategoryBentoGrid: React.FC<CategoryBentoGridProps> = ({ categories, onCategoryClick, searchQuery }) => {
  if (categories.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <div className="text-6xl text-slate-200 mb-4">🔍</div>
        <p className="text-slate-500 font-medium">
          {searchQuery ? `No vibes found matching "${searchQuery}"` : "No categories available"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-24 auto-rows-[240px]">
      {categories.map((cat, index) => {
        // const Icon = getIconComponent(cat.icon); // Unused in original but available
        const imageUrl = CATEGORY_IMAGES[cat.name] || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800";

        // Create varied grid spans for bento layout
        const gridSpan = index === 0 ? 'lg:col-span-2 lg:row-span-2' :
                       index === 3 ? 'lg:col-span-2' : '';
        const isLarge = gridSpan.includes('lg:col-span-2');

        return (
          <div
            key={cat.id}
            onClick={() => onCategoryClick(cat.id)}
            className={`group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-lg transition-transform duration-500 hover:-translate-y-1 ${gridSpan}`}
          >
            {/* Category background image */}
            <Image
              src={imageUrl}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent transition-opacity group-hover:from-black/80" />

            <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
              <div className="flex-1">
                <h3 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-bold text-white mb-1 group-hover:text-pink-200 transition-colors`}>
                  {cat.name}
                </h3>
                <p className="text-white/80 text-sm font-medium line-clamp-2">
                  {cat.description || "Explore experiences"}
                </p>
              </div>
              {isLarge && (
                <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
