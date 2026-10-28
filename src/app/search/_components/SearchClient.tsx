"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import SearchFilters, {
  EVENT_KINDS,
  FILTER_PARAMS,
} from "@/features/search/components/SearchFilters";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import EventFoxerList from "@/features/search/components/EventFoxersSection";
import ProviderList from "@/features/search/components/ProviderList";
import SearchPagination from "@/features/search/components/SearchPagination";
import {
  ResultsEmpty,
  ResultsError,
} from "@/features/search/components/ResultsState";
import {
  fetchEventFoxers,
  fetchGearFoxers,
  fetchServiceFoxers,
  type SectionResult,
} from "@/features/search/api/search";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { Money } from "@/shared/components/ui/Money";

type TypeKey = "event_foxer" | "gear" | "service";
/** "" is the All tab. */
type ViewKey = "" | TypeKey;

// Each kind of Foxer the directory lists. `preview` is how many the All tab
// shows; `perPage` is a page of that type's own tab.
const TYPES: Record<
  TypeKey,
  {
    tab: string;
    title: string;
    noun: string;
    description: string;
    icon: string;
    preview: number;
    perPage: number;
  }
> = {
  event_foxer: {
    tab: "Event Foxers",
    title: "Event Foxers",
    noun: "Event Foxers",
    description: "Plan and run your whole event, from the venue to the crew.",
    icon: "celebration",
    // Two columns at most, so previews and pages come in even rows.
    preview: 2,
    perPage: 8,
  },
  gear: {
    tab: "Gear",
    title: "Gear",
    noun: "gear listings",
    description: "Sound, lighting, staging and furniture to rent.",
    icon: "speaker",
    preview: 4,
    perPage: 12,
  },
  service: {
    tab: "Talent",
    title: "Talent",
    noun: "talent listings",
    description: "Catering, design, staffing and performers, booked by the job.",
    icon: "design_services",
    preview: 4,
    perPage: 12,
  },
};
const TYPE_KEYS = Object.keys(TYPES) as TypeKey[];
const VIEWS: ViewKey[] = ["", ...TYPE_KEYS];

const isType = (v: string | null): v is TypeKey =>
  !!v && (TYPE_KEYS as string[]).includes(v);

const tabId = (v: ViewKey) => `foxer-tab-${v || "all"}`;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** One kind of Foxer: its heading, its list in every state, and (on its own
 * tab) its pagination. */
function TypeSection({
  type,
  query,
  preview,
  page,
  filtered,
  kindIgnored,
  onSeeAll,
  onPageChange,
  onClear,
}: {
  type: TypeKey;
  query: UseQueryResult<SectionResult<any>>;
  preview: boolean;
  page: number;
  filtered: boolean;
  /** A kind-of-event filter is set, which this type doesn't support. */
  kindIgnored: boolean;
  onSeeAll: () => void;
  onPageChange: (page: number) => void;
  onClear: () => void;
}) {
  const meta = TYPES[type];
  const items = query.data?.items ?? [];
  const total = query.data?.pagination?.total ?? 0;
  const totalPages = query.data?.pagination?.totalPages ?? 1;
  const firstLoad = query.isPending;
  const refetching = query.isFetching && !query.isPending;

  const from = (page - 1) * meta.perPage + 1;
  const to = Math.min(page * meta.perPage, total);

  return (
    <section aria-labelledby={`${type}-heading`} className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2
            id={`${type}-heading`}
            className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            {meta.title}
          </h2>
          <p className="mt-1 text-sm text-white/70">{meta.description}</p>
          {kindIgnored && (
            <p className="mt-1 text-xs text-white/60">
              The kind-of-event filter doesn&apos;t apply to {meta.noun}.
            </p>
          )}
        </div>
        {preview
          ? total > meta.preview && (
              <button
                type="button"
                onClick={onSeeAll}
                className="group inline-flex items-center gap-1 text-sm font-bold text-(--accent-text) hover:underline"
              >
                See all {total} {meta.noun}
                <span
                  aria-hidden
                  className="material-symbols-outlined text-[18px] motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                >
                  arrow_forward
                </span>
              </button>
            )
          : total > 0 && (
              <p className="text-sm tabular-nums text-white/60">
                Showing {from}–{to} of {total}
              </p>
            )}
      </div>

      {query.isError && items.length === 0 ? (
        <ResultsError what={meta.noun} onRetry={() => query.refetch()} />
      ) : !firstLoad && items.length === 0 ? (
        <ResultsEmpty what={meta.noun} filtered={filtered} onClear={onClear} />
      ) : (
        <div
          aria-busy={query.isFetching}
          className={`transition-opacity duration-200 ${refetching ? "opacity-60" : ""}`}
        >
          {type === "event_foxer" ? (
            <EventFoxerList
              items={items}
              loading={firstLoad}
              skeletons={preview ? meta.preview : 4}
            />
          ) : (
            <ProviderList
              rows={items}
              loading={firstLoad}
              icon={meta.icon}
              skeletons={preview ? meta.preview : 6}
            />
          )}
        </div>
      )}

      {!preview && (
        <SearchPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          label={`${meta.title} pages`}
        />
      )}
    </section>
  );
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramsStr = searchParams?.toString() || "";

  const q = searchParams?.get("q") || "";
  const category = searchParams?.get("category") || "";
  // Filter on `city` only. `label` is the old map picker's display text — a
  // whole place name that matched no stored city.
  const city = searchParams?.get("city") || "";
  const maxPrice = searchParams?.get("maxPrice") || "";
  const typeParam = searchParams?.get("type") ?? null;
  // An unknown type (e.g. the retired "event_template") is the All tab.
  const view: ViewKey = isType(typeParam) ? typeParam : "";
  const page = view ? Math.max(1, Number(searchParams?.get("page")) || 1) : 1;
  // The city from their onboarding address, for the "near me" shortcut.
  const homeCity = useAuthStore((s) => s.user?.city)?.trim() || "";

  const [filtersOpen, setFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /** Writes params to the URL. A change starts again from page 1 unless the
   * change is the page itself. */
  const setParams = useCallback(
    (
      updates: Record<string, string | undefined>,
      { replace = false }: { replace?: boolean } = {},
    ) => {
      const params = new URLSearchParams(paramsStr);
      if (!("page" in updates)) params.delete("page");
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      const qs = params.toString();
      const url = `/search${qs ? `?${qs}` : ""}`;
      if (replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [paramsStr, router],
  );

  // The search box keeps its own text while typing and writes it to the URL
  // after a pause. `pushedQ` is the last value it wrote, so a change to `q`
  // from anywhere else (a removed chip, Clear, back/forward) refills the box
  // without fighting the typing.
  const [searchQuery, setSearchQuery] = useState(q);
  const [pushedQ, setPushedQ] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    if (q !== pushedQ) setSearchQuery(q);
  }
  useEffect(() => {
    if (searchQuery === q) return;
    const timer = setTimeout(() => {
      setPushedQ(searchQuery);
      setParams({ q: searchQuery || undefined }, { replace: true });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, q, setParams]);

  const filters = useMemo(
    () => ({
      ...(city && { city }),
      ...(category && { category }),
      ...(maxPrice && { maxPrice }),
      ...(q && { q }),
    }),
    [city, category, maxPrice, q],
  );

  // Every type is always fetched, so each tab can show its total; only the
  // open type asks for a full page.
  const pageFor = (t: TypeKey) => (view === t ? page : 1);
  const limitFor = (t: TypeKey) =>
    view === t ? TYPES[t].perPage : TYPES[t].preview;
  const queryOptions = {
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  };

  const efQuery = useQuery({
    queryKey: ["search", "event_foxer", pageFor("event_foxer"), limitFor("event_foxer"), filters],
    queryFn: () =>
      fetchEventFoxers(pageFor("event_foxer"), limitFor("event_foxer"), filters),
    ...queryOptions,
  });
  const gearQuery = useQuery({
    queryKey: ["search", "gear", pageFor("gear"), limitFor("gear"), filters],
    queryFn: () => fetchGearFoxers(pageFor("gear"), limitFor("gear"), filters),
    ...queryOptions,
  });
  const serviceQuery = useQuery({
    queryKey: ["search", "service", pageFor("service"), limitFor("service"), filters],
    queryFn: () =>
      fetchServiceFoxers(pageFor("service"), limitFor("service"), filters),
    ...queryOptions,
  });
  const queries: Record<TypeKey, UseQueryResult<SectionResult<any>>> = {
    event_foxer: efQuery,
    gear: gearQuery,
    service: serviceQuery,
  };
  const totalOf = (t: TypeKey) => queries[t].data?.pagination?.total;

  const filtered = Boolean(q || category || city || maxPrice);

  const clearAll = () => {
    setSearchQuery("");
    setPushedQ("");
    setParams(Object.fromEntries(FILTER_PARAMS.map((k) => [k, undefined])));
  };

  // `name` is what the remove button says to a screen reader.
  const chips: {
    key: string;
    name: string;
    label: React.ReactNode;
    remove: () => void;
  }[] = [];
  if (q)
    chips.push({
      key: "q",
      name: `search "${q}"`,
      label: <>&ldquo;{q}&rdquo;</>,
      remove: () => {
        setSearchQuery("");
        setPushedQ("");
        setParams({ q: undefined });
      },
    });
  if (category)
    chips.push({
      key: "category",
      name: "kind of event",
      label: EVENT_KINDS.find((k) => k.value === category)?.label ?? category,
      remove: () => setParams({ category: undefined }),
    });
  if (city)
    chips.push({
      key: "city",
      name: city,
      label: city,
      remove: () =>
        setParams({
          city: undefined,
          country: undefined,
          label: undefined,
          lat: undefined,
          lng: undefined,
        }),
    });
  if (maxPrice)
    chips.push({
      key: "maxPrice",
      name: "max price",
      label: (
        <>
          Up to <Money amount={maxPrice} />
        </>
      ),
      remove: () => setParams({ maxPrice: undefined }),
    });

  const selectView = (v: ViewKey) => setParams({ type: v || undefined });

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % VIEWS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + VIEWS.length) % VIEWS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = VIEWS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    tabRefs.current[VIEWS[next] || "all"]?.focus();
    selectView(VIEWS[next]);
  };

  const changePage = (p: number) => {
    setParams({ page: p > 1 ? String(p) : undefined });
    resultsRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  // Announced to screen readers when results change.
  const status = (() => {
    if (view) {
      const total = totalOf(view);
      return total === undefined ? "" : `${total} ${TYPES[view].noun}`;
    }
    const totals = TYPE_KEYS.map(totalOf);
    if (totals.some((t) => t === undefined)) return "";
    return `${totals[0]} Event Foxers, ${totals[1]} gear listings and ${totals[2]} talent listings`;
  })();

  return (
    <div className="relative min-h-screen bg-surface text-white">
      <LandingHeader onSignIn={() => useAuthStore.getState().openLogin()} />

      {/* Top padding clears the fixed nav above */}
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-8 sm:pb-16 sm:pt-32">
        <header className="max-w-3xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Foxers
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            The people who supply events. Event Foxers plan and run the whole
            night, Gear Foxers rent out equipment, and Talent Foxers cover
            catering, design, staffing and performances.
          </p>
          <div role="search" className="relative mt-6">
            <label htmlFor="foxer-search" className="sr-only">
              Search Foxers
            </label>
            <span
              aria-hidden
              className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-white/60"
            >
              search
            </span>
            <input
              id="foxer-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, service or city"
              autoComplete="off"
              className="h-12 w-full rounded-full border border-white/15 bg-white/5 pl-12 pr-12 text-base text-white placeholder:text-white/50 focus:border-accent/60 focus:bg-white/10 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <span aria-hidden className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            )}
          </div>
        </header>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-white/10">
          <div className="-mb-px min-w-0 max-w-full overflow-x-auto hide-scrollbar mask-[linear-gradient(to_right,black_85%,transparent)] sm:mask-none">
            <div role="tablist" aria-label="Kind of Foxer" className="flex gap-1 pr-6 sm:pr-0">
              {VIEWS.map((v, i) => {
                const selected = v === view;
                const total = v ? totalOf(v) : undefined;
                return (
                  <button
                    key={v || "all"}
                    ref={(el) => {
                      tabRefs.current[v || "all"] = el;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(v)}
                    aria-selected={selected}
                    aria-controls="foxer-results"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectView(v)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                      selected
                        ? "border-accent text-white"
                        : "border-transparent text-white/60 hover:text-white"
                    }`}
                  >
                    {v ? TYPES[v].tab : "All"}
                    {total !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                          selected ? "bg-accent text-black" : "bg-white/10 text-white/70"
                        }`}
                      >
                        {total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <Link
            href="/packages"
            className="group mb-3 inline-flex items-center gap-1 text-sm font-bold text-white/70 hover:text-white"
          >
            Ready-made events
            <span
              aria-hidden
              className="material-symbols-outlined text-[18px] motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
            >
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          {/* Sidebar — desktop only (>= 1024px) */}
          <aside className="sticky top-32 hidden w-72 shrink-0 self-start lg:block xl:w-80">
            <SearchFilters />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white lg:hidden"
                  >
                    <span aria-hidden className="material-symbols-outlined text-[18px]">
                      tune
                    </span>
                    Filters
                    {chips.length > 0 && (
                      <span className="rounded-full bg-accent px-1.5 text-xs text-black">
                        {chips.length}
                        <span className="sr-only"> active</span>
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-white/10 bg-surface p-4 sm:p-6"
                >
                  <SheetTitle className="sr-only">Filters</SheetTitle>
                  <SearchFilters onClose={() => setFiltersOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* One tap to scope to their own city — offered, not forced, so
                  a search meant to cover everywhere isn't quietly narrowed. */}
              {!city && homeCity && (
                <button
                  type="button"
                  onClick={() => setParams({ city: homeCity })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-(--accent-text) transition-colors hover:bg-accent/20"
                >
                  <span aria-hidden className="material-symbols-outlined text-[16px]">
                    near_me
                  </span>
                  Show results near {homeCity}
                </button>
              )}

              {chips.length > 0 && (
                <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
                  {chips.map((chip) => (
                    <li key={chip.key}>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 py-1 pl-3 pr-1 text-sm text-white">
                        {chip.label}
                        <button
                          type="button"
                          onClick={chip.remove}
                          aria-label={`Remove filter: ${chip.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          <span aria-hidden className="material-symbols-outlined text-[16px]">
                            close
                          </span>
                        </button>
                      </span>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="px-2 py-1 text-sm font-bold text-white/70 underline-offset-4 hover:text-white hover:underline"
                    >
                      Clear all
                    </button>
                  </li>
                </ul>
              )}
            </div>

            <p aria-live="polite" className="sr-only">
              {status}
            </p>

            <div
              ref={resultsRef}
              id="foxer-results"
              role="tabpanel"
              aria-labelledby={tabId(view)}
              className="scroll-mt-32 space-y-14"
            >
              {(view ? [view] : TYPE_KEYS).map((t) => (
                <TypeSection
                  key={t}
                  type={t}
                  query={queries[t]}
                  preview={!view}
                  page={pageFor(t)}
                  filtered={filtered}
                  kindIgnored={Boolean(category) && t !== "event_foxer"}
                  onSeeAll={() => selectView(t)}
                  onPageChange={changePage}
                  onClear={clearAll}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
