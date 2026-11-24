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

/** A toggle, with the direction fixed when the heart is clicked. */
interface FavoriteChange extends FavoriteTarget {
  action: "add" | "remove";
}

const matches = (f: Favorite, { targetId, type }: FavoriteTarget) =>
  f.targetId === targetId && f.type === type;

/** The favourites query. Other favourite queries extend this key (prefix). */
export const favoritesQueryKey = (userId: string | undefined) =>
  ["favorites", userId] as const;

// The last list seen for each user, so a reload shows the right hearts at once
// instead of empty ones until the request returns (api#455). Display data
// only: the request still runs and replaces it.
const storageKey = (userId: string) => `fox_favorites:${userId}`;

function readStored(userId: string | undefined): Favorite[] | undefined {
  if (!userId) return undefined;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : undefined;
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function writeStored(userId: string | undefined, favorites: Favorite[]) {
  if (!userId) return;
  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify(favorites.filter((f) => !f.id.startsWith("__"))),
    );
  } catch {
    // Private mode or full storage: the hearts just wait for the request.
  }
}

/** `list` with `favorite` in it once: replacing any copy of the same item. */
function withFavorite(list: Favorite[], favorite: Favorite) {
  return [favorite, ...list.filter((f) => !matches(f, favorite))];
}

/**
 * The viewer's favourites (venues, events and Foxers), shared by every heart
 * on the site and the wishlist. `type` defaults to "venue", which is what every
 * caller saved before Foxers and events joined.
 */
export const useFavorites = () => {
  const { user } = useAuthStore();
  const userId = user?.id as string | undefined;
  const queryClient = useQueryClient();
  const key = favoritesQueryKey(userId);

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: key,
    queryFn: async () => {
      const list = await getUserFavorites(userId!);
      writeStored(userId, list);
      return list;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    initialData: () => readStored(userId),
    // Remembered data is shown at once but always refreshed.
    initialDataUpdatedAt: 0,
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
        queryClient.invalidateQueries({ queryKey: favoritesQueryKey(userId) }),
      );
  }, [userId, queryClient]);

  const isFavorited = (targetId: string, type: FavoriteType = "venue") =>
    favorites.some((f) => matches(f, { targetId, type }));

  const setFavorites = (update: (list: Favorite[]) => Favorite[]) => {
    const next = update(queryClient.getQueryData<Favorite[]>(key) ?? []);
    queryClient.setQueryData(key, next);
    writeStored(userId, next);
  };

  const { mutate: change, isPending } = useMutation({
    // The direction comes from the click. Deciding it here, after onMutate
    // has already changed the cache, could send an add as a remove (api#455).
    mutationFn: async (target: FavoriteChange) =>
      target.action === "add"
        ? (await addFavorite(target.targetId, target.type)).favorite
        : (await removeFavoriteByListing(target.targetId, target.type),
          undefined),
    onMutate: async (target: FavoriteChange) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<Favorite[]>(key) ?? [];
      if (target.action === "remove") {
        setFavorites((list) => list.filter((f) => !matches(f, target)));
      } else {
        setFavorites((list) =>
          withFavorite(list, {
            id: `__optimistic__:${target.type}:${target.targetId}`,
            targetId: target.targetId,
            type: target.type,
            createdAt: new Date().toISOString(),
          }),
        );
      }
      return { prev };
    },
    onSuccess: (saved) => {
      // The API returns the saved card (name, image, price), so the wishlist
      // shows it straight away instead of an empty placeholder (app#415).
      if (saved) setFavorites((list) => withFavorite(list, saved));
    },
    onError: (_err, _target, context) => {
      if (context?.prev) {
        queryClient.setQueryData(key, context.prev);
        writeStored(userId, context.prev);
      }
      toast.error("Could not update favorites");
    },
    onSettled: () => {
      // Prefix match: also refreshes the dashboard's Saved Vibes.
      queryClient.invalidateQueries({ queryKey: key });
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
    const action = isFavorited(targetId, type) ? "remove" : "add";
    change({ targetId, type, action }, { onSuccess: options?.onSuccess });
  };

  return {
    favorites,
    isLoading,
    isFavorited,
    toggleFavorite,
    isToggling: isPending,
  };
};
