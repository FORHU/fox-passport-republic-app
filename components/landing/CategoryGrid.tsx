"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryIcon } from "@/lib/categoryIcons";

const CategoryGrid: React.FC = () => {
  const router = useRouter();
  const { categories, loading, error } = useCategories();

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories?type=${encodeURIComponent(categoryName)}`);
  };

  const handleMoreClick = () => {
    router.push("/categories");
  };

  if (error) {
    console.error("Category loading error:", error);
    return (
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">Failed to load categories. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-700 mb-2">
          Explore by Category
        </h2>
        <p className="text-gray-500 mb-6">
          Whatever you're in the mood for, we've got you covered.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border border-gray-100 bg-white animate-pulse"
              >
                <div className="flex h-14 w-14 mx-auto mb-4 rounded-2xl bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))
          ) : (
            <>
              {categories.slice(0, 7).map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
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

              {/* More button */}
              <button
                onClick={handleMoreClick}
                className="group cursor-pointer p-8 rounded-2xl border border-gray-100 bg-white hover:border-pink-300 hover:shadow-xl hover:shadow-pink-100 transition-all flex flex-col items-center gap-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 transition-all group-hover:scale-110">
                  <MoreHorizontal className="w-9 h-9" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-bold text-gray-700 transition-colors group-hover:text-pink-500">
                  More
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
