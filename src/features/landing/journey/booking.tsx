"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Money } from "@/shared/components/ui/Money";
import {
  useEvents,
  useEventsQuery,
  type Destination,
  type LandingEvent,
  type LandingEventLocation,
} from "./data";
import { Kicker, Reveal } from "./motion";

/** The five kinds of event the platform has, in the words people use. */
export const EVENT_TYPES = [
  { value: "wedding", label: "Wedding", line: "Ceremonies and receptions." },
  { value: "birthday", label: "Birthday", line: "Parties of every size." },
  {
    value: "corporate",
    label: "Corporate",
    line: "Launches, offsites, dinners.",
  },
  { value: "social", label: "Social", line: "Parties and nights out." },
  { value: "other", label: "Other", line: "Anything that needs a venue." },
] as const;

const typeLabel = (value?: string) =>
  EVENT_TYPES.find((t) => t.value === value)?.label ?? value ?? "Event";

// ---------------------------------------------------------------------------
// Search, on the hero
// ---------------------------------------------------------------------------

const FIELD_LABEL =
  "font-landing-mono mb-1 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/70";
const FIELD =
  "w-full bg-transparent text-base text-white placeholder:text-white/35 focus:outline-none";

/**
 * The kind-of-event picker. A native select opens the operating system's own
 * white list, which clashes with the page, so this draws its own and works
 * with the keyboard the same way: arrows change the choice, Enter or Space
 * opens and closes the list, Escape closes it.
 */
function KindPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const options = [{ value: "", label: "Any event" }, ...EVENT_TYPES];
  const at = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next =
        (at + (e.key === "ArrowDown" ? 1 : -1) + options.length) %
        options.length;
      onChange(options[next].value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Type of event"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`${FIELD} flex cursor-pointer items-center justify-between gap-2 text-left`}
      >
        <span className={value ? "" : "text-white/80"}>
          {options[at].label}
        </span>
        <span
          aria-hidden
          className={`text-xs text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Type of event"
          className="absolute bottom-[calc(100%+1.1rem)] left-[-1rem] z-50 w-60 rounded-2xl border border-white/15 bg-surface p-1.5 shadow-2xl"
        >
          {options.map((o) => {
            const on = o.value === value;
            return (
              <li key={o.value || "any"} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    on
                      ? "bg-accent text-black font-bold"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  {o.label}
                  {on && <span aria-hidden>✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
/** A date as the YYYY-MM-DD the search takes, in the visitor's own time zone. */
const dayKey = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * The date picker. The browser's own calendar is drawn by the operating system
 * in grey and blue, so this draws one that matches the page. Days and month
 * names come from the visitor's locale; days before today can't be picked.
 */
function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const now = new Date();
  const todayKey = dayKey(now.getFullYear(), now.getMonth(), now.getDate());
  const picked = value ? new Date(`${value}T00:00:00`) : null;
  const [year, setYear] = useState((picked ?? now).getFullYear());
  const [month, setMonth] = useState((picked ?? now).getMonth());

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short" });
    // 2023-01-01 was a Sunday.
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(2023, 0, 1 + i)).slice(0, 2),
    );
  }, []);
  const title = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
  const shown = picked
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(picked)
    : "Any date";

  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(first).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  const move = (by: number) => {
    const d = new Date(year, month + by, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };
  const nav =
    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10";

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Date"
        onClick={() => setOpen((o) => !o)}
        className={`${FIELD} flex cursor-pointer items-center justify-between gap-2 text-left`}
      >
        <span className={value ? "" : "text-white/35"}>{shown}</span>
        <span aria-hidden className="text-sm text-white/60">
          ▦
        </span>
      </button>
      {open && (
        <div
          id={listId}
          role="dialog"
          aria-label="Choose a date"
          className="absolute bottom-[calc(100%+1.1rem)] left-0 z-50 w-72 rounded-2xl border border-white/15 bg-surface p-3 shadow-2xl sm:left-[-1rem]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => move(-1)}
              className={nav}
            >
              ‹
            </button>
            <p className="font-landing-mono text-xs font-bold uppercase tracking-[0.14em] text-white">
              {title}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => move(1)}
              className={nav}
            >
              ›
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center">
            {weekdays.map((w, i) => (
              <span
                key={i}
                className="font-landing-mono py-1 text-[10px] font-bold uppercase text-white/55"
              >
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((d, i) => {
              if (d === null) return <span key={`e${i}`} />;
              const key = dayKey(year, month, d);
              const past = key < todayKey;
              const on = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={past}
                  aria-pressed={on}
                  onClick={() => pick(key)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                    on
                      ? "bg-accent font-extrabold text-black"
                      : past
                        ? "cursor-not-allowed text-white/25"
                        : `cursor-pointer text-white/90 hover:bg-white/10 ${
                            key === todayKey ? "ring-1 ring-white/40" : ""
                          }`
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => pick("")}
              className="cursor-pointer rounded-full px-3 py-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => pick(todayKey)}
              className="cursor-pointer rounded-full px-3 py-1.5 text-[color:var(--accent-text)] hover:bg-white/10"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Find an event: what, where and when, all optional. It goes to the same
 * results page the rest of the app uses.
 */
export function HeroSearch() {
  const router = useRouter();
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (what) q.set("category", what);
    if (where.trim()) {
      q.set("city", where.trim());
      q.set("label", where.trim());
    }
    if (when) q.set("startDate", when);
    router.push(`/search${q.toString() ? `?${q}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      className="pointer-events-auto mt-8 w-full max-w-3xl rounded-2xl border border-white/15 bg-black/55 p-2 shadow-2xl backdrop-blur-md sm:rounded-full sm:p-2.5"
    >
      <div className="grid gap-1 sm:grid-cols-[1fr_1.2fr_1fr_auto] sm:items-center sm:gap-0">
        <div className="block rounded-xl px-4 py-2.5 hover:bg-white/5 sm:rounded-full">
          <span className={FIELD_LABEL}>What</span>
          <KindPicker value={what} onChange={setWhat} />
        </div>
        <label className="block rounded-xl border-white/10 px-4 py-2.5 hover:bg-white/5 sm:rounded-full sm:border-l">
          <span className={FIELD_LABEL}>Where</span>
          <input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Any city"
            className={FIELD}
            aria-label="City"
          />
        </label>
        <div className="block rounded-xl border-white/10 px-4 py-2.5 hover:bg-white/5 sm:rounded-full sm:border-l">
          <span className={FIELD_LABEL}>When</span>
          <DatePicker value={when} onChange={setWhen} />
        </div>
        <button
          type="submit"
          className="mt-1 cursor-pointer rounded-xl bg-accent px-7 py-3.5 text-sm font-extrabold text-black transition-transform hover:scale-[1.03] active:scale-95 sm:mt-0 sm:rounded-full"
        >
          Find events
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Events to book
// ---------------------------------------------------------------------------

function EventCard({ event, index }: { event: LandingEvent; index: number }) {
  const reduce = useReducedMotion();
  const photo = event.images?.[0]?.url;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ delay: (index % 3) * 0.08, duration: 0.6 }}
    >
      <Link
        href={`/event/${event.id}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface"
      >
        {photo && (
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#000]/85 via-[#000]/15 to-transparent"
        />
        <span className="font-landing-mono absolute left-3 top-3 rounded-full bg-[#000]/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fff] backdrop-blur">
          {typeLabel(event.category)}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-landing-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#fff]/85">
            {event.targetCity ?? ""}
          </p>
          <h3 className="font-landing-display mt-1 text-2xl leading-[0.95] text-[#fff] sm:text-3xl">
            {event.name}
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-landing-mono text-xs font-bold text-[#fff]/80">
              {event.estimatedTotal ? (
                <>
                  From <Money amount={event.estimatedTotal} />
                </>
              ) : (
                "Get a quote"
              )}
            </span>
            <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-extrabold text-black transition-transform group-hover:translate-x-0.5">
              Book →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * One event for each kind, so the grid shows variety rather than the same
 * kind of event six times; anything left over fills the remaining places.
 */
export function oneOfEachKind(events: LandingEvent[], max: number) {
  const picked: LandingEvent[] = [];
  const seen = new Set<string>();
  for (const t of EVENT_TYPES) {
    const e = events.find((x) => x.category === t.value);
    if (e && picked.length < max) {
      picked.push(e);
      seen.add(e.id);
    }
  }
  for (const e of events) {
    if (picked.length >= max) break;
    if (!seen.has(e.id)) picked.push(e);
  }
  return picked;
}

/** Prefer a real event with a photo for each event-type feature card. */
export function featuredEventForKind(
  events: LandingEvent[],
  kind: string,
): LandingEvent | undefined {
  return (
    events.find(
      (event) =>
        event.category === kind &&
        event.images?.some((image) => Boolean(image.url)),
    ) ?? events.find((event) => event.category === kind)
  );
}

/** Photo-led cards for local listings, with place-specific searches as fallback. */
export function destinationEventCards(
  destination: Pick<Destination, "lat" | "lng" | "photos">,
  locations: LandingEventLocation[],
  max = 4,
) {
  const cos = Math.cos((destination.lat * Math.PI) / 180);
  const localEvents = Array.from(
    new Map(
      locations
        .filter(
          (location) =>
            Math.hypot(
              location.lat - destination.lat,
              (location.lng - destination.lng) * cos,
            ) < 1.2,
        )
        .flatMap((location) => location.events)
        .map((event) => [event.id, event]),
    ).values(),
  );

  const destinationImage =
    destination.photos.find((photo) => photo.subject === "city")?.src ??
    destination.photos[0]?.src;

  return EVENT_TYPES.flatMap((type) => {
    const event =
      localEvents.find(
        (item) =>
          item.category === type.value &&
          item.images?.some((image) => Boolean(image.url)),
      );
    const image = event?.images?.find((item) => Boolean(item.url))?.url;
    const cardImage = image ?? destinationImage;
    return cardImage
      ? [{ kind: type.value, label: type.label, event, image: cardImage }]
      : [];
  }).slice(0, max);
}

/** Events open to book, large, straight under the hero. */
export function EventGrid() {
  const { data, isPending, isError } = useEventsQuery(40);
  const shown = useMemo(() => oneOfEachKind(data ?? [], 5), [data]);
  return (
    <section
      id="events"
      className="scroll-mt-4 bg-canvas px-5 pb-12 pt-14 sm:px-10 sm:pb-16 sm:pt-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
          <Reveal>
            <Kicker>Open for booking</Kicker>
            <h2 className="font-landing-display mt-2 text-4xl leading-[0.92] text-white sm:text-6xl">
              Pick an event.
              <br />
              Book it today.
            </h2>
          </Reveal>
        </div>
        {isPending && (
          <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Loading events"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-2xl border border-white/10 bg-surface"
              />
            ))}
          </div>
        )}
        {!isPending && shown.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center">
            <p className="font-landing-display text-2xl text-white">
              {isError
                ? "We couldn't load the events."
                : "No events are open to book yet."}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {isError
                ? "Check your connection and try again, or search directly."
                : "Check back soon, or search for a venue."}
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black"
            >
              Search events
            </Link>
          </div>
        )}
        <div
          className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
            shown.length === 0 ? "hidden" : ""
          }`}
        >
          {shown.map((e, i) => (
            <EventCard key={e.id} event={e} index={i} />
          ))}
          <Link
            href="/search"
            className="group flex min-h-48 flex-col justify-between rounded-2xl border border-accent/40 bg-accent/10 p-6 transition-colors hover:bg-accent/20 sm:aspect-[4/5]"
          >
            <span className="font-landing-mono text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--accent-text)]">
              More to book
            </span>
            <span className="font-landing-display text-4xl leading-[0.95] text-white sm:text-5xl">
              See all
              <br />
              events{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Browse by kind of event
// ---------------------------------------------------------------------------

/** The five kinds of event, each with how many there are. */
export function EventTypes() {
  const events = useEvents(40);
  const reduce = useReducedMotion();
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events)
      if (e.category) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    return map;
  }, [events]);

  return (
    <section className="bg-canvas px-5 pb-14 sm:px-10 sm:pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 border-b border-white/15 pb-5">
          <Reveal>
            <Kicker>Browse by event</Kicker>
            <h2 className="font-landing-display mt-2 text-4xl leading-[0.92] text-white sm:text-5xl">
              What are you planning?
            </h2>
          </Reveal>
        </div>
        {/* A row you swipe on a phone, five across on a desktop. */}
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 xl:grid-cols-5">
          {EVENT_TYPES.map((t, i) => {
            const n = counts.get(t.value) ?? 0;
            const featured = featuredEventForKind(events, t.value);
            const photo = featured?.images?.find((image) => image.url)?.url;
            const href = featured
              ? `/event/${featured.id}`
              : `/search?category=${t.value}`;
            return (
              <motion.div
                key={t.value}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="min-w-[200px] shrink-0 snap-start sm:min-w-0"
              >
                <Link
                  href={href}
                  className="group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-surface transition-colors hover:border-accent/50"
                >
                  {photo && (
                    <img
                      src={photo}
                      alt={featured ? `${featured.name} event` : ""}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div
                    aria-hidden
                    className={`absolute inset-0 ${
                      photo
                        ? "bg-gradient-to-t from-[#000]/90 via-[#000]/35 to-[#000]/10"
                        : "bg-gradient-to-br from-white/[0.06] to-transparent"
                    }`}
                  />
                  <div className="relative flex items-start justify-between gap-3 p-4">
                    <span className="font-landing-mono rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                      {t.label}
                    </span>
                    <span className="font-landing-mono rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white/90 backdrop-blur">
                      {n} {n === 1 ? "event" : "events"}
                    </span>
                  </div>
                  <div className="relative mt-auto p-4">
                    {featured ? (
                      <>
                        {(featured.targetCity || featured.targetCountry) && (
                          <p className="font-landing-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                            {[featured.targetCity, featured.targetCountry]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                        <h3 className="font-landing-display mt-1 text-2xl leading-[0.95] text-white">
                          {featured.name}
                        </h3>
                        {featured.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-snug text-white/75">
                            {featured.description}
                          </p>
                        )}
                        <p className="font-landing-mono mt-3 text-xs font-bold text-white/85">
                          {featured.estimatedTotal ? (
                            <>
                              From <Money amount={featured.estimatedTotal} />
                            </>
                          ) : (
                            "Get a quote"
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-landing-display text-2xl leading-none text-white">
                          {t.label}
                        </h3>
                        <p className="mt-2 text-sm text-white/70">{t.line}</p>
                      </>
                    )}
                    <p className="font-landing-mono mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent-text)]">
                      {featured ? "View event" : "Browse events"}
                      <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
