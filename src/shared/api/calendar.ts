import api from "@/shared/lib/axios";

/** Which hat the viewer wears for an entry (see the API's CalendarSvc). */
export type CalendarRole =
  "guest" | "host" | "organizer" | "venue" | "supplier";

export interface CalendarEntry {
  id: string;
  kind: "event" | "asset" | "service";
  role: CalendarRole;
  title: string;
  start: Date;
  end: Date;
  status: string;
  /** Where the viewer manages or reviews it, if anywhere. */
  href: string | null;
}

/**
 * Everything on the signed-in person's calendar between `from` and `to` —
 * events they booked, run, host at their venue or supply, and the gear and
 * services they rent or rent out — already scoped by the API.
 */
export async function fetchCalendar(
  from: Date,
  to: Date,
): Promise<CalendarEntry[]> {
  const res = await api.get("/calendar", {
    params: { from: from.toISOString(), to: to.toISOString() },
  });
  const rows: (Omit<CalendarEntry, "start" | "end"> & {
    start: string;
    end: string;
  })[] = res.data?.data ?? [];
  return rows.map((row) => ({
    ...row,
    start: new Date(row.start),
    end: new Date(row.end),
  }));
}
