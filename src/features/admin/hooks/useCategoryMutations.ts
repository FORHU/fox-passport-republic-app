"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  CategoryWriteError,
} from "../api/categories";
import { revalidateCategories } from "../api/revalidate-categories";
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
} from "../types/category";

export type SaveCategoryArgs =
  | { id?: undefined; input: CategoryCreateInput }
  | { id: string; input: CategoryUpdateInput };

/**
 * Create or edit a category. On success the admin table and every client list
 * of categories refetch, and the server-cached list is marked stale, so the
 * change shows everywhere without a reload. A failure shows a toast; its
 * per-field messages stay on `error.fields` for the form.
 */
export function useSaveCategory(options: { onSaved?: () => void } = {}) {
  const qc = useQueryClient();

  return useMutation<unknown, CategoryWriteError, SaveCategoryArgs>({
    mutationFn: (args) =>
      args.id
        ? updateCategory(args.id, args.input)
        : createCategory(args.input as CategoryCreateInput),
    onSuccess: async (_data, args) => {
      toast.success(args.id ? "Category updated" : "Category created");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin-data", "categories"] }),
        qc.invalidateQueries({ queryKey: ["categories"] }),
        // A failed revalidation only means the public list catches up on its
        // 5-minute revalidate; the write itself already succeeded.
        revalidateCategories().catch(() => false),
      ]);
      options.onSaved?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
