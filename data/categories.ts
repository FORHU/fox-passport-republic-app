
export type {
  Category,
  CategoriesApiResponse,
  CategoryApiResponse,
} from "@/types/category";

// Import design helpers
import {
  getCategoryDesign,
  getSubCategoryDesign,
  DEFAULT_CATEGORY_DESIGN,
} from "./category-design";

// Re-export design helpers for convenience
export { getCategoryDesign, getSubCategoryDesign, DEFAULT_CATEGORY_DESIGN };
