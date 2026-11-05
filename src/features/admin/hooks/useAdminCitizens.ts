"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export interface CitizensPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEFAULT_LIMIT = 20;

interface CitizensQueryResult {
  citizens: any[];
  pagination: CitizensPagination | undefined;
}

/**
 * Server-paginated + server-searched citizen directory. `initialData` (the
 * server-rendered first page) and its `initialPagination` only seed the cache
 * entry for the default page/limit/no-search key, so switching to it paints
 * immediately with the real total; any other page/search combination fetches
 * fresh. The API matches the search against name, email, username and role.
 */
export const useAdminCitizens = (
  page: number,
  search: string,
  initialData?: any[],
  limit: number = DEFAULT_LIMIT,
  initialPagination?: CitizensPagination,
) => {
  const isDefaultKey = page === 1 && limit === DEFAULT_LIMIT && !search;
  const seedData: CitizensQueryResult | undefined =
    isDefaultKey && initialData
      ? { citizens: initialData, pagination: initialPagination }
      : undefined;

  const { data, isLoading, isFetching, error, refetch } =
    useQuery<CitizensQueryResult>({
      queryKey: ["admin-citizens", page, limit, search],
      queryFn: async (): Promise<CitizensQueryResult> => {
        const response = await api.get("/users", {
          params: { page, limit, ...(search ? { search } : {}) },
        });
        return {
          citizens: response.data?.data ?? [],
          pagination: response.data?.pagination,
        };
      },
      placeholderData: keepPreviousData,
      initialData: seedData,
    });

  return {
    citizens: data?.citizens ?? [],
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
};
