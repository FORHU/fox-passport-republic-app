"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { fetchBookingById } from "@/features/booking/api/bookings";
import { Notification } from "../types";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-yellow-400" },
  confirmed: { label: "Confirmed", color: "text-blue-400" },
  active: { label: "Active", color: "text-green-400" },
  completed: { label: "Completed", color: "text-white/60" },
  cancelled: { label: "Cancelled", color: "text-red-400" },
  disputed: { label: "Disputed", color: "text-orange-400" },
};

function extractBookingId(link?: string): string | null {
  if (!link) return null;
  const match = link.match(/\/booking\/([^/?#]+)/);
  return match ? match[1] : null;
}

export default function NotificationDetail({
  notification,
  onViewFull,
}: {
  notification: Notification;
  onViewFull: (link: string) => void;
}) {
  const link = notification.metadata?.link as string | undefined;
  const bookingId = extractBookingId(link);

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    setLoading(true);
    setError(false);
    fetchBookingById(bookingId)
      .then((data) => {
        if (active) setBooking(data ?? null);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId]);

  const statusInfo = booking?.status
    ? STATUS_LABEL[booking.status] ?? STATUS_LABEL.pending
    : null;

  return (
    <div className="text-xs mt-2 rounded-lg border border-white/10 bg-black/20 text-white/60">
      <div className="max-h-44 overflow-y-auto p-3 leading-relaxed whitespace-pre-line scrollbar-thin">
        <p>{notification.message}</p>

        {bookingId && (
          <div className="mt-3 border-t border-white/10 pt-3">
            {loading && <p className="text-white/40">Loading booking…</p>}
            {error && (
              <p className="text-red-300/80">
                Couldn&apos;t load booking preview.
              </p>
            )}
            {booking && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Status</span>
                  <span className={`font-bold ${statusInfo?.color}`}>
                    {statusInfo?.label ?? booking.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Event</span>
                  <span className="text-white font-semibold truncate max-w-[140px]">
                    {booking.event?.name || "Venue Booking"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Amount</span>
                  <span className="text-[#ccff00] font-bold">
                    ₱{booking.totalAmount?.toLocaleString() ?? "0"}
                  </span>
                </div>
                {booking.startAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Start</span>
                    <span className="text-white">
                      {new Date(booking.startAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {link && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewFull(link);
          }}
          className="flex w-full items-center justify-center gap-1 border-t border-white/10 py-2.5 text-xs font-medium text-[#ccff00] hover:bg-white/5 transition-colors"
        >
          View full details
          <ChevronDown size={12} className="rotate-[-90deg]" />
        </button>
      )}
    </div>
  );
}
