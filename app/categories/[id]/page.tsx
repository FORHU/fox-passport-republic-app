"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCategoryById } from "@/data/categories";

// Components
import { CategoryHeader } from "@/components/categories/detail/CategoryHeader";
import { CategoryHero } from "@/components/categories/detail/CategoryHero";
import { CategoryGrid } from "@/components/categories/detail/CategoryGrid";
import { TrendingSection } from "@/components/categories/detail/TrendingSection";
import { CategoryFooter } from "@/components/categories/detail/CategoryFooter";

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const category = getCategoryById(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!category) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold text-white mb-4">Category Not Found</h1>
        <button onClick={() => router.push('/')} className="px-6 py-3 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b3e600] transition-colors">
          Go Home
        </button>
      </div>
    );
  }

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
