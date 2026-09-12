"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface UserForYouProps {
  canSeeVenues?: boolean;
  venues?: any[];
}

const CATEGORIES = ["All Vibes", "Music", "Art", "Food"] as const;
type Category = (typeof CATEGORIES)[number];

export const UserForYou: React.FC<UserForYouProps> = ({
  canSeeVenues = false,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("All Vibes");

  const showsCategory = (category: Category) =>
    activeCategory === "All Vibes" || activeCategory === category;

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!canSeeVenues) {
    return (
      <section
        className="reveal-on-scroll"
        style={{ transitionDelay: "100ms" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-display font-bold text-white">For You</h3>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/5 flex flex-col items-center justify-center py-16 px-8 text-center min-h-[300px]">
          <div className="h-16 w-16 rounded-full bg-surface-highlight flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white/40 text-3xl">
              storefront
            </span>
          </div>
          <h4 className="font-bold text-white text-lg mb-2">
            Venues are for Creator Roles
          </h4>
          <p className="text-text-muted text-sm max-w-xs">
            Venue listings are available to Event Foxers, Equipment Foxers, and Venue
            Foxers. Apply for a role to unlock this section.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="reveal-on-scroll" style={{ transitionDelay: "100ms" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-display font-bold text-white">For You</h3>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-accent text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                    : "border border-white/10 text-white hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll left"
              className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Scroll right"
              className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2"
      >
        {!showsCategory("Food") &&
          !showsCategory("Art") &&
          activeCategory !== "All Vibes" && (
            <div className="flex flex-col items-center justify-center shrink-0 w-[80vw] max-w-80 sm:w-72 min-h-75 text-center px-6">
              <span className="material-symbols-outlined text-3xl text-white/20 mb-3">
                sentiment_dissatisfied
              </span>
              <p className="text-sm font-bold text-white/40">
                No vibes in this category yet
              </p>
            </div>
          )}

        {/* Cards */}
        {showsCategory("Food") && (
          <article
            data-carousel-card
            className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect shrink-0 w-[80vw] max-w-80 sm:w-72 snap-start"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                alt="Coffee"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_LY_Y9MjrpTWy_NJTJIRwk76sZnsaIdsxuUIfYq_pNLi5QstkgJmV2mZg_qFfJnhOtNJ9OWN1f9482wc5qJ1VX2x7t932Q2CfhUv4qoGznn5mNqoNlggeX46L5F8wFGk46ZivWa7VCxRqJRCs_EkknPCF6QDvTdpuAwdLudXP-kP13gUd5Bw6nonOKZfwI199-TukQ0_hWH2KVljytpXdvlFEk3Q_GnkMqwagAAuvX3PvUOTmbUOWnt7P-40VvqyHkoe_HuyhMQg"
                width={400}
                height={300}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80"></div>
              <div className="absolute top-4 right-4 z-10">
                <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-secondary hover:bg-white transition-all">
                  <span className="material-symbols-outlined text-[20px]">
                    bookmark
                  </span>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 z-10">
                <span className="bg-primary/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  New Spot
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-accent transition-colors">
                Bean &amp; Leaf Pop-up Cafe
              </h3>
              <p className="text-text-muted text-sm line-clamp-2 mb-4">
                An exclusive pop-up featuring rare beans from Mt. Apo. Limited
                seating available.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">
                  $$
                </span>
                <div className="flex items-center gap-1 text-xs text-accent">
                  <span className="material-symbols-outlined text-[14px] fill-current">
                    star
                  </span>{" "}
                  4.9
                </div>
              </div>
            </div>
          </article>
        )}

        {showsCategory("Art") && (
          <article
            data-carousel-card
            className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect shrink-0 w-[80vw] max-w-80 sm:w-72 snap-start"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                alt="Art"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8psAoxLif143bhZR9_uyQQN5yq6hgkNyUctxvMzcYUpzSguWiFojBLT_vQUS2u2Eao930f0cZgAa6vnHL9FRYCqX-j3tnACNNV1o-QuHU4Qnd3fIb8SgNuhe6XY5Ic1uL4Mb8yYeME95g3M81RaVM-iFnuaL3uIpkMuB8L4-N1m04CSsSsTJnwG4laZfj0ugPrRRH3-xdWbz1lnp6AYn4VgL4xJZw7L5HSKPQFSoWqgiZ3yBLIOgDbpAPg8bOhTrNV4jcidgjRpY"
                width={400}
                height={300}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80"></div>
              <div className="absolute top-4 right-4 z-10">
                <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-secondary hover:bg-white transition-all">
                  <span className="material-symbols-outlined text-[20px]">
                    bookmark
                  </span>
                </button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-accent transition-colors">
                Abstract Gallery Opening
              </h3>
              <p className="text-text-muted text-sm line-clamp-2 mb-4">
                Featuring local street artists. Free drinks for the first 50
                guests.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black bg-accent px-2 py-1 rounded">
                  FREE
                </span>
                <span className="text-xs text-gray-400">Fri, Aug 30</span>
              </div>
            </div>
          </article>
        )}

        {activeCategory === "All Vibes" && (
          <article
            data-carousel-card
            className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect shrink-0 w-[80vw] max-w-80 sm:w-72 snap-start"
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                alt="Camping"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2XA52iqn3OYq_ek6lF7a5RrGBaIYiCLbhKptRxzzgr1w5g1rVfS3IAKovFFayv15ZLnHMWWtTtje9S1U71VWK-1PDExtYW9y_5Oc7EJYEc-Vp6RaZu68x7vepjoN0dNDpWVyuLMXRVxTjOkvIR2k6uhg2oNLwgTJW4xkjDC8zPazWFcViSboKtLViluxCMf4YcJ9dzEEJfo7uyHlmHBLpo9riL-1nhYHM0v-SRB-c1l6Ao0PMoBTYz1u7rbHmJiROH-b3NkvgseE"
                width={400}
                height={300}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80"></div>
              <div className="absolute top-4 right-4 z-10">
                <button className="h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-secondary hover:bg-white transition-all">
                  <span className="material-symbols-outlined text-[20px]">
                    bookmark
                  </span>
                </button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-accent transition-colors">
                Stargazing Camp
              </h3>
              <p className="text-text-muted text-sm line-clamp-2 mb-4">
                Escape the city lights. Tent rentals included in the package.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">
                  ₱2,500
                </span>
                <span className="text-xs text-gray-400">Sat, Sep 02</span>
              </div>
            </div>
          </article>
        )}

        <article className="group relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 bg-black/20 hover:bg-black/40 hover:border-accent cursor-pointer transition-all duration-300 shrink-0 w-[80vw] max-w-80 sm:w-72 min-h-75 snap-start">
          <div className="h-16 w-16 rounded-full bg-surface-highlight flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] group-hover:bg-surface">
            <span className="material-symbols-outlined text-white group-hover:text-accent text-3xl font-bold">
              add
            </span>
          </div>
          <p className="font-bold text-white text-lg group-hover:text-accent transition-colors">
            Load More
          </p>
          <p className="text-sm text-text-muted mt-1">Discover more gems</p>
        </article>
      </div>
    </section>
  );
};
