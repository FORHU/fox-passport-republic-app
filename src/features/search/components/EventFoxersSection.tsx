"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Foxer, type FoxerSpecialization } from "@/features/user/api/foxers";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop";

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
  eventFoxer: { label: "Event Foxer", description: "Plans & coordinates your entire event end-to-end", color: "#ff00aa" },
  gearFoxer: { label: "Gear Foxer", description: "Rents out equipment — sound, lighting & décor", color: "#a78bfa" },
  serviceFoxer: { label: "Talent Foxer", description: "Provides services like photography, catering & entertainment", color: "#00d2ff" },
  venueFoxer: { label: "Venue Foxer", description: "Provides the space for your event", color: "#ccff00" },
};

function getRoleMeta(foxer: Foxer) {
  const roles = foxer.roleType ?? [];
  if (roles.includes("eventFoxer")) return ROLE_META.eventFoxer;
  if (roles.includes("gearFoxer")) return ROLE_META.gearFoxer;
  if (roles.includes("serviceFoxer")) return ROLE_META.serviceFoxer;
  return { label: "Foxer", description: "FoxPassport verified professional", color: "#ffffff" };
}

function FoxerCard({ foxer }: { foxer: Foxer }) {
  const router = useRouter();

  const isHost = foxer.roleType?.includes("eventFoxer");
  const hasTemplates = (foxer.eventTemplates?.length ?? 0) > 0;

  const portfolioImages = (
    isHost && hasTemplates
      ? (foxer.eventTemplates ?? []).flatMap((t) => t.images.map((img) => img.url))
      : foxer.services.flatMap((s) => s.images.map((img) => img.url))
  ).filter(Boolean).slice(0, 3);

  const tags = (isHost && hasTemplates)
    ? [...new Set((foxer.eventTemplates ?? []).map((t) => t.category))].slice(0, 4)
    : [...new Set(foxer.services.flatMap((s) => s.tags))].slice(0, 4);

  const roleMeta = getRoleMeta(foxer);

  const bio = (isHost && hasTemplates)
    ? (foxer.eventTemplates?.[0]?.description ?? null)
    : (foxer.services[0]?.description ?? null);

  const avatarUrl = foxer.imgId
    ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${foxer.imgId}`
    : FALLBACK_AVATAR;

  return (
    <div className="group glass-card rounded-[2rem] p-8 transition-all duration-300 card-hover-effect relative flex flex-col">
      <Link href={`/foxer/${foxer.id}`} className="absolute inset-0 z-0 rounded-[2rem]" aria-label={`View ${foxer.name}'s profile`}>
        <span className="sr-only">View Profile</span>
      </Link>

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

      <p className="text-xs text-white/40 mb-5 relative z-10 pointer-events-none pl-20">
        {roleMeta.description}
      </p>

      {bio && (
        <p className="text-sm text-text-muted leading-relaxed mb-4 relative z-10 pointer-events-none line-clamp-2">
          {bio}
        </p>
      )}

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

      {(() => {
        const primaryRole = getPrimaryRole(foxer);
        const specs = (foxer.foxerSpecializations ?? []).filter((s) => s.roleType === primaryRole);
        if (specs.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
            {specs.map((s, i) => <SpecializationChip key={i} spec={s} />)}
          </div>
        );
      })()}

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

function SkeletonCard() {
  return (
    <div className="glass-card rounded-[2rem] p-8 animate-pulse space-y-4">
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
  );
}

interface EventFoxersSectionProps {
  items: Foxer[];
  isFetching: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function EventFoxersSection({ items, isFetching, page, totalPages, onPageChange }: EventFoxersSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-white">
            Event Foxers
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Hosts who specialize in your vibe.
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-white/40">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Live
        </span>
      </div>

      {isFetching && items.length === 0 ? (
        <div className="grid md:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-[2rem]">
          <span className="material-symbols-outlined text-[56px] text-white/20">search_off</span>
          <h3 className="text-xl font-bold text-white mt-2">No Event Foxers found</h3>
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Try widening your search radius or adjusting the category.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {items.map((foxer) => (
            <FoxerCard key={foxer.id} foxer={foxer} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-all"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-9 w-9 rounded-full text-sm font-bold transition-all ${
                  p === page
                    ? "bg-white text-black"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
