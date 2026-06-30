"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export const useAdminPendingAssets = () => {
    const { data, isLoading, error, refetch } = useQuery ({
        queryKey: ["admin-pending-assets"],
        queryFn: async () => {
            const response = await api.get("/admin/assets/pending");
            return response.data.data ?? [];
        },
    });

    return{
        assets: data ?? [],
        isLoading,
        error: error instanceof  Error ? error.message : null,
        refetch,
    };
}
