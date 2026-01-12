"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { Category, CategoriesApiResponse } from "@/types/category";

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<CategoriesApiResponse>("/v1/categories");

      if (response.data.success) {
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

        setCategories(nestedCategories);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMessage);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
