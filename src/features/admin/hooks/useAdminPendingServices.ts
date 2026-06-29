"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

export const useAdminPendingServices = () => {
    const { data, isLoading, error, refetch } = useQuery ({
        queryKey: ["admin-pending-services"],
        queryFn: async () => {
            const response = await api.get("/admin/services/pending");
            return response.data.data ?? [];
        },
    });

    return{
        services: data ?? [],
        isLoading,
        error: error instanceof  Error ? error.message : null,
        refetch,
    };
}

