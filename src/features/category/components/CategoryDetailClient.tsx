"use client";

import React, { useEffect } from "react";
import { CategoryHero } from "@/features/category/components/detail/CategoryHero";
import { CategoryHeader } from "@/features/category/components/detail/CategoryHeader";
import { CategoryGrid } from "@/features/category/components/detail/CategoryGrid";
import { EventPackagesSection } from "@/features/category/components/detail/EventPackagesSection";
import { TrendingSection } from "@/features/category/components/detail/TrendingSection";
import { CategoryFooter } from "@/features/category/components/detail/CategoryFooter";

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

      <main className="grow pt-24 sm:pt-32 lg:pt-40 px-4 sm:px-6 lg:px-8 pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl">
          <CategoryHero category={category} />
          <EventPackagesSection category={category} />
          <CategoryGrid category={category} />
          <TrendingSection category={category} />
        </div>
      </main>

      <CategoryFooter />
    </div>
  );
}