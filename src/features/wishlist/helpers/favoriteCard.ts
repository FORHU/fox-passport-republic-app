import type { Favorite } from "@/shared/api/favorites";

// What a wishlist card shows for each kind of favourite. Shared by the mobile
// and desktop views of /wishlists.

const AVATAR_BASE =
  "https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com";

const FOXER_ROLE_LABELS: [string, string][] = [
  ["eventFoxer", "Event Foxer"],
  ["providerFoxer", "Provider"],
  ["venueFoxer", "Venue Foxer"],
];

export function favoriteName(favorite: Favorite): string {
  const target = favorite.venue ?? favorite.event ?? favorite.foxer;
  return target?.name ?? "Untitled";
}

export function favoriteHref(favorite: Favorite): string {
  if (favorite.type === "venue") return `/venues/${favorite.targetId}`;
  if (favorite.type === "foxer") return `/foxer/${favorite.targetId}`;
  return `/event/${favorite.targetId}`;
}

export function favoriteImage(favorite: Favorite): string | undefined {
  if (favorite.type === "foxer") {
    const imgId = favorite.foxer?.imgId;
    if (!imgId) return undefined;
    return imgId.startsWith("http") ? imgId : `${AVATAR_BASE}/${imgId}`;
  }
  const images = favorite.venue?.images ?? favorite.event?.images;
  const img = images?.find((i) => i.isPrimary) ?? images?.[0];
  return img?.imageUrl ?? img?.url;
}

/**
 * The line under the name: the price for a venue or event, the role and city
 * for a Foxer. `format` is the viewer's display-currency formatter.
 */
export function favoriteSubline(
  favorite: Favorite,
  format: (amount: number) => string,
): string {
  if (favorite.type === "foxer") {
    const roles = favorite.foxer?.roleType ?? [];
    const role =
      FOXER_ROLE_LABELS.find(([key]) => roles.includes(key))?.[1] ?? "Foxer";
    const city = favorite.foxer?.city;
    return city ? `${role} · ${city}` : role;
  }

  const target = favorite.venue ?? favorite.event;
  if (!target || target.price == null) return "Inquire for price";
  const amount = Number(target.price);
  if (Number.isNaN(amount)) return "Inquire for price";
  const suffix =
    favorite.type === "venue"
      ? favorite.venue?.billingRate === "hourly"
        ? "/hour"
        : "/night"
      : "/event";
  return `${format(amount)}${suffix}`;
}
