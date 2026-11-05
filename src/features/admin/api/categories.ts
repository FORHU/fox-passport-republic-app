import api from "@/shared/lib/axios";
import { getApiErrorMessage } from "@/shared/lib/apiError";
import type {
  CategoryCreateInput,
  CategoryRoot,
  CategoryUpdateInput,
} from "../types/category";

/**
 * Category writes. Both need `categories:manage` (the admin role); the API
 * checks it on every call. A refused or invalid write is rethrown as a
 * `CategoryWriteError`, which carries the API's per-field messages so the form
 * can show each one under its input.
 */

export class CategoryWriteError extends Error {
  constructor(
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "CategoryWriteError";
  }
}

function toWriteError(e: unknown, fallback: string): CategoryWriteError {
  const data = (
    e as {
      response?: { data?: { fields?: { field: string; message: string }[] } };
    }
  )?.response?.data;
  const fields: Record<string, string> = {};
  for (const f of data?.fields ?? []) {
    if (f?.field && !fields[f.field]) fields[f.field] = f.message;
  }
  return new CategoryWriteError(getApiErrorMessage(e, fallback), fields);
}

/** The parents a new category can have: Event and Listing. */
export async function getCategoryRoots(): Promise<CategoryRoot[]> {
  const { data } = await api.get("/categories/top-level");
  return data?.data ?? [];
}

export async function createCategory(input: CategoryCreateInput) {
  try {
    const { data } = await api.post("/categories/create", input);
    return data.data;
  } catch (e) {
    throw toWriteError(e, "Could not create the category. Try again.");
  }
}

export async function updateCategory(id: string, input: CategoryUpdateInput) {
  try {
    const { data } = await api.put(`/categories/${id}`, input);
    return data.data;
  } catch (e) {
    throw toWriteError(e, "Could not save the category. Try again.");
  }
}
