// hooks/useCategories.ts
import { useState, useEffect } from "react";
import categoryService, { Category } from "@/services/category.service";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoryService.getTopLevelCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useAllCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch categories");
        console.error("Error fetching all categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useCategoryBySlug(slug: string | null) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoryService.getCategoryBySlug(slug);
        setCategory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch category");
        console.error(`Error fetching category with slug ${slug}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  return { category, loading, error };
}
