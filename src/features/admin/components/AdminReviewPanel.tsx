"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { pollWhileVisible } from "@/shared/lib/realtime";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { hasPermission } from "@/shared/lib/permissions";

/**
 * Events that ended with bookings and nobody checked in. The daily sweep only
 * flags them; nothing about them changes until an admin settles each booking
 * here. Attended settles it as check-in does (payouts, stamp, XP); no-show
 * cancels it with no refund. The Event's status then follows its bookings,
 * and it leaves this list once the last one is settled.
 */

type ReviewBooking = {
  id: string;
  status: string;
  checkedIn: boolean;
  guestCount: number;
  user: { id: string; name: string | null; email: string } | null;
};

type ReviewEvent = {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  reviewFlaggedAt: string;
  host: { name: string | null; email: string } | null;
  bookings: ReviewBooking[];
};

type Outcome = "attended" | "noShow";

const OPEN = ["pending", "confirmed", "active"];

const STATUS_LABEL: Record<string, string> = {
  pending: "Unpaid",
  confirmed: "Paid",
  active: "Paid",
  completed: "Attended",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

function dateLabel(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminReviewPanel() {
  const user = useAuthStore((s) => s.user);
  const canDecide = hasPermission(user, "queue:decide");
  const qc = useQueryClient();

  const {
    data: events,
    isLoading,
    isError,
    refetch,
  } = useQuery<ReviewEvent[]>({
    queryKey: ["admin-data", "needs-review"],
    queryFn: () =>
      api
        .get("/admin/events/needs-review")
        .then((response) => response.data.data ?? []),
    refetchInterval: pollWhileVisible,
  });

  const settle = useMutation({
    mutationFn: ({
      bookingId,
      outcome,
    }: {
      bookingId: string;
      outcome: Outcome;
    }) => api.patch(`/admin/bookings/${bookingId}/review-outcome`, { outcome }),
    onSuccess: (_res, { outcome }) => {
      toast.success(
        outcome === "attended" ? "Marked attended" : "Marked no-show",
      );
      qc.invalidateQueries({ queryKey: ["admin-data"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Could not settle this booking",
      );
      // Someone else may have settled it first: show what is true now.
      qc.invalidateQueries({ queryKey: ["admin-data", "needs-review"] });
    },
  });

  return (
    <section className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-white/5">
        <h1 className="text-2xl font-display font-bold text-white">
          Needs review
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Events that ended with nobody checked in. Settle each booking:
          attended pays it out as check-in does; no-show closes it with no
          refund.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-white/30 text-sm">
          Loading...
        </div>
      ) : isError ? (
        <div className="py-16 px-6 text-center text-red-400 text-sm space-y-3">
          <p>Couldn&apos;t load events needing review.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="underline hover:text-white"
          >
            Try again
          </button>
        </div>
      ) : !events?.length ? (
        <div className="py-16 text-center text-white/30 text-sm">
          Nothing needs review.
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {events.map((event) => (
            <li key={event.id} className="px-6 sm:px-8 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="font-bold text-white">{event.name}</h2>
                <span className="text-xs text-white/40">
                  Ended {dateLabel(event.endAt)}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Event Foxer: {event.host?.name || event.host?.email || "—"} ·
                Flagged {dateLabel(event.reviewFlaggedAt)}
              </p>

              <ul className="mt-3 space-y-2">
                {event.bookings.map((booking) => {
                  const open = OPEN.includes(booking.status);
                  const paid = booking.status !== "pending";
                  const busy =
                    settle.isPending &&
                    settle.variables?.bookingId === booking.id;
                  return (
                    <li
                      key={booking.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-white truncate">
                          {booking.user?.name ||
                            booking.user?.email ||
                            "Deleted user"}
                        </p>
                        <p className="text-xs text-white/40">
                          {booking.guestCount} guests ·{" "}
                          {STATUS_LABEL[booking.status] ?? booking.status}
                        </p>
                      </div>
                      {open && canDecide && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busy || !paid}
                            title={
                              paid
                                ? undefined
                                : "Unpaid bookings can only be closed as a no-show"
                            }
                            onClick={() =>
                              settle.mutate({
                                bookingId: booking.id,
                                outcome: "attended",
                              })
                            }
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-accent text-black disabled:opacity-40"
                          >
                            Attended
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              settle.mutate({
                                bookingId: booking.id,
                                outcome: "noShow",
                              })
                            }
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
                          >
                            No-show
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
