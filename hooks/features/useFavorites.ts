"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getUserFavorites,
  addFavorite,
  removeFavoriteByListing,
  Favorite,
} from "@/lib/api/favorites";
import { toast } from "sonner";

export const useFavorites = () => {
  const { user } = useAuthStore();
  const userId = user?.id as string | undefined;
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ["favorites", userId],
    queryFn: () => getUserFavorites(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const isFavorited = (venueId: string) =>
    favorites.some((f) => f.targetId === venueId && f.type === "venue");

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: async (venueId: string) => {
      if (isFavorited(venueId)) {
        await removeFavoriteByListing(venueId, "venue");
      } else {
        await addFavorite(venueId, "venue");
      }
    },
    onMutate: async (venueId: string) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", userId] });
      const prev = queryClient.getQueryData<Favorite[]>(["favorites", userId]) ?? [];
      if (isFavorited(venueId)) {
        queryClient.setQueryData(
          ["favorites", userId],
          prev.filter((f) => f.targetId !== venueId)
        );
      } else {
        queryClient.setQueryData(["favorites", userId], [
          ...prev,
          { id: "__optimistic__", targetId: venueId, type: "venue", createdAt: new Date().toISOString() } as Favorite,
        ]);
      }
      return { prev };
    },
    onError: (_err, _venueId, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["favorites", userId], context.prev);
      }
      toast.error("Could not update favorites");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });

  const toggleFavorite = (venueId: string) => {
    if (!userId) {
      toast.error("Please log in to save venues");
      return;
    }
    toggle(venueId);
  };

  return { favorites, isFavorited, toggleFavorite, isToggling: isPending };
};
