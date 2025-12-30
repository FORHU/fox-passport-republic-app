// Category type matching backend Prisma model
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentCategoryId: string | null;
  createdAt: string;
  updatedAt: string;
  subCategories?: Category[];
  parentCategory?: Category;
}

// API response types
export interface CategoriesApiResponse {
  success: boolean;
  count: number;
  data: Category[];
}

export interface CategoryApiResponse {
  success: boolean;
  data: Category;
}
