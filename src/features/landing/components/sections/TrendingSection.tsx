"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrendingTemplates } from "@/features/event/api/event-templates";

const CATEGORY_OPTIONS = [
  { label: "All", value: undefined },
  { label: "Birthday", value: "birthday" },
  { label: "Wedding", value: "wedding" },
  { label: "Corporate", value: "corporate" },
  { label: "Social", value: "social" },
] as const;

const FALLBACK_IMG = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop";

const CATEGORY_EMOJI: Record<string, string> = {
  birthday: "🎂",
  wedding: "💍",
  corporate: "🏢",
  social: "🎉",
  other: "✨",
};

function SkeletonCard() {
  return (
    <div className="rounded-[2rem] overflow-hidden animate-pulse border border-white/10 bg-white/5">
      <div className="aspect-[4/5] bg-white/10" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-20 bg-white/20 rounded" />
        <div className="h-5 w-full bg-white/20 rounded" />
        <div className="h-4 w-3/4 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default function TrendingSection() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);

  const { data: templates = [], isLoading, isError, error } = useQuery({
    queryKey: ["trending-templates", activeCategory],
    queryFn: () => fetchTrendingTemplates(activeCategory, 8),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 reveal-on-scroll">
          <div>
            <span className="text-[#ccff00] font-bold uppercase tracking-widest text-xs mb-2 block animate-pulse">
              Don&apos;t Sleep On These
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
              Trending This Week
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setActiveCategory(opt.value)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-1 ${
                  activeCategory === opt.value
                    ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "border border-white/10 text-white hover:bg-white hover:text-black"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : templates.slice(0, 4).map((t, i) => {
                const imageUrl = t.images?.[0]?.url ?? FALLBACK_IMG;
                const city = t.templateVenues?.[0]?.venue?.city ?? t.targetCity ?? "Philippines";
                const price = t.templateVenues?.[0]?.venue?.price;
                const emoji = CATEGORY_EMOJI[t.category] ?? "✨";

                return (
                  <article
                    key={t.id}
                    className="glass-card group relative flex flex-col rounded-[2rem] overflow-hidden card-hover-effect animate-fadeIn"
                    style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        alt={t.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={imageUrl}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          {emoji} {t.category.charAt(0).toUpperCase() + t.category.slice(1)}
                        </span>
                      </div>
                      <button className="absolute top-4 right-4 z-10 h-10 w-10 bg-black/30 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors hover:scale-110">
                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-[#ccff00] font-bold text-xs mb-1 uppercase tracking-wider">
                            {t.targetCity ?? "Philippines"}
                          </div>
                          <h3 className="text-xl font-bold text-white leading-tight font-display group-hover:text-primary-glow transition-colors glitch-hover">
                            {t.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center text-gray-400 text-sm gap-1 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {city}
                        </div>
                        {price ? (
                          <span className="text-white font-bold bg-white/10 px-3 py-1 rounded-lg text-sm group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                            ₱{price.toLocaleString()}
                          </span>
                        ) : (
                          <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded hover:bg-[#ccff00] cursor-pointer transition-colors">
                            RSVP
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}

          {/* Error state */}
          {isError && (
            <div className="col-span-4 text-center py-20 text-text-muted">
              <span className="material-symbols-outlined text-5xl mb-4 block">wifi_off</span>
              <p className="text-sm font-bold text-red-400">Failed to load events</p>
              <p className="text-xs mt-1 opacity-60">{(error as any)?.message ?? "Unknown error"}</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && templates.length === 0 && (
            <div className="col-span-4 text-center py-20 text-text-muted">
              <span className="material-symbols-outlined text-5xl mb-4 block">event_busy</span>
              <p>No events in this category yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Load More */}
        <div className="mt-16 flex justify-center reveal-on-scroll">
          <button className="group relative px-8 py-4 rounded-full bg-transparent text-white font-bold transition-all flex items-center gap-2 overflow-visible">
            <span className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/30 blur-xl" />
            <span className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/40 blur-lg" />
            <span className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-[#ccff00] group-hover:shadow-[0_0_20px_rgba(204,255,0,0.6),0_0_40px_rgba(204,255,0,0.3)] transition-all duration-300" />
            <span className="absolute inset-[2px] rounded-full bg-[#0a0b0f]" />
            <span className="relative z-10 group-hover:text-[#ccff00] transition-colors">Load More Vibes</span>
            <span className="relative z-10 material-symbols-outlined group-hover:text-[#ccff00] group-hover:translate-y-1 transition-all">
              expand_more
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
