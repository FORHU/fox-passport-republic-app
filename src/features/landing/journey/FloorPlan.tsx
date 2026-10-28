"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Arrow } from "./Arrow";

/**
 * How one night is put together, drawn as an event floor plan. Each zone is
 * supplied by a kind of Foxer; an Event Foxer puts them into one package and
 * guests book the whole plan. The plan is a picture (pointer users can click
 * a zone); the legend beside it carries the same links for everyone.
 */

type Rect = { x: number; y: number; w: number; h: number };

const BLUE = "var(--stamp-blue)";
const RED = "var(--stamp-red)";
const LIME = "var(--accent-text)";
const LINE = "color-mix(in srgb, var(--color-white) 55%, transparent)";

const ZONES: {
  n: number;
  id: string;
  /** The short label written on the plan; the legend gives the full name. */
  mark: string;
  name: string;
  who: string;
  line: string;
  href: string;
  ink: string;
  hatch?: boolean;
  /** Position in % of the plan, wide screens (16:10) and phones (4:5). */
  wide: Rect;
  tall: Rect;
}[] = [
  {
    n: 1,
    id: "room",
    mark: "Room",
    name: "The room",
    who: "Venue Foxer",
    line: "The space itself, listed by the venue.",
    href: "/earn/venue",
    ink: LINE,
    wide: { x: 22, y: 31, w: 56, h: 37 },
    tall: { x: 27, y: 22, w: 69, h: 40 },
  },
  {
    n: 2,
    id: "stage",
    mark: "Stage",
    name: "Stage",
    who: "Performer",
    line: "DJs, bands, hosts and photographers.",
    href: "/earn/performer",
    ink: RED,
    hatch: true,
    wide: { x: 30, y: 5, w: 40, h: 20 },
    tall: { x: 18, y: 3, w: 64, h: 14 },
  },
  {
    n: 3,
    id: "bar",
    mark: "Bar",
    name: "Bar & kitchen",
    who: "Talent Foxer",
    line: "Catering, design and staff.",
    href: "/earn/talent",
    ink: BLUE,
    wide: { x: 3.5, y: 26, w: 14, h: 56 },
    tall: { x: 4, y: 22, w: 19, h: 46 },
  },
  {
    n: 4,
    id: "sound",
    mark: "Sound",
    name: "Sound & lights",
    who: "Gear Foxer",
    line: "Sound, lights, staging and furniture.",
    href: "/earn/gear",
    ink: BLUE,
    wide: { x: 40, y: 74, w: 20, h: 18 },
    tall: { x: 36, y: 67, w: 30, h: 12 },
  },
  {
    n: 5,
    id: "door",
    mark: "Door",
    name: "Door",
    who: "Guests",
    line: "Your booking's QR code checks you in.",
    href: "/packages",
    ink: LIME,
    wide: { x: 82, y: 72, w: 15, h: 24 },
    tall: { x: 66, y: 84, w: 30, h: 13 },
  },
];

/** The same order as the hero tour's cards, so the page tells one story. */
const NOTES = [
  {
    title: "Plan it in one place",
    line: "The venue, the gear and the crew for any event, found and booked in one place.",
  },
  {
    title: "Book people you can trust",
    line: "Every venue and supplier is ID-checked and reviewed by our team before they can take a booking.",
  },
  {
    title: "Know the price first",
    line: "Browse complete packages with prices. You only need an account when you book.",
  },
  {
    title: "On the night",
    line: "Your booking has a QR code. Show it at the entrance and you're checked in.",
  },
  {
    title: "Keep the night",
    line: "Every event you attend adds a stamp to your FoxPassport.",
  },
];

const pct = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/**
 * The outer walls, drawn in once from the top-left corner when the plan comes
 * into view, with the doorway left open on the right wall beside the door.
 */
function Walls({ doorway }: { doorway: { top: number; height: number } }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 border-[3px] border-white"
      initial={reduce ? false : { clipPath: "inset(0 100% 100% 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0% 0)" }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="absolute -right-[3px] w-[3px] bg-canvas"
        style={{ top: `${doorway.top}%`, height: `${doorway.height}%` }}
      />
    </motion.div>
  );
}

function Plan({
  active,
  setActive,
  layout,
}: {
  active: string | null;
  setActive: (id: string | null) => void;
  layout: "wide" | "tall";
}) {
  const router = useRouter();
  const wide = layout === "wide";
  return (
    <div
      aria-hidden
      className={`relative text-white ${
        wide ? "hidden aspect-16/10 md:block" : "aspect-4/5 md:hidden"
      }`}
    >
      <Walls
        doorway={wide ? { top: 72, height: 24 } : { top: 84, height: 13 }}
      />
      {ZONES.map((z) => {
        const on = active === z.id;
        const dim = active !== null && !on;
        return (
          <div
            key={z.id}
            onPointerEnter={() => setActive(z.id)}
            onPointerLeave={() => setActive(null)}
            onClick={() => router.push(z.href)}
            className="absolute flex cursor-pointer flex-col justify-end rounded-[3px] border-[1.5px] border-dashed p-2 pr-8 transition-[opacity,background-color,border-style] duration-300 md:p-3 md:pr-12"
            style={{
              ...pct(wide ? z.wide : z.tall),
              borderColor: z.ink,
              borderStyle: on ? "solid" : "dashed",
              opacity: dim ? 0.35 : 1,
              backgroundColor: on
                ? `color-mix(in srgb, ${z.ink} 16%, transparent)`
                : "transparent",
              backgroundImage: z.hatch
                ? `repeating-linear-gradient(135deg, color-mix(in srgb, ${z.ink} 22%, transparent) 0 1px, transparent 1px 9px)`
                : undefined,
            }}
          >
            {z.id === "room" && (
              <span className="mb-auto flex flex-wrap gap-3 pr-8 pt-1 md:gap-5 md:pt-2">
                {Array.from({ length: wide ? 10 : 12 }, (_, i) => (
                  <span
                    key={i}
                    className="h-5 w-5 rounded-full border md:h-9 md:w-9"
                    style={{ borderColor: LINE }}
                  />
                ))}
              </span>
            )}
            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-landing-mono text-[11px] font-bold text-black md:right-2.5 md:top-2.5 md:h-7 md:w-7 md:text-sm">
              {z.n}
            </span>
            <span className="font-landing-display text-[13px] leading-none md:text-lg lg:text-xl">
              {z.mark}
            </span>
            <span
              className="font-landing-mono mt-1 hidden text-xs font-bold uppercase tracking-[0.12em] lg:block"
              style={{ color: z.ink }}
            >
              {z.who}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function FloorPlan() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section
      id="how-it-works"
      className="landing-plan-grid scroll-mt-24 px-5 py-16 sm:px-10 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-5 border-b-2 border-white pb-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <h2 className="font-landing-display text-4xl leading-[0.92] text-white sm:text-6xl">
            Everything on the plan is{" "}
            <span className="text-(--accent-text)">bookable</span>.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            A night has five zones. Foxers supply each one, an Event Foxer puts
            them together into one package, and you book the whole plan at
            once.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-10">
          <div>
            <Plan active={active} setActive={setActive} layout="wide" />
            <Plan active={active} setActive={setActive} layout="tall" />
          </div>

          <div className="flex flex-col">
            <ul className="border-t border-white/15">
              {ZONES.map((z) => (
                <li key={z.id}>
                  <Link
                    href={z.href}
                    onPointerEnter={() => setActive(z.id)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(z.id)}
                    onBlur={() => setActive(null)}
                    className={`group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-white/15 px-1 py-3 transition-colors ${
                      active === z.id ? "bg-white/6" : ""
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent font-landing-mono text-sm font-bold text-black">
                      {z.n}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-landing-display text-lg leading-none text-white">
                          {z.name}
                        </span>
                        <span
                          className="font-landing-mono whitespace-nowrap text-xs font-bold uppercase tracking-[0.12em]"
                          style={{ color: z.ink === LINE ? undefined : z.ink }}
                        >
                          {z.who}
                        </span>
                      </span>
                      <span className="mt-1 block text-sm leading-snug text-white/70">
                        {z.line}
                      </span>
                    </span>
                    <Arrow className="text-white/70" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/earn/event"
              className="group mt-3 flex items-center justify-between gap-3 px-1 py-2 text-sm text-white/75 hover:text-white"
            >
              <span>
                <span className="font-bold text-white">Event Foxers</span> draw
                the plan: they put the zones together into one package.
              </span>
              <Arrow />
            </Link>
            <Link
              href="/packages"
              className="group mt-6 flex items-center justify-between rounded-2xl bg-accent px-6 py-5 text-black transition-colors hover:bg-accent-hover lg:mt-auto"
            >
              <span>
                <span className="block font-landing-display text-2xl leading-none">
                  Book the whole plan
                </span>
                <span className="mt-1.5 block text-sm font-semibold">
                  Ready-made events, one booking.
                </span>
              </span>
              <Arrow className="text-2xl" />
            </Link>
          </div>
        </div>

        <div className="mt-14 border-t border-white/15 pt-6">
          <h3 className="font-landing-display text-2xl text-white">
            General notes
          </h3>
          <ol className="font-landing-mono mt-5 grid list-decimal gap-x-12 gap-y-4 pl-6 text-sm leading-relaxed text-white/75 marker:font-bold marker:text-(--accent-text) md:grid-cols-2">
            {NOTES.map((note) => (
              <li key={note.title} className="pl-2">
                <span className="font-landing-mono font-bold text-white">
                  {note.title}.
                </span>{" "}
                {note.line}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
