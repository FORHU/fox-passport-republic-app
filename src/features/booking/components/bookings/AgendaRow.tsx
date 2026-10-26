import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/shared/lib/currency";
import {
  canCancel,
  canReview,
  categoryLabel,
  dateParts,
  dateRange,
  displayTotal,
  eventName,
  guestsLabel,
  isPastDueUnpaid,
  placeLabel,
} from "./statusInk";
import { Arrow, StatusTag } from "./sheet";

/**
 * One booking in the agenda. Left to right: when, what (with its status and
 * total), and what you can do. Each row has one main action: Leave a review
 * when that's owed, otherwise View booking. Cancelling sits apart from both.
 */
export function AgendaRow({
  booking,
  viewerIsHost,
  highlighted = false,
  onCancel,
}: {
  booking: any;
  viewerIsHost: boolean;
  /** Set briefly when the month strip jumps to this booking. */
  highlighted?: boolean;
  onCancel: (id: string) => void;
}) {
  const { day, month, weekday } = dateParts(booking);
  const pastDue = isPastDueUnpaid(booking);
  const start = booking.startAt ? new Date(booking.startAt) : null;
  const end = booking.endAt ? new Date(booking.endAt) : null;
  const spansDays = start && end && start.toDateString() !== end.toDateString();
  const review = canReview(booking, viewerIsHost);
  const cancellable = canCancel(booking, viewerIsHost);
  const href = `/booking/${booking.id}`;

  const facts = [
    categoryLabel(booking),
    placeLabel(booking),
    guestsLabel(booking),
  ].filter(Boolean);

  return (
    <li
      id={`booking-${booking.id}`}
      className={`grid scroll-mt-32 grid-cols-[3.5rem_1fr] gap-x-4 gap-y-4 border-b border-white/15 py-5 transition-colors duration-300 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center sm:gap-x-6 ${
        highlighted ? "bg-white/6" : ""
      }`}
    >
      <p className="sm:self-start">
        <span className="block text-xs font-semibold text-white/55">
          {weekday}
        </span>
        <span
          className={`font-landing-mono block text-3xl leading-tight font-bold tabular-nums ${
            pastDue ? "text-amber-700 dark:text-amber-400" : "text-white"
          }`}
        >
          {day}
        </span>
        <span className="block text-xs font-semibold text-white/55">
          {month}
        </span>
      </p>

      <div className="min-w-0">
        <h3 className="text-lg leading-snug font-bold text-white">
          <Link
            href={href}
            className="transition-colors hover:text-(--accent-text)"
          >
            {eventName(booking)}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-white/70">
          {facts.join(" · ")}
          {spansDays && <> · {dateRange(booking)}</>}
        </p>
        {viewerIsHost && (
          <p className="mt-1 text-sm text-white/70">
            Booked by {booking.user?.name || "a citizen"}
          </p>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <StatusTag booking={booking} />
          <span className="font-landing-mono text-sm font-bold tabular-nums text-white">
            {formatCurrency(displayTotal(booking))}
          </span>
        </p>
        {pastDue && (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            The date passed before it was paid, so it will be cancelled
            automatically.
          </p>
        )}
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-1 sm:flex-col sm:items-end">
        {review ? (
          <Link
            href={`/reviews/write/${booking.id}`}
            className="group inline-flex items-center gap-2 rounded-full bg-accent py-2.5 pr-4 pl-5 text-sm font-extrabold text-black transition-colors hover:bg-accent-hover"
          >
            Leave a review
            <Arrow className="group-hover:translate-x-0.5" />
          </Link>
        ) : null}
        <Link
          href={href}
          className={
            review
              ? "inline-flex items-center px-1 py-2.5 text-sm font-bold text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
              : "group inline-flex items-center gap-2 rounded-full border border-white/30 py-2.5 pr-4 pl-5 text-sm font-bold text-white transition-colors hover:bg-white/6"
          }
        >
          View booking
          {!review && <Arrow className="group-hover:translate-x-0.5" />}
        </Link>
        {cancellable && (
          <button
            type="button"
            onClick={() => onCancel(booking.id)}
            className="px-1 py-2.5 text-sm font-bold text-(--stamp-red) underline-offset-4 hover:underline sm:py-1"
          >
            Cancel booking
          </button>
        )}
      </div>
    </li>
  );
}
