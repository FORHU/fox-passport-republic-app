"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useRoleAccess } from "@/shared/auth/useRoleAccess";
import {
  fetchUserBookings,
  fetchReceivedBookings,
  fetchUpcomingBookings,
} from "@/features/booking/api/bookings";
import CancelBookingModal from "@/features/booking/components/CancelBookingModal";
import { toast } from "sonner";
import { pollWhileVisible } from "@/shared/lib/realtime";
import {
  groupBookings,
  mergeUpcoming,
} from "@/features/booking/components/bookings/statusInk";
import { AgendaRow } from "@/features/booking/components/bookings/AgendaRow";
import { MonthStrip } from "@/features/booking/components/bookings/MonthStrip";
import { SheetPager } from "@/features/booking/components/bookings/SheetPager";
import {
  Arrow,
  SectionHead,
} from "@/features/booking/components/bookings/sheet";

const FOCUS =
  "[&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[color:var(--accent-text)] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[color:var(--accent-text)]";

/** Enough bookings per page for the month strip to be worth reading. */
const PAGE_SIZE = 12;

export default function BookingListClient({
  initialTab = "mine",
}: {
  /** `?tab=received` opens straight onto bookings for events you run. */
  initialTab?: "mine" | "received";
} = {}) {
  const { user } = useAuthStore();
  const { canManageEvents } = useRoleAccess();
  // Organizers run events too (ADR 0005 in the API); the received list
  // includes events they organise, not only ones they own.
  const runsEvents =
    canManageEvents || (user?.roleType ?? []).includes("organizer");
  const [tab, setTab] = useState<"mine" | "received">(
    runsEvents ? initialTab : "mine",
  );
  const [page, setPage] = useState(1);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const limit = PAGE_SIZE;
  const userId = user?.id || user?.userId;

  /**
   * This list used to fetch in a `useEffect` and hold its rows in component
   * state, which put it outside React Query entirely - so the `bookings` topic
   * the server emits on every booking change reached the dashboards and the
   * admin tab but never this screen, the one belonging to the person the
   * booking is for. They saw a confirmed booking by reloading.
   *
   * The key is prefixed `user-bookings`, which is what `TOPIC_QUERY_KEYS` maps
   * `bookings` onto; React Query matches by prefix, so one emit refreshes
   * whichever page is open here.
   *
   * "received" is a second, independent list: bookings other citizens made on
   * events *this* user organizes, rather than bookings they made themselves.
   * Same topic prefix, so it refreshes on the same server-sent events.
   */
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ["user-bookings", tab, userId, page, limit],
    queryFn: () =>
      tab === "mine"
        ? fetchUserBookings(userId as string, page, limit)
        : fetchReceivedBookings(userId as string, page, limit),
    enabled: Boolean(userId),
    // Paging replaced the whole list with a spinner before; this keeps the
    // previous page on screen while the next one loads.
    placeholderData: keepPreviousData,
    refetchInterval: pollWhileVisible,
  });

  const bookings = useMemo(() => data?.bookings ?? [], [data?.bookings]);
  const totalPages = data?.pagination.totalPages || 1;
  const total = data?.pagination.total;
  const viewerIsHost = tab === "received";

  /**
   * The list above is paged by when bookings were made, so one page can't say
   * what's coming up. Your own Coming up comes from the server's sorted
   * upcoming list instead, across every page. Same `user-bookings` prefix, so
   * the same server-sent events refresh it. Received has no such endpoint and
   * stays page-based.
   */
  const upcomingQuery = useQuery({
    queryKey: ["user-bookings", "upcoming", userId],
    queryFn: fetchUpcomingBookings,
    enabled: Boolean(userId) && !viewerIsHost,
    refetchInterval: pollWhileVisible,
  });
  const upcomingLoading = !viewerIsHost && upcomingQuery.isPending;
  const upcomingFailed = !viewerIsHost && upcomingQuery.isError;

  const groups = useMemo(
    () =>
      viewerIsHost || !upcomingQuery.data
        ? groupBookings(bookings)
        : mergeUpcoming(upcomingQuery.data, bookings),
    [viewerIsHost, upcomingQuery.data, bookings],
  );
  const stripBookings = useMemo(
    () => [...groups.attention, ...groups.upcoming, ...groups.past],
    [groups],
  );
  const pageNote =
    totalPages <= 1
      ? undefined
      : viewerIsHost
        ? `Showing bookings from page ${page} of ${totalPages}.`
        : `Past bookings shown are from page ${page} of ${totalPages}.`;

  // The strip opens on the month of the next booking, else today's.
  const anchor = useMemo(() => {
    const next = groups.upcoming[0] ?? groups.attention[0];
    return next?.startAt ? new Date(next.startAt) : new Date();
  }, [groups]);

  // Choosing a day on the strip jumps the agenda to that day's bookings and
  // washes them briefly, so the eye lands on the right rows.
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickDay = useCallback((ids: string[]) => {
    const first = document.getElementById(`booking-${ids[0]}`);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    first?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    first?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    setHighlighted(ids);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setHighlighted([]), 1600);
  }, []);
  useEffect(
    () => () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (isError) toast.error("Could not load bookings.");
  }, [isError]);

  const switchTab = (next: "mine" | "received") => {
    setTab(next);
    setPage(1);
  };

  // No user id means the query never runs - the layout's `requireAuth` is
  // what turns those people away, so this only shows while the store hydrates.
  const loading = isPending || !userId;

  return (
    <div
      className={`min-h-screen bg-canvas text-white antialiased selection:bg-accent selection:text-black ${FOCUS}`}
    >
      <main className="mx-auto max-w-6xl px-5 pt-24 pb-32 sm:px-10 sm:pt-36 lg:pb-24">
        <header className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <h1 className="font-landing-display text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            {viewerIsHost ? (
              <>
                Bookings <span className="text-(--accent-text)">received</span>
              </>
            ) : (
              <>
                My <span className="text-(--accent-text)">bookings</span>
              </>
            )}
          </h1>

          <div className="flex flex-col gap-4">
            {runsEvents && (
              <div
                role="group"
                aria-label="Which bookings"
                className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15"
              >
                {(
                  [
                    { key: "mine", label: "My bookings" },
                    { key: "received", label: "For my events" },
                  ] as const
                ).map((t, i) => (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={tab === t.key}
                    onClick={() => switchTab(t.key)}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors ${
                      i === 1 ? "border-l border-white/15" : ""
                    } ${
                      tab === t.key
                        ? "bg-white/6 text-(--accent-text)"
                        : "text-white/60 hover:bg-white/3 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/70">
                {total !== undefined ? (
                  <>
                    <span className="font-bold tabular-nums text-white">
                      {total}
                    </span>{" "}
                    {total === 1 ? "booking" : "bookings"}
                    {viewerIsHost ? " for your events" : " in total"}
                  </>
                ) : (
                  " "
                )}
              </p>
              <Link
                href="/packages"
                className="group inline-flex items-center gap-2 rounded-full bg-accent py-3 pr-5 pl-6 text-sm font-extrabold text-black transition-colors hover:bg-accent-hover"
              >
                Find an event
                <Arrow className="group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* The set's heavy rule, with a lime line along it while a refresh runs. */}
        <div className="relative mt-6 h-0.5 bg-white">
          {isFetching && !loading && (
            <span
              className="absolute inset-0 animate-pulse bg-accent motion-reduce:animate-none"
              aria-hidden
            />
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {isFetching && !loading ? "Updating bookings" : ""}
        </p>

        {loading ? (
          <SkeletonPages />
        ) : isError && bookings.length === 0 ? (
          <Notice
            title="Couldn't load your bookings"
            body="Check your connection, then try again."
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/6"
              >
                Try again
              </button>
            }
          />
        ) : bookings.length === 0 ? (
          viewerIsHost ? (
            <Notice
              title="No bookings received yet"
              body="Once a citizen books one of your events, it'll show up here."
            />
          ) : (
            <Notice
              title="No bookings yet"
              body="Start by exploring events and booking your next one."
              action={
                <Link
                  href="/packages"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent py-3 pr-5 pl-6 text-sm font-extrabold text-black transition-colors hover:bg-accent-hover"
                >
                  Find an event
                  <Arrow className="group-hover:translate-x-0.5" />
                </Link>
              }
            />
          )
        ) : (
          <>
            <MonthStrip
              key={`${tab}-${page}`}
              bookings={stripBookings}
              anchor={anchor}
              note={pageNote}
              onPick={pickDay}
            />

            <div className="mt-14 flex flex-col gap-14">
              {groups.attention.length > 0 && (
                <section aria-labelledby="attention-title">
                  <SectionHead
                    id="attention-title"
                    title="Needs attention"
                    count={groups.attention.length}
                    note="The date passed before these were paid. They'll be cancelled automatically."
                  />
                  <ul>
                    {groups.attention.map((b) => (
                      <AgendaRow
                        key={b.id}
                        booking={b}
                        viewerIsHost={viewerIsHost}
                        highlighted={highlighted.includes(b.id)}
                        onCancel={setCancelTargetId}
                      />
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="upcoming-title">
                <SectionHead
                  id="upcoming-title"
                  title="Coming up"
                  count={upcomingLoading ? undefined : groups.upcoming.length}
                  note={
                    upcomingFailed
                      ? "Couldn't load all upcoming bookings; showing this page's."
                      : groups.upcoming.length === 0
                        ? undefined
                        : viewerIsHost
                          ? "Soonest first, from this page."
                          : "Soonest first."
                  }
                />
                {upcomingLoading ? (
                  <div aria-busy="true" aria-label="Loading upcoming bookings">
                    {[0, 1].map((i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-white/15 py-5 sm:grid-cols-[4.5rem_1fr]"
                      >
                        <div className="h-12 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
                        <div className="h-12 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
                      </div>
                    ))}
                  </div>
                ) : groups.upcoming.length > 0 ? (
                  <ul>
                    {groups.upcoming.map((b) => (
                      <AgendaRow
                        key={b.id}
                        booking={b}
                        viewerIsHost={viewerIsHost}
                        highlighted={highlighted.includes(b.id)}
                        onCancel={setCancelTargetId}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="border-b border-white/15 py-5 text-sm text-white/60">
                    {viewerIsHost
                      ? "No upcoming bookings on this page."
                      : "Nothing coming up."}
                  </p>
                )}
              </section>

              {groups.past.length > 0 && (
                <section aria-labelledby="past-title">
                  <SectionHead
                    id="past-title"
                    title="Past"
                    count={groups.past.length}
                    note="Completed and cancelled bookings, most recent first."
                  />
                  <ul>
                    {groups.past.map((b) => (
                      <AgendaRow
                        key={b.id}
                        booking={b}
                        viewerIsHost={viewerIsHost}
                        highlighted={highlighted.includes(b.id)}
                        onCancel={setCancelTargetId}
                      />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </>
        )}

        {!loading && totalPages > 1 && (
          <SheetPager page={page} totalPages={totalPages} onPage={setPage} />
        )}
      </main>

      {cancelTargetId && (
        <CancelBookingModal
          bookingId={cancelTargetId}
          onClose={() => setCancelTargetId(null)}
          onSuccess={() => {
            setCancelTargetId(null);
            toast.success(
              "Booking cancelled. Refund (if any) will appear in 5–10 business days.",
            );
            refetch();
            if (!viewerIsHost) upcomingQuery.refetch();
          }}
        />
      )}
    </div>
  );
}

/** A single sheet for empty and error states. */
function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-12 max-w-2xl rounded-2xl border border-white/15 bg-surface p-8 sm:p-10">
      <h2 className="font-landing-display text-3xl leading-[0.95] text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
        {body}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** The strip and the first agenda rows, drawn in outline while the first page loads. */
function SkeletonPages() {
  return (
    <div className="mt-10" aria-busy="true" aria-label="Loading bookings">
      <div className="mb-3 h-8 w-48 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
      <div className="h-20 animate-pulse border-y border-white/15 bg-white/3 motion-reduce:animate-none" />
      <div className="mt-14 mb-5 h-8 w-56 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-white/15 py-5 sm:grid-cols-[5rem_1fr]"
        >
          <div className="h-12 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
          <div className="h-12 animate-pulse rounded bg-white/6 motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}
