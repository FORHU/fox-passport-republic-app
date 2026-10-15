"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import {
  fetchCalendar,
  type CalendarEntry,
  type CalendarRole,
} from "@/shared/api/calendar";

export interface CalendarBooking {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  type: "event" | "venue" | "inventory" | "service";
  /** Which hat the viewer wears for it — guest, host, organizer, venue, supplier. */
  role?: CalendarRole;
  href?: string | null;
  status?: string;
}

export interface MonthItem {
  id: string;
  title: string;
  startDay: number;
  endDay: number;
  type: CalendarBooking["type"];
}

export function getBgColor(type: CalendarBooking["type"]): string {
  switch (type) {
    case "event":
      return "bg-accent text-black";
    case "venue":
      return "bg-pink-500 text-white";
    case "inventory":
      return "bg-purple-500 text-white";
    case "service":
      return "bg-orange-400 text-black";
  }
}

export function getDotColor(type: CalendarBooking["type"]): string {
  switch (type) {
    case "event":
      return "bg-green-400";
    case "venue":
      return "bg-pink-500";
    case "inventory":
      return "bg-purple-500";
    case "service":
      return "bg-orange-400";
  }
}

export function getIcon(type: CalendarBooking["type"]): string {
  switch (type) {
    case "event":
      return "event";
    case "venue":
      return "apartment";
    case "inventory":
      return "inventory_2";
    case "service":
      return "build";
  }
}

export function toMonthItems(
  bookings: CalendarBooking[],
  year: number,
  month: number,
): MonthItem[] {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
  const lastDay = new Date(year, month + 1, 0).getDate();

  return bookings
    .filter((b) => b.startDate <= monthEnd && b.endDate >= monthStart)
    .map((b) => ({
      id: b.id,
      title: b.title,
      startDay: b.startDate < monthStart ? 1 : b.startDate.getDate(),
      endDay: b.endDate > monthEnd ? lastDay : b.endDate.getDate(),
      type: b.type,
    }));
}

function toBooking(entry: CalendarEntry): CalendarBooking {
  return {
    id: entry.id,
    title: entry.title,
    startDate: entry.start,
    endDate: entry.end,
    type:
      entry.kind === "asset"
        ? "inventory"
        : entry.kind === "service"
          ? "service"
          : entry.role === "venue"
            ? "venue"
            : "event",
    role: entry.role,
    href: entry.href,
    status: entry.status,
  };
}

/** Two months back to ten ahead — what the month widgets page through. It
 * must stay inside the API's 400-day limit on /calendar (MAX_RANGE_DAYS);
 * the old +13 months asked for ~457 days and every widget got a 400. */
function defaultRange() {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth() - 2, 1),
    to: new Date(now.getFullYear(), now.getMonth() + 11, 1),
  };
}

/**
 * The signed-in person's calendar, for every role they hold, from the API's
 * `/calendar` — one scoped list instead of the five endpoints this used to
 * stitch together client-side (several reading field names the API never
 * sends, which left a citizen's own event bookings off their calendar).
 * Cached under `calendar`, which the `bookings` and `events` socket topics
 * invalidate.
 */
export function useCalendarBookings(range?: { from: Date; to: Date }) {
  const userId = useAuthStore((state) => state.user?.id);
  const { from, to } = range ?? defaultRange();

  const query = useQuery({
    queryKey: ["calendar", userId, from.toISOString(), to.toISOString()],
    queryFn: () => fetchCalendar(from, to),
    enabled: !!userId,
    // Paging to the next month keeps the current one on screen meanwhile.
    placeholderData: (previous) => previous,
    select: (entries) => entries.map(toBooking),
  });

  return {
    bookings: query.data ?? NO_BOOKINGS,
    isLoading: !!userId && query.isPending,
    error: query.isError ? "Could not load your calendar." : null,
    refetch: query.refetch,
  };
}

const NO_BOOKINGS: CalendarBooking[] = [];
