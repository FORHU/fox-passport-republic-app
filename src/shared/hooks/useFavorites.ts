"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { signInThen } from "@/shared/auth/returnTo";
import {
  rememberPendingFavorite,
  takePendingFavorite,
} from "@/shared/auth/pendingFavorite";
import {
  getUserFavorites,
  addFavorite,
  removeFavoriteByListing,
  Favorite,
  FavoriteType,
} from "@/shared/api/favorites";
import { toast } from "sonner";

interface FavoriteTarget {
  targetId: string;
  type: FavoriteType;
}

const matches = (f: Favorite, { targetId, type }: FavoriteTarget) =>
  f.targetId === targetId && f.type === type;

/**
 * The viewer's favourites (venues, events and Foxers). `type` defaults to
 * "venue", which is what every caller saved before Foxers and events joined.
 */
export const useFavorites = () => {
  const { user } = useAuthStore();
  const userId = user?.id as string | undefined;
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["favorites", userId],
    queryFn: () => getUserFavorites(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // A save a signed-out user asked for: finish it once they're signed in.
  // `takePendingFavorite` clears it as it reads, so of the many mounted
  // instances only the first one acts. Adding is idempotent on the API.
  useEffect(() => {
    if (!userId) return;
    const pending = takePendingFavorite();
    if (!pending) return;
    addFavorite(pending.targetId, pending.type)
      .then(() => toast.success("Saved to wishlist"))
      .catch(() => toast.error("Could not update favorites"))
      .finally(() =>
        queryClient.invalidateQueries({ queryKey: ["favorites", userId] }),
      );
  }, [userId, queryClient]);

  const isFavorited = (targetId: string, type: FavoriteType = "venue") =>
    favorites.some((f) => matches(f, { targetId, type }));

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: async (target: FavoriteTarget) => {
      if (isFavorited(target.targetId, target.type)) {
        await removeFavoriteByListing(target.targetId, target.type);
      } else {
        await addFavorite(target.targetId, target.type);
      }
    },
    onMutate: async (target: FavoriteTarget) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", userId] });
      const prev =
        queryClient.getQueryData<Favorite[]>(["favorites", userId]) ?? [];
      if (isFavorited(target.targetId, target.type)) {
        queryClient.setQueryData(
          ["favorites", userId],
          prev.filter((f) => !matches(f, target)),
        );
      } else {
        queryClient.setQueryData(
          ["favorites", userId],
          [
            ...prev,
            {
              id: "__optimistic__",
              targetId: target.targetId,
              type: target.type,
              createdAt: new Date().toISOString(),
            } as Favorite,
          ],
        );
      }
      return { prev };
    },
    onError: (_err, _target, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["favorites", userId], context.prev);
      }
      toast.error("Could not update favorites");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });

  const toggleFavorite = (
    targetId: string,
    options?: { type?: FavoriteType; onSuccess?: () => void },
  ) => {
    const type = options?.type ?? "venue";
    if (!userId) {
      // Signed out: sign in, come back here, and the save completes.
      rememberPendingFavorite({ targetId, type });
      signInThen(window.location.pathname + window.location.search);
      return;
    }
    toggle({ targetId, type }, { onSuccess: options?.onSuccess });
  };

  return {
    favorites,
    isLoading,
    isFavorited,
    toggleFavorite,
    isToggling: isPending,
  };
};
