"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export const useAdminPendingVenues = () => {
    const { data, isLoading, error, refetch } =  useQuery({
        queryKey: ["admin-pending-venues"],
        queryFn: async () => {
            const response = await api.get("/admin/venues/pending");
            return response.data.data ?? [];
        },
    });

    return{
        venues: data ?? [],
        isLoading,
        error: error instanceof  Error ? error.message : null,
        refetch,
    };
};