/**
 * The facts the bookings list draws, worked out once so every view of a
 * booking (strip mark, agenda row) says the same thing about it.
 */

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
  refunded: "Refunded",
  refund_failed: "Refund failed",
};

const CLOSED = new Set(["cancelled", "refunded", "refund_failed"]);

/** Mirrors the backend sweep's own idea of "overdue unpaid" (BookingReminderService.cancelOverdueUnpaid) — kept in sync as a client-side fallback for the window before that job catches up. */
export function isPastDueUnpaid(booking: any) {
  return booking.status === "pending" && new Date(booking.startAt) < new Date();
}

export function statusLabel(booking: any) {
  if (isPastDueUnpaid(booking)) return "Unpaid, expired";
  return STATUS_LABEL[booking.status] ?? STATUS_LABEL.pending;
}

/**
 * One ink per meaning: lime for a booking that's on, ink for one waiting,
 * amber for one that needs a person, stamp red for closed, stamp blue for
 * completed.
 */
export type StatusKind =
  "attention" | "confirmed" | "pending" | "completed" | "closed";

export function statusKind(booking: any): StatusKind {
  if (isPastDueUnpaid(booking) || booking.status === "disputed")
    return "attention";
  if (booking.status === "confirmed" || booking.status === "active")
    return "confirmed";
  if (booking.status === "completed") return "completed";
  if (CLOSED.has(booking.status)) return "closed";
  return "pending";
}

const INK: Record<StatusKind, string> = {
  attention: "text-amber-700 dark:text-amber-400",
  confirmed: "text-(--accent-text)",
  pending: "text-white/70",
  completed: "text-(--stamp-blue)",
  closed: "text-(--stamp-red)",
};

/** What each dot colour means, in the order the month strip's key lists them. */
export const STATUS_KEY: { kind: StatusKind; label: string; ink: string }[] = [
  { kind: "confirmed", label: "Confirmed", ink: INK.confirmed },
  { kind: "pending", label: "Pending", ink: INK.pending },
  { kind: "attention", label: "Needs attention", ink: INK.attention },
  { kind: "completed", label: "Completed", ink: INK.completed },
  { kind: "closed", label: "Cancelled or refunded", ink: INK.closed },
];

export function statusInk(booking: any) {
  return INK[statusKind(booking)];
}

const OPEN = new Set(["pending", "confirmed", "active", "disputed"]);

export interface BookingGroups {
  attention: any[];
  upcoming: any[];
  past: any[];
}

/**
 * Splits one loaded page into the agenda's sections: what needs a person,
 * what is still ahead (soonest first), and everything else (latest first).
 */
export function groupBookings(
  bookings: any[],
  now = new Date(),
): BookingGroups {
  const groups: BookingGroups = { attention: [], upcoming: [], past: [] };
  for (const b of bookings) {
    const end = new Date(b.endAt || b.startAt);
    if (isPastDueUnpaid(b)) groups.attention.push(b);
    else if (OPEN.has(b.status) && end >= now) groups.upcoming.push(b);
    else groups.past.push(b);
  }
  const at = (x: any) => new Date(x.startAt).getTime();
  groups.upcoming.sort((x, y) => at(x) - at(y));
  groups.past.sort((x, y) => at(y) - at(x));
  return groups;
}

/**
 * The agenda for your own bookings. Coming up is the server's full upcoming
 * list (`GET /bookings/upcoming`, every page, already soonest first) plus any
 * booking on the loaded page that is under way, which that endpoint leaves out
 * because its start has passed. Needs attention and Past still come from the
 * loaded page, minus anything already in Coming up.
 */
export function mergeUpcoming(
  upcoming: any[],
  page: any[],
  now = new Date(),
): BookingGroups {
  const fromPage = groupBookings(page, now);
  const seen = new Set<string>();
  const merged: any[] = [];
  for (const b of [...upcoming, ...fromPage.upcoming]) {
    if (seen.has(b.id) || isPastDueUnpaid(b)) continue;
    seen.add(b.id);
    merged.push(b);
  }
  const at = (x: any) => new Date(x.startAt).getTime();
  merged.sort((x, y) => at(x) - at(y));
  return {
    attention: fromPage.attention.filter((b) => !seen.has(b.id)),
    upcoming: merged,
    past: fromPage.past.filter((b) => !seen.has(b.id)),
  };
}

/** Local `YYYY-MM-DD`, the key the month strip marks days by. */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Every day a booking covers, from start to end, capped at a month. */
export function bookingDays(booking: any) {
  if (!booking.startAt) return [];
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt || booking.startAt);
  const days: string[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  while (d <= end && days.length < 31) {
    days.push(dayKey(d));
    d.setDate(d.getDate() + 1);
  }
  return days.length ? days : [dayKey(start)];
}

// booking.totalAmount is the server-computed Event total (items × markup)
// and can be 0 for a template with no attached items even though a
// platform service fee was actually charged — prefer what was really paid.
export function displayTotal(booking: any) {
  const totalPaid = (booking.payments || [])
    .filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  return totalPaid > 0 ? totalPaid : Number(booking.totalAmount) || 0;
}

/**
 * Cancelling is the booker's call, not the host's, and a past-due unpaid
 * booking would only race the auto-cancel sweep.
 */
export function canCancel(booking: any, viewerIsHost: boolean) {
  return (
    !viewerIsHost &&
    !isPastDueUnpaid(booking) &&
    (booking.status === "pending" || booking.status === "confirmed")
  );
}

export function canReview(booking: any, viewerIsHost: boolean) {
  return !viewerIsHost && booking.status === "completed" && !booking.hasReview;
}

export function categoryLabel(booking: any) {
  const c: string | undefined = booking.event?.eventCategory;
  return c ? c.charAt(0).toUpperCase() + c.slice(1) : "Event";
}

export function placeLabel(booking: any) {
  return [booking.event?.targetCity, booking.event?.targetState]
    .filter(Boolean)
    .join(", ");
}

export function eventName(booking: any) {
  return booking.event?.name || "Venue Booking";
}

const DAY: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
};

/** "24 Oct 2026", or "24 Oct – 26 Oct 2026" when the booking spans days. */
export function dateRange(booking: any) {
  if (!booking.startAt) return "—";
  const start = new Date(booking.startAt);
  const end = booking.endAt ? new Date(booking.endAt) : null;
  if (!end || start.toDateString() === end.toDateString())
    return start.toLocaleDateString(undefined, DAY);
  return `${start.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  })} – ${end.toLocaleDateString(undefined, DAY)}`;
}

/** The day and month split apart, for rows that lead with a big date. */
export function dateParts(booking: any) {
  if (!booking.startAt) return { day: "—", month: "", weekday: "" };
  const d = new Date(booking.startAt);
  return {
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    month: d.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
  };
}

export function guestsLabel(booking: any) {
  const n = Number(booking.guestCount) || 0;
  return `${n} ${n === 1 ? "guest" : "guests"}`;
}
