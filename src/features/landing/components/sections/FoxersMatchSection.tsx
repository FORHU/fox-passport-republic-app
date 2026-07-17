"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchFoxers, type Foxer, type FoxerSpecialization } from "@/features/user/api/foxers";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop";

const ROLE_FILTERS = [
  { label: "All",          value: undefined,          icon: "groups" },
  { label: "Event Foxer",  value: "eventFoxer",       icon: "celebration" },
  { label: "Venue Foxer",  value: "venueFoxer",       icon: "location_city" },
  { label: "Talent Foxer", value: "serviceFoxer",     icon: "theater_comedy" },
  { label: "Gear Foxer",   value: "gearFoxer",        icon: "speaker" },
] as const;

type RoleFilter = typeof ROLE_FILTERS[number]["value"];

const INITIAL_COUNT = 6;
const MORE_COUNT = 6;

export default function FoxersMatchSection() {
  const [activeRole, setActiveRole] = useState<RoleFilter>(undefined);
  const [showCount, setShowCount] = useState(INITIAL_COUNT);

  const { data: foxers = [], isLoading } = useQuery({
    queryKey: ["foxers", "landing", activeRole],
    queryFn: () => fetchFoxers(30, 1, activeRole),
    staleTime: 1000 * 60 * 5,
  });

  const handleFilterChange = (value: RoleFilter) => {
    setActiveRole(value);
    setShowCount(INITIAL_COUNT);
  };

  const visibleFoxers = foxers.slice(0, showCount);
  const hasMore = showCount < foxers.length;

  return (
    <section className="py-20 relative overflow-hidden bg-black/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 reveal-on-scroll">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Who&apos;s vibe matches yours?
            </h2>
            <p className="text-lg text-text-muted max-w-2xl">
              Browse Certified Foxers available for your dates. These pros know the scene inside out.
            </p>
          </div>
        </div>

        {/* Role-type Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {ROLE_FILTERS.map((f) => (
            <button
              key={String(f.value)}
              onClick={() => handleFilterChange(f.value)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                activeRole === f.value
                  ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "border border-white/10 text-white hover:bg-white/5 glass-panel"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Foxers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card rounded-[2rem] p-8 animate-pulse space-y-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2 pt-2">
                      <div className="h-4 w-32 bg-white/10 rounded" />
                      <div className="h-3 w-24 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-3/4 bg-white/5 rounded" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => <div key={j} className="h-6 w-16 bg-white/5 rounded-lg" />)}
                  </div>
                  <div className="h-12 w-full bg-white/5 rounded-full" />
                </div>
              ))
            : visibleFoxers.map((foxer) => <FoxerCard key={foxer.id} foxer={foxer} />)}

          {!isLoading && foxers.length === 0 && (
            <div className="col-span-3 text-center py-20 text-text-muted">
              <span className="material-symbols-outlined text-5xl mb-4 block">person_search</span>
              <p>No foxers available yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setShowCount((c) => c + MORE_COUNT)}
              className="group relative px-8 py-4 rounded-full bg-transparent text-white font-bold transition-all flex items-center gap-2 overflow-visible"
            >
              <span className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/30 blur-xl" />
              <span className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ccff00]/40 blur-lg" />
              <span className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-[#ccff00] group-hover:shadow-[0_0_20px_rgba(204,255,0,0.6),0_0_40px_rgba(204,255,0,0.3)] transition-all duration-300" />
              <span className="absolute inset-[2px] rounded-full bg-[#0a0b0f]" />
              <span className="relative z-10 group-hover:text-[#ccff00] transition-colors">
                Load More Foxers
              </span>
              <span className="relative z-10 material-symbols-outlined group-hover:text-[#ccff00] animate-bounce">
                arrow_downward
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function SpecializationChip({ spec }: { spec: FoxerSpecialization }) {
  const label = spec.category.replace(/_/g, " ");
  if (spec.source === "earned") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-yellow-400/15 border border-yellow-400/40 text-yellow-300">
        <span className="material-symbols-outlined text-[11px] fill-current">star</span>
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-white/5 border border-white/15 text-white/50">
      <span className="material-symbols-outlined text-[11px]">label</span>
      {label}
    </span>
  );
}

function getPrimaryRole(foxer: Foxer): string {
  const roles = foxer.roleType ?? [];
  if (roles.includes("eventFoxer")) return "eventFoxer";
  if (roles.includes("gearFoxer")) return "gearFoxer";
  if (roles.includes("serviceFoxer")) return "serviceFoxer";
  return "";
}

const ROLE_META: Record<string, { label: string; description: string; color: string }> = {
  eventFoxer:   { label: "Event Foxer",   description: "Plans & coordinates your entire event end-to-end", color: "#ff00aa" },
  gearFoxer:    { label: "Gear Foxer",    description: "Rents out equipment — sound, lighting & décor",    color: "#a78bfa" },
  serviceFoxer: { label: "Talent Foxer",  description: "Provides services like photography, catering & entertainment", color: "#00d2ff" },
  venueFoxer:   { label: "Venue Foxer",   description: "Provides the perfect space for your event",        color: "#ccff00" },
};

function getRoleMeta(foxer: Foxer) {
  const roles = foxer.roleType ?? [];
  if (roles.includes("eventFoxer"))   return ROLE_META.eventFoxer;
  if (roles.includes("gearFoxer"))    return ROLE_META.gearFoxer;
  if (roles.includes("serviceFoxer")) return ROLE_META.serviceFoxer;
  return { label: "Foxer", description: "FoxPassport verified professional", color: "#ffffff" };
}

// Sub-component for foxer cards
function FoxerCard({ foxer }: { foxer: Foxer }) {
  const router = useRouter();

  const isHost = foxer.roleType?.includes("eventFoxer");
  const isGearFoxer = foxer.roleType?.includes("gearFoxer");

  const hasTemplates = (foxer.eventTemplates?.length ?? 0) > 0;
  const hasAssets = (foxer.assets?.length ?? 0) > 0;

  // Portfolio images: templates for EventFoxer, assets for GearFoxer, services otherwise
  const portfolioImages = (
    isHost && hasTemplates
      ? (foxer.eventTemplates ?? []).flatMap((t) => t.images.map((img) => img.url))
      : isGearFoxer && hasAssets
        ? (foxer.assets ?? []).flatMap((a) => a.images.map((img) => img.url))
        : foxer.services.flatMap((s) => s.images.map((img) => img.url))
  ).slice(0, 3);

  // Tags
  const tags = (isHost && hasTemplates)
    ? [...new Set((foxer.eventTemplates ?? []).map((t) => t.category))].slice(0, 4)
    : isGearFoxer && hasAssets
      ? [...new Set((foxer.assets ?? []).map((a) => a.category))].slice(0, 4)
      : [...new Set(foxer.services.flatMap((s) => s.tags))].slice(0, 4);

  const roleMeta = getRoleMeta(foxer);
  const isEventFoxer = foxer.roleType?.includes("eventFoxer");
  const showStartHere = isEventFoxer && hasTemplates;

  const bio = (isHost && hasTemplates)
    ? (foxer.eventTemplates?.[0]?.description ?? null)
    : isGearFoxer && hasAssets
      ? (foxer.assets?.[0]?.description ?? null)
      : (foxer.services[0]?.description ?? null);

  const avatarUrl = foxer.imgId
    ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${foxer.imgId}`
    : FALLBACK_AVATAR;

  return (
    <div
      className="group glass-card rounded-[2rem] p-8 transition-all duration-300 card-hover-effect relative flex flex-col"
      style={showStartHere ? { borderColor: "rgba(255,0,170,0.3)" } : undefined}
    >
      {/* "Start here" banner for Event Foxers with content */}
      {showStartHere && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#ff00aa] text-white shadow-[0_0_12px_rgba(255,0,170,0.6)]">
            <span className="material-symbols-outlined text-[11px]">bolt</span>
            Start here
          </span>
        </div>
      )}

      {/* Stretched Link */}
      <Link href={`/foxer/${foxer.id}`} className="absolute inset-0 z-0 rounded-[2rem]" aria-label={`View ${foxer.name}'s profile`}>
        <span className="sr-only">View Profile</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative z-10 pointer-events-none">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={foxer.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-surface-highlight group-hover:scale-105 transition-transform"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
            />
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-surface-highlight ring-2 ring-black" />
          </div>
          <div>
            <div className="flex items-center gap-1 font-display font-bold text-xl text-white">
              {foxer.name}{" "}
              <span className="material-symbols-outlined text-primary text-[18px] fill-current">verified</span>
            </div>
            <div className="text-sm font-semibold" style={{ color: roleMeta.color }}>{roleMeta.label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 font-bold text-white">
            5.0{" "}
            <span className="material-symbols-outlined text-yellow-400 text-[16px] fill-current">star</span>
          </div>
          <div className="text-xs text-text-muted">{foxer.city}</div>
        </div>
      </div>

      {/* Role description */}
      <p className="text-xs text-white/40 mb-5 relative z-10 pointer-events-none pl-20">
        {roleMeta.description}
      </p>

      {/* Bio */}
      {bio && (
        <p className="text-sm text-text-muted leading-relaxed mb-4 relative z-10 pointer-events-none line-clamp-2">
          {bio}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        {tags.length > 0 ? (
          tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-black/30 px-3 py-1.5 text-xs font-bold text-gray-400 border border-white/5 group-hover:text-white transition-colors"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="rounded-lg bg-black/30 px-3 py-1.5 text-xs font-bold text-gray-400 border border-white/5">
            Creative Services
          </span>
        )}
      </div>

      {/* Specialization chips — scoped to the primary role shown on this card */}
      {(() => {
        const primaryRole = getPrimaryRole(foxer);
        const specs = (foxer.foxerSpecializations ?? []).filter(s => s.roleType === primaryRole);
        if (specs.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
            {specs.map((s, i) => <SpecializationChip key={i} spec={s} />)}
          </div>
        );
      })()}

      {/* Portfolio Images */}
      {portfolioImages.length > 0 && (
        <div className="flex justify-between gap-3 mb-8 relative z-10 pointer-events-none">
          {portfolioImages.map((img, idx) => (
            <div
              key={idx}
              className="h-20 flex-1 rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-300 first:-rotate-3 last:rotate-3"
            >
              <img src={img} alt="Work" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 relative z-20 mt-auto pt-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/match/${foxer.id}`);
          }}
          className="flex-1 rounded-full bg-linear-to-r from-[#8b5cf6] to-[#a855f7] py-3.5 text-sm font-bold text-white hover:opacity-90 transition-opacity hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] flex items-center justify-center cursor-pointer"
        >
          Match Me
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors group/heart cursor-pointer"
        >
          <span className="material-symbols-outlined group-hover/heart:scale-125 transition-transform">favorite</span>
        </button>
      </div>
    </div>
  );
}
