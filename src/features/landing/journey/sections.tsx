"use client";

import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { signInThen } from "@/shared/auth/returnTo";
import { ROLES, useFoxerTotal } from "./data";
import { CountUp } from "./motion";
import { Arrow } from "./Arrow";

// ---------------------------------------------------------------------------
// For the people who supply events: the schedule of trades
// ---------------------------------------------------------------------------

/** Where each role sits on the floor plan (see FloorPlan.tsx). */
const ZONE: Record<string, string> = {
  event: "Whole plan",
  venue: "1 · Room",
  performer: "2 · Stage",
  talent: "3 · Bar",
  gear: "4 · Sound",
  organizer: "5 · Door",
  partner: "Backing",
};

const APPLY_CTA =
  "group mt-8 inline-flex items-center gap-3 rounded-full bg-accent py-3 pl-6 pr-5 text-sm font-extrabold text-black transition-colors hover:bg-accent-hover sm:text-base";

/**
 * Supplying events, as the plan's schedule of trades. Each row opens that
 * role's public docs page (/earn/<key>). They used to link straight to the
 * protected apply routes, which bounced signed-out visitors to the hero.
 */
export function EarnBlock() {
  const foxers = useFoxerTotal();
  const user = useAuthStore((s) => s.user);

  return (
    <section
      id="earn"
      className="scroll-mt-28 border-t-2 border-white px-5 py-16 sm:px-10 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
        <div>
          <h2 className="font-landing-display text-4xl leading-[0.92] text-white sm:text-5xl">
            Supply a zone. Get booked for the{" "}
            <span className="text-(--accent-text)">whole night</span>.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            List your venue, gear or services once. Event Foxers bundle your
            listing into complete event packages, so you get booked without
            selling.
          </p>
          {/* /onboarding is protected: signed out, sign in first.
              "Free": there is no listing or setup fee, only the
              platform fee on bookings. */}
          {user ? (
            <Link href="/onboarding" className={APPLY_CTA}>
              Start my free listing
              <Arrow />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signInThen("/onboarding")}
              className={`${APPLY_CTA} cursor-pointer`}
            >
              Start my free listing
              <Arrow />
            </button>
          )}
          {foxers > 0 && (
            <p className="mt-4 text-sm text-white/70">
              <CountUp
                to={foxers}
                className="font-bold tabular-nums text-(--accent-text)"
              />{" "}
              verified Foxers already get booked here
            </p>
          )}
        </div>

        <div>
          <h3 className="font-landing-display text-2xl text-white">
            Schedule of trades
          </h3>
          <div
            aria-hidden
            className="font-landing-mono mt-4 hidden grid-cols-[11rem_1fr_7rem_1.5rem] gap-6 border-b border-white/15 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-white/60 sm:grid"
          >
            <span>Trade</span>
            <span>Supplies</span>
            <span>On the plan</span>
            <span />
          </div>
          <ul className="mt-4 border-t border-white/15 sm:mt-0 sm:border-t-0">
            {ROLES.map((r) => (
              <li key={r.key}>
                <Link
                  href={`/earn/${r.key}`}
                  className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-white/15 py-4 transition-colors hover:bg-white/3 sm:grid-cols-[11rem_1fr_7rem_1.5rem]"
                >
                  <span className="font-landing-display text-xl leading-none text-white transition-colors group-hover:text-(--accent-text)">
                    {r.name}
                  </span>
                  <span className="col-start-1 row-start-2 text-sm leading-snug text-white/70 sm:col-start-2 sm:row-start-1">
                    {r.line}
                  </span>
                  <span className="font-landing-mono hidden text-xs font-bold uppercase tracking-[0.12em] text-white/75 sm:block">
                    {ZONE[r.key]}
                  </span>
                  <Arrow className="row-span-2 text-xl text-white/70 sm:row-span-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Closing call to action: the plan's title block
// ---------------------------------------------------------------------------

// Smaller than the hero headline, so the page's first line stays its biggest.
// No Foxer count here: the hero's closing card and the earn block show it.
export function ClosingCta() {
  const user = useAuthStore((s) => s.user);
  const openSignup = useAuthStore((s) => s.openSignup);
  const action =
    "group flex items-center justify-between gap-4 bg-accent px-6 py-5 text-base font-extrabold text-black transition-colors hover:bg-accent-hover";
  return (
    <section className="px-5 pb-20 sm:px-10 sm:pb-28">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border-2 border-white lg:grid-cols-[1fr_22rem]">
        <h2 className="font-landing-display p-8 text-5xl leading-[0.9] text-white sm:p-12 sm:text-6xl">
          Book your
          <br />
          <span className="text-(--accent-text)">first event</span>.
        </h2>
        <div className="grid border-t-2 border-white lg:border-l-2 lg:border-t-0">
          <p className="border-b border-white/15 px-6 py-6 text-sm leading-relaxed text-white/75">
            <span className="font-bold text-white">Free to join.</span> Browse
            every package without an account; you only need one when you book.
          </p>
          {user ? (
            <Link href="/packages" className={action}>
              Find an event
              <Arrow className="text-2xl" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={openSignup}
              className={`${action} cursor-pointer text-left`}
            >
              Create a free account
              <Arrow className="text-2xl" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
