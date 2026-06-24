import api from "@/shared/lib/axios";

export interface Favorite {
  id: string;
  targetId: string;
  type: "venue" | "event";
  createdAt: string;
  venue?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    images?: { imageUrl?: string; url?: string; isPrimary?: boolean }[];
  };
  event?: {
    id: string;
    name: string;
  };
}

export const getUserFavorites = async (userId: string): Promise<Favorite[]> => {
  const res = await api.get(`/favorites/user/${userId}`);
  return res.data.data || [];
};

export const checkFavorite = async (
  targetId: string,
  type: string
): Promise<{ isFavorited: boolean; favoriteId?: string }> => {
  const res = await api.get("/favorites/check", { params: { targetId, type } });
  return res.data.data || { isFavorited: false };
};

export const addFavorite = async (
  targetId: string,
  type: "venue" | "event"
): Promise<Favorite> => {
  const res = await api.post("/favorites/add", { targetId, type });
  return res.data.data;
};

export const removeFavoriteByListing = async (
  targetId: string,
  type: "venue" | "event"
): Promise<void> => {
  await api.delete("/favorites/remove/listing", { data: { targetId, type } });
};
