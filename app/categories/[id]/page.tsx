"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CategoryHero } from "@/components/categories/detail/CategoryHero";
import { CategoryHeader } from "@/components/categories/detail/CategoryHeader";
import { CategoryGrid } from "@/components/categories/detail/CategoryGrid";
import { useCategoryDetail } from "@/hooks/data/useCategoryDetail";
import { TrendingSection } from "@/components/categories/detail/TrendingSection";
import { CategoryFooter } from "@/components/categories/detail/CategoryFooter";

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { category: categoryWithDesign, loading } = useCategoryDetail(id);  

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ccff00]"></div>
      </div>
    );
  }

  if (!categoryWithDesign) {
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
      {/* Component expects old type, passing mapped new type is runtime compatible */}
      <CategoryHeader category={categoryWithDesign} />
      
      <main className="grow pt-40 px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <CategoryHero category={categoryWithDesign} />
          <CategoryGrid category={categoryWithDesign} />
          <TrendingSection category={categoryWithDesign} />
        </div>
      </main>
      
      <CategoryFooter />
    </div>
  );
}
