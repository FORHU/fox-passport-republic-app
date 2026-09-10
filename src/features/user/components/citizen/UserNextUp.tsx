import React from "react";
import Link from "next/link";

interface BookingEvent {
  id: string;
  status: string;
  startAt: string;
  event?: {
    name?: string;
    targetCity?: string;
    targetState?: string;
  };
}

interface UserNextUpProps {
  bookings?: BookingEvent[];
  isLoading?: boolean;
  className?: string;
}

const STATUS_STYLE: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  pending: {
    bg: "bg-yellow-400/10",
    color: "text-yellow-400",
    label: "Pending Request",
  },
  confirmed: { bg: "bg-accent/10", color: "text-accent", label: "Confirmed" },
  active: {
    bg: "bg-green-400/10",
    color: "text-green-400",
    label: "Active",
  },
  completed: {
    bg: "bg-white/10",
    color: "text-white/50",
    label: "Completed",
  },
  cancelled: {
    bg: "bg-red-400/10",
    color: "text-red-400",
    label: "Cancelled",
  },
  disputed: {
    bg: "bg-orange-400/10",
    color: "text-orange-400",
    label: "Disputed",
  },
};

export const UserNextUp: React.FC<UserNextUpProps> = ({
  bookings = [],
  isLoading = false,
  className = "",
}) => {
  return (
    <section className={`reveal-on-scroll flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-accent animate-pulse">
            airplane_ticket
          </span>
          Next Up
        </h3>
        <Link
          className="text-sm text-gray-400 hover:text-white transition-colors"
          href="/booking"
        >
          View all tickets
        </Link>
      </div>

      <div className="glass-panel rounded-3xl flex flex-col flex-1 divide-y divide-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-text-muted text-sm">
            Loading your events…
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <span className="material-symbols-outlined text-4xl text-white/20 mb-3">
              event_busy
            </span>
            <p className="text-sm font-bold text-white/40 mb-1">
              No upcoming events
            </p>
            <p className="text-xs text-text-muted">
              Bookings and event requests you make will show up here.
            </p>
          </div>
        ) : (
          bookings.map((booking) => {
            const style = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;
            const date = booking.startAt ? new Date(booking.startAt) : null;
            const location =
              [booking.event?.targetCity, booking.event?.targetState]
                .filter(Boolean)
                .join(", ") || "Location TBD";
            const time = date
              ? date.toLocaleTimeString("en-PH", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "—";

            return (
              <Link
                key={booking.id}
                href={`/booking/${booking.id}`}
                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-surface-highlight/60 shrink-0">
                  <span className="text-[10px] font-bold text-accent uppercase leading-none">
                    {date
                      ? date.toLocaleDateString("en-PH", { month: "short" })
                      : "—"}
                  </span>
                  <span className="text-lg font-bold text-white leading-none mt-0.5">
                    {date ? date.getDate() : "—"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm truncate group-hover:text-accent transition-colors">
                    {booking.event?.name || "Event Booking"}
                  </h4>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5 truncate">
                    <span className="material-symbols-outlined text-[12px]">
                      location_on
                    </span>
                    {location}
                    <span className="mx-1">·</span>
                    {time}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${style.bg} ${style.color}`}
                >
                  {style.label}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};
