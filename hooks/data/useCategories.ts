"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Category, CategoriesApiResponse } from "@/types/category";

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get<CategoriesApiResponse>("/v1/categories");

  if (!response.data.success) {
    throw new Error("Failed to fetch categories");
  }

  const allCategories = response.data.data;

  // Transform user's flat list into nested tree structure
  // 1. Identify parents (no parentCategoryId)
  const parents = allCategories.filter((c) => !c.parentCategoryId);
  // 2. Identify children (have parentCategoryId)
  const children = allCategories.filter((c) => c.parentCategoryId);

  // 3. Nest children under parents
  const nestedCategories = parents
    .map((parent) => ({
      ...parent,
      subCategories: children
        .filter((child) => child.parentCategoryId === parent.id)
        .sort((a, b) => a.name.localeCompare(b.name)), // Sort subcategories alphabetically
    }))
    .sort((a, b) => {
      // Optional: Sort parents in a specific order if needed, or alphabetical
      // For now, let's do alphabetical by name
      return a.name.localeCompare(b.name);
    });

  return nestedCategories;
};

export function useCategories(): UseCategoriesReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    categories: data || [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}
