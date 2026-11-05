import type {
  EventItem,
  VenueItem,
} from "@/features/dashboard/data/dashboardData";

function normalizeStatus(status: unknown): string {
  const raw = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

  if (!raw) return "Draft";

  return raw
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type ImageLike = {
  isPrimary?: boolean;
  isThumbnail?: boolean;
  url?: string;
  imageUrl?: string;
};

function pickImage(images: unknown): string {
  if (!Array.isArray(images) || images.length === 0) return "";
  const list = images as (ImageLike | string | null)[];
  const primary =
    list.find(
      (i) => typeof i === "object" && (i?.isPrimary || i?.isThumbnail),
    ) ?? list[0];
  if (typeof primary === "string") return primary;
  return primary?.url || primary?.imageUrl || "";
}

/**
 * One event template from `GET /event-templates` as a Creator Studio card.
 *
 * The single mapper for both the dashboard's "My Active Events" and the
 * My Events page: each used to keep its own copy, and they disagreed on the
 * date, place and type shown for the same event.
 *
 * `status` and `venueConfirmation` pass through exactly as the API sends them:
 * the app decides neither. Until the API sends `venueConfirmation` (api#165)
 * it is null, and EventsSection shows no venue line.
 */
export function mapTemplateToEventItem(template: unknown): EventItem {
  const t = template as any;
  return {
    id: t?.id,
    title: t?.name ?? t?.title ?? "Untitled",
    date: t?.createdAt
      ? new Date(t.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    loc: [t?.targetCity, t?.targetState].filter(Boolean).join(", ") || "—",
    type: t?.category ?? "other",
    status: t?.status,
    venueConfirmation: t?.venueConfirmation ?? null,
    // A template has no bookings or revenue of its own; its events do.
    booked: null,
    capacity: t?.maxAttendees ?? null,
    revenue: null,
    // Empty when there is none: EventsSection supplies the fallback picture.
    img: pickImage(t?.images ?? t?.gallery),
    isPublic: t?.isPublic ?? false,
  };
}

export function mapBackendVenueToVenueItem(venue: unknown): VenueItem {
  const v = venue as any;
  const status = normalizeStatus(v?.status);
  const type = String(v?.type ?? v?.venueType ?? "")
    .trim()
    .toUpperCase();

  const img =
    (v?.venueImages as Record<string, unknown>[] | undefined)?.[0]?.url ??
    (v?.venueImages as Record<string, unknown>[] | undefined)?.[0]?.imageUrl ??
    v?.image ??
    (v?.images as unknown[] | undefined)?.[0] ??
    "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072";

  return {
    id: v?.id,
    title: v?.name ?? v?.title ?? "Untitled Venue",
    type: type || "VENUE",
    loc: v?.city
      ? `${v.city}, ${v.country || "PH"}`
      : (v?.address ?? "Location TBD"),
    cap: v?.capacity ? `${v.capacity} Cap` : "N/A",
    status,
    bookings: v?.bookings ?? "New",
    revenue: v?.revenue != null ? Number(v.revenue) : null,
    img,
  };
}
