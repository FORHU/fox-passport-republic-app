import api from "@/shared/lib/axios";

/** What a favourite points at. A "foxer" favourite's `targetId` is the Foxer's user id. */
export type FavoriteType = "venue" | "event" | "foxer";

export interface Favorite {
  id: string;
  targetId: string;
  type: FavoriteType;
  createdAt: string;
  venue?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    price?: number | string;
    billingRate?: string;
    images?: { imageUrl?: string; url?: string; isPrimary?: boolean }[];
  };
  event?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    price?: number | string | null;
    images?: { imageUrl?: string; url?: string; isPrimary?: boolean }[];
  };
  foxer?: {
    id: string;
    name: string;
    imgId?: string | null;
    city?: string | null;
    state?: string | null;
    roleType?: string[];
  };
}

export const getUserFavorites = async (userId: string): Promise<Favorite[]> => {
  const res = await api.get(`/favorites/user/${userId}`);
  return res.data.data || [];
};

/** Whether the viewer has saved this item. The API answers `{ isFavorite }`. */
export const checkFavorite = async (
  targetId: string,
  type: FavoriteType,
): Promise<boolean> => {
  const res = await api.get("/favorites/check", { params: { targetId, type } });
  return res.data.data?.isFavorite === true;
};

export interface AddFavoriteResult {
  added: boolean;
  /** The saved favourite with its card data (absent from an older API). */
  favorite?: Favorite;
}

export const addFavorite = async (
  targetId: string,
  type: FavoriteType,
): Promise<AddFavoriteResult> => {
  const res = await api.post("/favorites/add", { targetId, type });
  return res.data.data ?? { added: true };
};

export const removeFavoriteByListing = async (
  targetId: string,
  type: FavoriteType,
): Promise<void> => {
  await api.delete("/favorites/remove/listing", { data: { targetId, type } });
};
