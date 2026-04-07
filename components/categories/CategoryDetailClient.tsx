"use client";

import React, { useEffect } from "react";
import { CategoryHero } from "@/components/categories/detail/CategoryHero";
import { CategoryHeader } from "@/components/categories/detail/CategoryHeader";
import { CategoryGrid } from "@/components/categories/detail/CategoryGrid";
import { TrendingSection } from "@/components/categories/detail/TrendingSection";
import { CategoryFooter } from "@/components/categories/detail/CategoryFooter";

interface CategoryDetailClientProps {
  category: any; // CategoryWithDesign type
}

export default function CategoryDetailClient({ category }: CategoryDetailClientProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white antialiased min-h-screen flex flex-col selection:bg-[#ccff00] selection:text-black font-sans">
      <CategoryHeader category={category} />

      <main className="grow pt-40 px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <CategoryHero category={category} />
          <CategoryGrid category={category} />
          <TrendingSection category={category} />
        </div>
      </main>

      <CategoryFooter />
    </div>
  );
}