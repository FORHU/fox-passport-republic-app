import api from "@/shared/lib/axios";

export interface ScheduleConflict {
  id: string;
  type: "venue" | "event" | "asset" | "service";
  title: string;
  startDate: string;
  endDate: string;
}

/**
 * Informational only — every one of the citizen's own bookings (across all
 * three booking models) whose dates overlap the range being configured.
 * Nothing about this blocks a booking; it's a heads-up shown alongside the
 * date picker.
 */
export async function fetchScheduleConflicts(
  startDate: string,
  endDate: string,
): Promise<ScheduleConflict[]> {
  const resp = await api.get("/bookings/schedule-conflicts", {
    params: { startDate, endDate },
  });
  return Array.isArray(resp.data?.data) ? resp.data.data : [];
}
