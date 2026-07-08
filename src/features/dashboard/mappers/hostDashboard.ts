import type { EventItem, VenueItem } from "@/features/dashboard/data/dashboardData";

function formatDate(value: unknown): string {
  if (!value) return "Date TBD";
  const d =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;
  if (!d || Number.isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleDateString();
}

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

export function mapBackendEventToEventItem(event: unknown): EventItem {
  const ev = event as any;
  const status = normalizeStatus(ev?.status);
  const type = String(ev?.eventType ?? ev?.type ?? "")
    .trim()
    .toUpperCase();

  const totalPrice = ev?.totalPrice ?? ev?.total_price;
  const revenue =
    totalPrice ? `₱${(Number(totalPrice) / 1000).toFixed(1)}k` : "₱0";

  const img =
    ev?.image ??
    ev?.images?.[0]?.imageUrl ??
    ev?.images?.[0]?.url ??
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2072";

  return {
    id: ev?.id,
    title: ev?.name ?? ev?.title ?? "Untitled Event",
    date: formatDate(ev?.startDatetime ?? ev?.start_datetime ?? ev?.date),
    loc:
      ev?.venue?.name ??
      ev?.venueName ??
      (ev?.venue?.city
        ? `${ev.venue.city}, ${ev.venue.country || "PH"}`
        : "Venue TBD"),
    type: type || "EVENT",
    status,
    // UI in the dashboard currently uses `0` for booked
    booked: 0,
    capacity: ev?.maxAttendees ?? ev?.capacity ?? 100,
    revenue,
    img,
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
    loc:
      v?.city
        ? `${v.city}, ${v.country || "PH"}`
        : v?.address ?? "Location TBD",
    cap: v?.capacity ? `${v.capacity} Cap` : "N/A",
    status,
    bookings: v?.bookings ?? "New",
    revenue: v?.revenue ?? "₱0",
    img,
  };
}

