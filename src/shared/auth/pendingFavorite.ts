import type { FavoriteType } from "@/shared/api/favorites";

// sessionStorage, like returnTo: Google/Facebook sign-in leaves the site and
// comes back on a fresh page load, in the same tab.
const KEY = "fox_pending_favorite";

export interface PendingFavorite {
  targetId: string;
  type: FavoriteType;
}

/** Remember a save a signed-out user asked for, to finish after sign-in. */
export function rememberPendingFavorite(pending: PendingFavorite) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(pending));
  } catch {
    // Storage blocked: sign-in still opens; the save just isn't replayed.
  }
}

/**
 * The remembered save, once: it is removed as it is read, so only the first
 * caller (of the many mounted `useFavorites`) finishes it.
 */
export function takePendingFavorite(): PendingFavorite | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingFavorite>;
    return typeof parsed.targetId === "string" &&
      (parsed.type === "venue" ||
        parsed.type === "event" ||
        parsed.type === "foxer")
      ? { targetId: parsed.targetId, type: parsed.type }
      : null;
  } catch {
    return null;
  }
}
