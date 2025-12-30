// services/category.service.ts
import api from "@/lib/axios";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string;
  parentCategory?: {
    id: string;
    name: string;
    slug: string;
  };
  subCategories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  _count?: {
    events: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryResponse {
  success: boolean;
  count?: number;
  data: Category | Category[];
  message?: string;
}

class CategoryService {
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get<CategoryResponse>("/v1/categories");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  }

  // Get top-level categories (no parent)
  async getTopLevelCategories(): Promise<Category[]> {
    try {
      const response = await api.get<CategoryResponse>("/v1/categories/top-level");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Failed to fetch top-level categories:", error);
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await api.get<CategoryResponse>(`/v1/categories/${id}`);
      return response.data.data as Category;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      const response = await api.get<CategoryResponse>(`/v1/categories/slug/${slug}`);
      return response.data.data as Category;
    } catch (error) {
      console.error(`Failed to fetch category with slug ${slug}:`, error);
      throw error;
    }
  }

  // Create category (admin only)
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentCategoryId?: string;
  }): Promise<Category> {
    try {
      const response = await api.post<CategoryResponse>("/v1/categories/create", data);
      return response.data.data as Category;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  }

  // Update category (admin only)
  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      parentCategoryId: string;
    }>
  ): Promise<Category> {
    try {
      const response = await api.put<CategoryResponse>(`/v1/categories/${id}`, data);
      return response.data.data as Category;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  }

  // Delete category (admin only)
  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/v1/categories/${id}`);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  }
}

export default new CategoryService();
