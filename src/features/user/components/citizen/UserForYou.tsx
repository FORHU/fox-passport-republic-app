"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Money } from "@/shared/components/ui/Money";
import { SectionHeader } from "./SectionHeader";

/** The fields this carousel reads off a venue from `getVenues()`. */
interface ForYouVenue {
  id: string;
  title?: string;
  name?: string;
  img?: string;
  loc?: string;
  category?: string;
  description?: string;
  pricing?: { pricePerDay?: number | string | null; currency?: string }[];
}

interface UserForYouProps {
  canSeeVenues?: boolean;
  venues?: ForYouVenue[];
}

const ALL = "All";
// Enough to fill the carousel without turning it into the search page.
const MAX_CARDS = 12;
const MAX_CATEGORY_CHIPS = 4;

/**
 * Venues to explore, from the live listings the dashboard already loads.
 * Category chips come from those venues' own categories, so a chip never
 * leads to an empty row. (This used to be three hard-coded sample cards.)
 */
export const UserForYou: React.FC<UserForYouProps> = ({
  canSeeVenues = false,
  venues = [],
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(ALL);

  // The most common categories first.
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of venues) {
      if (v.category) counts.set(v.category, (counts.get(v.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CATEGORY_CHIPS)
      .map(([name]) => name);
  }, [venues]);

  const shown = useMemo(
    () =>
      venues
        .filter((v) => activeCategory === ALL || v.category === activeCategory)
        .slice(0, MAX_CARDS),
    [venues, activeCategory],
  );

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!canSeeVenues) {
    return (
      <section aria-labelledby="venues-title" className="reveal-on-scroll">
        <SectionHeader
          id="venues-title"
          title="Venues to explore"
          icon="storefront"
        />
        <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-text-muted flex-1">
            Venue listings open up when you hold a Foxer role.
          </p>
          <Link
            href="/earn/venue"
            className="inline-flex items-center gap-1 text-sm font-bold text-white hover:text-accent transition-colors shrink-0"
          >
            See Foxer roles
            <span
              className="material-symbols-outlined text-[16px]"
              aria-hidden="true"
            >
              arrow_forward
            </span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="venues-title" className="reveal-on-scroll">
      <SectionHeader
        id="venues-title"
        title="Venues to explore"
        icon="storefront"
        link={{ href: "/venues/map", label: "See all venues" }}
      >
        {shown.length > 1 && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll left"
              className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
                chevron_left
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Scroll right"
              className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
                chevron_right
              </span>
            </button>
          </div>
        )}
      </SectionHeader>

      {categories.length > 1 && (
        <div
          role="group"
          aria-label="Filter venues by category"
          className="flex gap-2 overflow-x-auto hide-scrollbar -mt-1 mb-4"
        >
          {[ALL, ...categories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "bg-accent text-black font-bold"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="glass-panel rounded-3xl flex flex-col items-center justify-center py-16 px-8 text-center">
          <span className="material-symbols-outlined text-3xl text-white/20 mb-3">
            storefront
          </span>
          <p className="text-sm font-bold text-white/60">
            No venues listed yet — check back soon.
          </p>
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
        >
          {shown.map((venue) => {
            const name = venue.title || venue.name || "Venue";
            const price = venue.pricing?.[0]?.pricePerDay;
            return (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                data-carousel-card
                className="glass-card group relative flex flex-col rounded-3xl overflow-hidden card-hover-effect shrink-0 w-[80vw] max-w-80 sm:w-72 snap-start"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-white/5">
                  {venue.img && (
                    <Image
                      alt={name}
                      src={venue.img}
                      fill
                      sizes="(min-width: 640px) 288px, 80vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80" />
                  {venue.category && (
                    <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-black/60 text-[11px] font-bold uppercase tracking-wider text-white">
                      {venue.category}
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white font-display mb-1 group-hover:text-accent transition-colors line-clamp-1">
                    {name}
                  </h3>
                  {venue.loc && (
                    <p className="text-xs text-white/50 mb-2 flex items-center gap-1 line-clamp-1">
                      <span className="material-symbols-outlined text-[14px]">
                        location_on
                      </span>
                      {venue.loc}
                    </p>
                  )}
                  {venue.description && (
                    <p className="text-text-muted text-sm line-clamp-2 mb-4">
                      {venue.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    {price ? (
                      <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">
                        <Money
                          amount={price}
                          from={venue.pricing?.[0]?.currency}
                        />{" "}
                        / day
                      </span>
                    ) : (
                      <span className="text-xs text-white/40">
                        Price on request
                      </span>
                    )}
                    <span className="material-symbols-outlined text-[18px] text-white/40 group-hover:text-accent transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          <Link
            href="/venues/map"
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-black/20 hover:bg-black/40 hover:border-accent transition-all duration-300 shrink-0 w-[80vw] max-w-80 sm:w-72 min-h-75 snap-start"
          >
            <div className="h-16 w-16 rounded-full bg-surface-highlight flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-surface">
              <span className="material-symbols-outlined text-white group-hover:text-accent text-3xl font-bold">
                arrow_forward
              </span>
            </div>
            <p className="font-bold text-white text-lg group-hover:text-accent transition-colors">
              See all venues
            </p>
            <p className="text-sm text-text-muted mt-1">Discover more gems</p>
          </Link>
        </div>
      )}
    </section>
  );
};
