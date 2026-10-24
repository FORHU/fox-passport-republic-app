"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Arrow } from "./Arrow";
import { Money } from "@/shared/components/ui/Money";
import { assetUrl } from "@/shared/lib/assets";
import { Reveal } from "./motion";
import {
  useEvents,
  useEventsQuery,
  type Destination,
  type LandingEvent,
  type LandingEventLocation,
} from "./data";


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
  "font-landing-mono mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-white/80";
const FIELD =
  "w-full bg-transparent text-base text-white placeholder:text-white/70 focus:outline-none";

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
        <span className={value ? "" : "text-white/70"}>
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
        <span className={value ? "" : "text-white/70"}>{shown}</span>
        <span aria-hidden className="text-sm text-white/70">
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
 * Find an event: what, where and when, all optional. It goes to the package
 * results (/packages), which signed-out visitors can browse.
 */
export function HeroSearch({
  initial,
}: {
  /** Prefill, for the results page's "change your search" bar. */
  initial?: { what?: string; where?: string; when?: string };
} = {}) {
  const router = useRouter();
  const [what, setWhat] = useState(initial?.what ?? "");
  const [where, setWhere] = useState(initial?.where ?? "");
  const [when, setWhen] = useState(initial?.when ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (what) q.set("category", what);
    if (where.trim()) {
      q.set("city", where.trim());
      q.set("label", where.trim());
    }
    if (when) q.set("startDate", when);
    // Package results, open to everyone; an account is only asked for at Reserve.
    router.push(`/packages${q.toString() ? `?${q}` : ""}`);
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
// Events to book, drawn as plan sheets
// ---------------------------------------------------------------------------

const CELL = "border-white/15 px-4 py-2.5";
const DATA =
  "font-landing-mono text-xs font-bold uppercase tracking-[0.12em] text-white/75";

/**
 * A sheet's title block: what kind of event, where, its name, its price and
 * the way on. The photo above it is the drawing.
 */
function TitleBlock({
  sheet,
  kind,
  place,
  name,
  price,
  action,
  lead = false,
}: {
  /** The sheet number the kind index points back to, e.g. E-01. */
  sheet?: string;
  kind: React.ReactNode;
  place?: React.ReactNode;
  name: React.ReactNode;
  price: React.ReactNode;
  action?: React.ReactNode;
  lead?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 border-t border-white/15">
      <span
        className={`${CELL} ${DATA} truncate ${place ? "border-r" : "col-span-2"}`}
      >
        {sheet && (
          <span className="mr-2 text-(--accent-text)">{sheet}</span>
        )}
        {kind}
      </span>
      {place && <span className={`${CELL} ${DATA} truncate`}>{place}</span>}
      <h3
        className={`col-span-2 border-t ${CELL} font-landing-display py-3 leading-[0.95] text-white ${
          lead ? "text-3xl sm:text-4xl" : "text-2xl"
        }`}
      >
        {name}
      </h3>
      <span
        className={`border-t ${CELL} ${DATA} tabular-nums ${action ? "border-r" : "col-span-2"}`}
      >
        {price}
      </span>
      {action}
    </div>
  );
}

function EventSheet({
  event,
  sheet,
  lead = false,
}: {
  event: LandingEvent;
  sheet: string;
  lead?: boolean;
}) {
  const photo = event.images?.find((image) => image.url)?.url;
  const place = [event.targetCity, event.targetCountry]
    .filter(Boolean)
    .join(", ");
  return (
    <Link
      href={`/event/${event.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-surface transition-colors hover:border-(--accent-text) ${
        lead ? "sm:col-span-2 lg:row-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-canvas ${
          lead ? "aspect-4/3 lg:aspect-auto lg:min-h-80 lg:flex-1" : "aspect-4/3"
        }`}
      >
        {photo && (
          <img
            src={photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>
      <TitleBlock
        lead={lead}
        sheet={sheet}
        kind={typeLabel(event.category)}
        place={place || undefined}
        name={event.name}
        price={
          event.estimatedTotal ? (
            <>
              From <Money amount={event.estimatedTotal} />
            </>
          ) : (
            <span className="text-white/55">Price on request</span>
          )
        }
        action={
          <span className="flex items-center justify-between gap-2 border-t border-white/15 bg-accent px-4 py-2.5 text-sm font-extrabold text-black">
            Book
            <Arrow />
          </span>
        }
      />
    </Link>
  );
}

/**
 * An example in the same frame as `EventSheet`, but plainly not one: dashed
 * border, faded photo, "Example" in its title block, and no link, so it can't
 * be selected or booked.
 */
function ExampleSheet({
  type,
  lead = false,
}: {
  type: (typeof EVENT_TYPES)[number];
  lead?: boolean;
}) {
  return (
    <article
      aria-label={`Example ${type.label} event, not bookable`}
      className={`flex flex-col overflow-hidden rounded-2xl border border-dashed border-white/30 bg-surface ${
        lead ? "sm:col-span-2 lg:row-span-2" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-canvas ${
          lead ? "aspect-4/3 lg:aspect-auto lg:min-h-80 lg:flex-1" : "aspect-4/3"
        }`}
      >
        <img
          src={kindPhoto(type.value)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={hideImage}
          className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale-[35%]"
        />
      </div>
      <TitleBlock
        lead={lead}
        kind={type.label}
        place={<span className="text-(--accent-text)">Example</span>}
        name={type.line}
        price="Not bookable yet"
      />
    </article>
  );
}

/**
 * What the grid shows while nothing is open to book: one template per kind,
 * named by the kind itself (no made-up events), with local photos so it never
 * depends on the API.
 */
type Kind = (typeof EVENT_TYPES)[number]["value"];

const EXAMPLE_PHOTOS: Record<Kind, string> = {
  wedding: "one-booking",
  birthday: "every-kind-of-event",
  corporate: "talent",
  social: "performers",
  other: "gear",
};

/** Where each photo's subject sits, so a tall or wide crop keeps it in frame. */
const KIND_PHOTO_POSITION: Record<Kind, string> = {
  wedding: "50% 40%",
  birthday: "55% 45%",
  corporate: "50% 55%",
  social: "60% 50%",
  other: "50% 65%",
};

const kindPhoto = (kind: Kind) =>
  assetUrl(`features/${EXAMPLE_PHOTOS[kind]}.jpg`);

/** A photo that can't load shows its frame's background, not a broken icon. */
const hideImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = "none";
};

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

  const destinationImage = destination.photos[0]?.src;

  return EVENT_TYPES.flatMap((type) => {
    const event = localEvents.find(
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

/** Sheet numbers for the events grid, shared with the kind index. */
const sheetNo = (i: number) => `E-${String(i + 1).padStart(2, "0")}`;

/** A section's title: the heading, and a line beside it on wide screens. */
function SheetHead({
  title,
  line,
}: {
  title: React.ReactNode;
  line: React.ReactNode;
}) {
  return (
    <div className="mb-8 grid gap-4 border-b-2 border-white pb-6 lg:grid-cols-[1fr_22rem] lg:items-end">
      <h2 className="font-landing-display text-4xl leading-[0.92] text-white sm:text-6xl">
        {title}
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
        {line}
      </p>
    </div>
  );
}

/** Events open to book, straight under the hero: one lead sheet, then the rest. */
export function EventGrid() {
  const { data, isPending, isError } = useEventsQuery(40);
  const shown = useMemo(() => oneOfEachKind(data ?? [], 5), [data]);

  // Nothing to book (not a failure): examples keep the section from looking
  // empty, and real events replace them as soon as there are any.
  const examples = !isPending && !isError && shown.length === 0;
  return (
    <section
      id="events"
      className="scroll-mt-4 px-5 pb-16 pt-16 sm:px-10 sm:pb-24 sm:pt-24"
    >
      <div className="mx-auto max-w-6xl">
        <SheetHead
          title={
            <>
              Pick a night.
              <br />
              Book it today.
            </>
          }
          line={
            examples
              ? "Nothing is open to book yet. These are examples of what you'll find here."
              : "Ready-made events with the venue, the gear and the crew already in. Book the whole thing in one go."
          }
        />
        {isPending && (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Loading events"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-4/5 animate-pulse rounded-2xl border border-white/10 bg-surface"
              />
            ))}
          </div>
        )}
        {!isPending && isError && shown.length === 0 && (
          <div className="rounded-2xl border border-white/15 bg-surface p-8">
            <p className="font-landing-display text-2xl text-white">
              We couldn&apos;t load the events.
            </p>
            <p className="mt-2 text-sm text-white/70">
              Check your connection and try again, or find a Foxer directly.
            </p>
            <Link
              href="/search"
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-extrabold text-black hover:bg-accent-hover"
            >
              Find Foxers
              <Arrow />
            </Link>
          </div>
        )}
        <div
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
            shown.length === 0 && !examples ? "hidden" : ""
          }`}
        >
          {examples
            ? EVENT_TYPES.map((t, i) => (
                <ExampleSheet key={t.value} type={t} lead={i === 0} />
              ))
            : shown.map((e, i) => (
                <EventSheet
                  key={e.id}
                  event={e}
                  sheet={sheetNo(i)}
                  lead={i === 0}
                />
              ))}
          {/* No events means no packages either, so the way on is the Foxers. */}
          <Link
            href={examples ? "/search" : "/packages"}
            className="group flex min-h-48 flex-col justify-end rounded-2xl bg-accent p-6 text-black transition-colors hover:bg-accent-hover"
          >
            <span className="flex items-end justify-between gap-3 font-landing-display text-4xl leading-[0.95]">
              <span>
                {examples ? "Plan it with" : "See all"}
                <br />
                {examples ? "a Foxer" : "events"}
              </span>
              <Arrow className="text-4xl" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Browse by kind of event: the sheet index
// ---------------------------------------------------------------------------

/** "01" … "05": a kind's place in the index. */
const indexNo = (i: number) => String(i + 1).padStart(2, "0");

/**
 * The five kinds of event, as the index of a drawing set, with a view of each.
 * Each row opens that kind's results; a real event of that kind, when there is
 * one, is only its preview. No counts: they came from a 40-event sample and
 * mostly read "0 events".
 *
 * Below `lg` each row is its own photo band (there is no hover to drive a
 * preview). From `lg` the rows are a plain index and one framed photo beside
 * them shows the row last pointed at or focused. Every row is one link at
 * every size, so the labels and links exist once.
 */
export function EventTypes() {
  const events = useEvents(40);
  // The same pick as the events grid above, so a kind can point at its sheet.
  const sheets = useMemo(() => oneOfEachKind(events, 5), [events]);
  // Stays on the last row shown rather than resetting, so the photo never
  // flickers as the pointer crosses the gaps between rows.
  const [active, setActive] = useState(0);

  return (
    <section className="px-5 pb-24 sm:px-10 sm:pb-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SheetHead
            title="What are you planning?"
            line="Choose one to see its ready-made packages, with the venue, gear and crew already in."
          />
        </Reveal>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:gap-16">
          <ul className="grid gap-3 lg:gap-0 lg:border-t lg:border-white/15">
            {EVENT_TYPES.map((t, i) => {
              const at = sheets.findIndex((e) => e.category === t.value);
              const on = i === active;
              return (
                <li key={t.value}>
                  <Reveal delay={i * 0.06} y={16}>
                    <Link
                      href={`/packages?category=${t.value}`}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      // A fixed dark band under the photo, so the white type
                      // stays readable in light mode if the photo can't load.
                      className="group relative isolate grid h-44 grid-cols-[1fr_auto] content-end gap-x-4 overflow-hidden rounded-2xl bg-[#14161f] p-5 text-[#fff] transition-transform duration-200 active:scale-[0.99] sm:h-52 sm:p-7 lg:h-auto lg:grid-cols-[2.5rem_minmax(0,1fr)_auto] lg:content-center lg:gap-x-6 lg:rounded-none lg:border-b lg:border-white/15 lg:bg-transparent lg:px-0 lg:py-6 lg:text-white lg:active:scale-100"
                    >
                      <img
                        src={kindPhoto(t.value)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={hideImage}
                        style={{ objectPosition: KIND_PHOTO_POSITION[t.value] }}
                        className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] lg:hidden"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 bg-linear-to-r from-[#000]/80 via-[#000]/45 to-[#000]/5 lg:hidden"
                      />
                      <span
                        aria-hidden
                        className={`col-start-1 row-start-1 font-landing-mono text-xs font-bold tracking-[0.16em] text-[#fff]/75 transition-colors lg:self-center ${
                          on ? "lg:text-(--accent-text)" : "lg:text-white/45"
                        }`}
                      >
                        {indexNo(i)}
                      </span>
                      <span
                        className={`col-start-1 row-start-2 mt-2 font-landing-display text-4xl leading-none transition-colors sm:text-5xl lg:col-start-2 lg:row-start-1 lg:mt-0 ${
                          on
                            ? "lg:text-(--accent-text)"
                            : "lg:group-hover:text-(--accent-text)"
                        }`}
                      >
                        {t.label}
                      </span>
                      <span className="col-start-1 row-start-3 mt-2 max-w-xs text-sm text-balance text-[#fff]/85 lg:col-start-2 lg:row-start-2 lg:max-w-md lg:text-white/70">
                        {t.line}
                        {at >= 0 && (
                          <span className="mt-1 block font-landing-mono text-xs font-bold uppercase tracking-[0.12em] text-[#fff]/75 lg:text-white/60">
                            Open now, see sheet{" "}
                            <span className="text-accent lg:text-(--accent-text)">
                              {sheetNo(at)}
                            </span>
                          </span>
                        )}
                      </span>
                      <Arrow
                        className={`col-start-2 row-start-3 self-end text-2xl lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:self-center ${
                          on
                            ? "lg:translate-x-1 lg:text-(--accent-text)"
                            : "lg:text-white/60"
                        }`}
                      />
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          {/* The view: the active kind's photo. Decorative, since its label is
              right beside it; crossfades so the eye follows the swap. */}
          <aside
            aria-hidden
            data-kind={EVENT_TYPES[active].value}
            className="sticky top-24 hidden lg:block"
          >
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface">
              {EVENT_TYPES.map((t, i) => (
                <img
                  key={t.value}
                  src={kindPhoto(t.value)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={hideImage}
                  style={{ objectPosition: KIND_PHOTO_POSITION[t.value] }}
                  className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                    i === active
                      ? "scale-100 opacity-100"
                      : "opacity-0 motion-safe:scale-[1.04]"
                  }`}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#000]/70 to-transparent px-5 pb-4 pt-16">
                <p className="font-landing-mono text-xs font-bold tracking-[0.16em] text-[#fff]/85">
                  {indexNo(active)} / {indexNo(EVENT_TYPES.length - 1)}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
