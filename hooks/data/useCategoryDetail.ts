"use client";

import { useMemo } from "react";
import { useCategories } from "./useCategories";
import { Category } from "@/types/category";

// Extended interface for the design-enriched category
export interface CategoryWithDesign extends Category {
  title: string;
  tagline: string;
  color: string;
  spots: string;
  children: (Category & { image: string })[];
}

interface UseCategoryDetailReturn {
  category: CategoryWithDesign | null;
  loading: boolean;
  error: Error | null;
}

export function useCategoryDetail(slug: string): UseCategoryDetailReturn {
  const { categories, loading, error } = useCategories();

  const categoryWithDesign = useMemo(() => {
    if (loading || !categories.length || !slug) return null;

    // Find category by slug (id param matches slug)
    const category = categories.find((c) => c.slug === slug);

    if (!category) return null;

    // Use fallback if backend data is missing for some reason
    const image =
      category.image ||
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800";
    const tagline = category.tagline || "Explore experiences";
    const spotLabel = category.spotLabel || "Explore";

    // Map subcategories if needed (assuming backend provides image for subcategories too)
    const mappedChildren = (category.subCategories || []).map((sub) => {
      return {
        ...sub,
        image:
          sub.image ||
          "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800",
      };
    });

    return {
      ...category,
      title: category.name, // Map name to title for legacy components
      tagline: tagline,
      image: image,
      // Create a nice glow using the lime accent since that's the theme
      color: "from-[#ccff00] to-transparent",
      gradient: category.gradient || "from-[#ccff00] to-transparent", // Ensure gradient is set for CategoryHero
      spots: spotLabel,
      children: mappedChildren, // Map subCategories to children
    };
  }, [categories, slug, loading]);

  return {
    category: categoryWithDesign,
    loading,
    error,
  };
}
