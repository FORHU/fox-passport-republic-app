"use client";

import Link from "next/link";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { ROLES, useFoxerTotal } from "./data";
import { CountUp, Kicker, Reveal } from "./motion";

function SectionHead({
  kicker,
  title,
  aside,
}: {
  kicker: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
      <Reveal>
        <Kicker>{kicker}</Kicker>
        <h2 className="font-landing-display mt-2 text-4xl leading-[0.92] text-white sm:text-6xl">
          {title}
        </h2>
      </Reveal>
      {aside}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Four steps from idea to the night
// ---------------------------------------------------------------------------

const ITINERARY = [
  {
    title: "Pick a night",
    line: "Search by city and type. Weddings, birthdays, corporate nights, socials.",
  },
  {
    title: "Book the crew",
    line: "A venue, gear, talent and performers in one booking, from verified Foxers.",
  },
  {
    title: "Show up",
    line: "Check in at the door and enjoy it. Your booking is saved in your account.",
  },
  {
    title: "Come back for more",
    line: "Rebook in a tap, and every event you attend adds a stamp to your passport.",
  },
];

export function Itinerary() {
  return (
    <section className="bg-canvas px-5 py-14 sm:px-10 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          kicker="How it works"
          title={
            <>
              Four steps
              <br />
              to the night
            </>
          }
        />
        <div className="grid overflow-hidden rounded-2xl border border-white/15 bg-surface md:grid-cols-4">
          {ITINERARY.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative h-full border-b border-dashed border-white/20 p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <p className="font-landing-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-landing-display mt-8 text-2xl leading-none text-white sm:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {s.line}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// For the people who supply events
// ---------------------------------------------------------------------------

/** One short block: you can earn from events too. Roles, and one way in. */
export function EarnBlock() {
  const foxers = useFoxerTotal();
  return (
    <section className="bg-canvas px-5 pb-14 sm:px-10 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="grid gap-8 rounded-3xl border border-white/15 bg-surface p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
            <div>
              <Kicker>Earn with FoxPassport</Kicker>
              <h2 className="font-landing-display mt-2 text-3xl leading-[0.95] text-white sm:text-5xl">
                Run venues, gear
                <br />
                or talent?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                List what you offer and get booked for other people&apos;s
                events. Apply, get verified, and start earning.
                {foxers > 0 && (
                  <>
                    {" "}
                    <CountUp
                      to={foxers}
                      className="font-bold text-white"
                    />{" "}
                    verified Foxers already do.
                  </>
                )}
              </p>
              <Link
                href="/onboarding"
                className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black"
              >
                Apply as a Foxer
              </Link>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {ROLES.map((r) => (
                <li key={r.key}>
                  <Link
                    href={r.applyHref}
                    className="group flex h-full flex-col rounded-xl border border-white/15 p-4 transition-colors hover:border-accent/60 hover:bg-white/5"
                  >
                    <span className="font-landing-mono flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-white">
                      {r.name}
                      <span className="inline-block transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                    <span className="mt-1.5 text-sm leading-snug text-white/70">
                      {r.line}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Closing call to action
// ---------------------------------------------------------------------------

export function ClosingCta() {
  const user = useAuthStore((s) => s.user);
  const openSignup = useAuthStore((s) => s.openSignup);
  const foxers = useFoxerTotal();
  return (
    <section className="bg-canvas px-5 py-20 text-center sm:py-28">
      <Reveal>
        <h2 className="font-landing-display mx-auto max-w-5xl text-5xl leading-[0.9] text-white sm:text-7xl lg:text-[6.5rem]">
          Book your
          <br />
          <span style={{ color: "var(--accent-text)" }}>first event</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-white/60 sm:text-base">
          Free to join. Your first event is a few taps away.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {user ? (
            <Link
              href="/search"
              className="rounded-full bg-accent px-7 py-3.5 text-sm font-extrabold text-black"
            >
              Find an event
            </Link>
          ) : (
            <button
              type="button"
              onClick={openSignup}
              className="cursor-pointer rounded-full bg-accent px-7 py-3.5 text-sm font-extrabold text-black"
            >
              Create a free account
            </button>
          )}
        </div>
        {foxers > 0 && (
          <p className="font-landing-mono mt-8 text-xs uppercase tracking-[0.2em] text-white/70">
            <CountUp to={foxers} className="text-base font-bold text-white" />{" "}
            verified Foxers ready to work your night
          </p>
        )}
      </Reveal>
    </section>
  );
}
