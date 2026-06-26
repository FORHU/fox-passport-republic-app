import type { EventItem, VenueItem } from "@/data/dashboardData";

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

export function mapBackendEventToEventItem(event: any): EventItem {
  const status = normalizeStatus(event?.status);
  const type = String(event?.eventType ?? event?.type ?? "")
    .trim()
    .toUpperCase();

  const totalPrice = event?.totalPrice ?? event?.total_price;
  const revenue =
    totalPrice ? `₱${(Number(totalPrice) / 1000).toFixed(1)}k` : "₱0";

  const img =
    event?.image ??
    event?.images?.[0]?.imageUrl ??
    event?.images?.[0]?.url ??
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2072";

  return {
    id: event?.id,
    title: event?.name ?? event?.title ?? "Untitled Event",
    date: formatDate(event?.startDatetime ?? event?.start_datetime ?? event?.date),
    loc:
      event?.venue?.name ??
      event?.venueName ??
      (event?.venue?.city
        ? `${event.venue.city}, ${event.venue.country || "PH"}`
        : "Venue TBD"),
    type: type || "EVENT",
    status,
    // UI in the dashboard currently uses `0` for booked
    booked: 0,
    capacity: event?.maxAttendees ?? event?.capacity ?? 100,
    revenue,
    img,
  };
}

export function mapBackendVenueToVenueItem(venue: any): VenueItem {
  const status = normalizeStatus(venue?.status);
  const type = String(venue?.type ?? venue?.venueType ?? "")
    .trim()
    .toUpperCase();

  const img =
    venue?.venueImages?.[0]?.url ??
    venue?.venueImages?.[0]?.imageUrl ??
    venue?.image ??
    venue?.images?.[0] ??
    "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=2072";

  return {
    id: venue?.id,
    title: venue?.name ?? venue?.title ?? "Untitled Venue",
    type: type || "VENUE",
    loc:
      venue?.city
        ? `${venue.city}, ${venue.country || "PH"}`
        : venue?.address ?? "Location TBD",
    cap: venue?.capacity ? `${venue.capacity} Cap` : "N/A",
    status,
    bookings: venue?.bookings ?? "New",
    revenue: venue?.revenue ?? "₱0",
    img,
  };
}

