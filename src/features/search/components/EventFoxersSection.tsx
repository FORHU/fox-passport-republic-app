"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Foxer, type FoxerSpecialization } from "@/shared/api/foxers";
import { categoryLabel } from "@/features/search/helpers/labels";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop";

function SpecializationChip({ spec }: { spec: FoxerSpecialization }) {
  const label = categoryLabel(spec.category);
  if (spec.source === "earned") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-bold text-(--accent-text)">
        <span aria-hidden className="material-symbols-outlined text-[14px] fill-current">
          star
        </span>
        {label}
        <span className="sr-only">(earned through bookings)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white/70">
      {label}
    </span>
  );
}

function getPrimaryRole(foxer: Foxer): string {
  const roles = foxer.roleType ?? [];
  if (roles.includes("eventFoxer")) return "eventFoxer";
  if (roles.includes("gearFoxer")) return "gearFoxer";
  if (roles.includes("serviceFoxer")) return "serviceFoxer";
  if (roles.includes("performerFoxer")) return "performerFoxer";
  return "";
}

const ROLE_META: Record<string, { label: string; description: string }> = {
  eventFoxer: {
    label: "Event Foxer",
    description: "Plans and runs your whole event, from venue to crew.",
  },
  gearFoxer: {
    label: "Gear Foxer",
    description: "Rents out equipment: sound, lighting and décor.",
  },
  serviceFoxer: {
    label: "Talent Foxer",
    description: "Provides catering, design and staffing.",
  },
  performerFoxer: {
    label: "Performer Foxer",
    description: "Photography, DJs, live music and hosts.",
  },
  venueFoxer: {
    label: "Venue Foxer",
    description: "Provides the space for your event.",
  },
};

function getRoleMeta(foxer: Foxer) {
  return (
    ROLE_META[getPrimaryRole(foxer)] ?? {
      label: "Foxer",
      description: "FoxPassport verified professional",
    }
  );
}

function VenueCarousel({ images, name }: { images: string[]; name: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback(
    (dir: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      scrollRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
    },
    [],
  );

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar motion-safe:scroll-smooth"
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative h-24 w-36 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10"
          >
            <Image
              src={img}
              alt={`${name}'s venue, photo ${idx + 1}`}
              fill
              sizes="144px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={scroll(-1)}
            aria-label="Previous venue photo"
            className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-x-1/3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/80 text-white/80 hover:bg-black hover:text-white"
          >
            <span aria-hidden className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={scroll(1)}
            aria-label="Next venue photo"
            className="absolute right-0 top-1/2 z-20 flex h-10 w-10 translate-x-1/3 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/80 text-white/80 hover:bg-black hover:text-white"
          >
            <span aria-hidden className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>
        </>
      )}
    </div>
  );
}

function FoxerCard({ foxer }: { foxer: Foxer }) {
  const router = useRouter();

  const isHost = foxer.roleType?.includes("eventFoxer");
  const hasTemplates = (foxer.eventTemplates?.length ?? 0) > 0;
  const firstName = foxer.name?.split(" ")[0] || foxer.name;

  const portfolioImages = (
    isHost && hasTemplates
      ? (foxer.eventTemplates ?? []).flatMap((t) =>
          t.images.map((img) => img.url),
        )
      : foxer.services.flatMap((s) => s.images.map((img) => img.url))
  )
    .filter(Boolean)
    .slice(0, 3);

  const venueImages = (foxer.venues ?? [])
    .flatMap((v) => v.images.map((img) => img.url))
    .filter(Boolean);

  const tags =
    isHost && hasTemplates
      ? [...new Set((foxer.eventTemplates ?? []).map((t) => t.category))].slice(
          0,
          4,
        )
      : [...new Set(foxer.services.flatMap((s) => s.tags))].slice(0, 4);

  const roleMeta = getRoleMeta(foxer);
  const primaryRole = getPrimaryRole(foxer);
  const specs = (foxer.foxerSpecializations ?? []).filter(
    (s) => s.roleType === primaryRole,
  );

  const bio =
    isHost && hasTemplates
      ? (foxer.eventTemplates?.[0]?.description ?? null)
      : (foxer.services[0]?.description ?? null);

  const avatarUrl = foxer.imgId
    ? `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${foxer.imgId}`
    : FALLBACK_AVATAR;

  return (
    <article className="group glass-card relative flex min-w-0 flex-col rounded-[2rem] border border-white/10 p-6 transition-colors hover:border-accent/50">
      <Link
        href={`/foxer/${foxer.id}`}
        className="absolute inset-0 z-0 rounded-[2rem]"
        aria-label={`View ${foxer.name}'s profile`}
      />

      <div className="pointer-events-none relative z-10 flex items-start gap-4">
        <Image
          src={avatarUrl}
          alt=""
          width={64}
          height={64}
          className="h-14 w-14 shrink-0 rounded-full border-2 border-surface-highlight object-cover sm:h-16 sm:w-16"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 font-display text-lg font-bold leading-snug text-white sm:text-xl">
              {foxer.name}{" "}
              <span
                aria-hidden
                className="material-symbols-outlined fill-current align-middle text-[18px] text-(--accent-text)"
              >
                verified
              </span>
              <span className="sr-only">(verified)</span>
            </h3>
            <p className="flex shrink-0 items-center gap-1 pt-0.5 text-base font-bold text-white">
              5.0
              <span
                aria-hidden
                className="material-symbols-outlined fill-current text-[16px] text-yellow-400"
              >
                star
              </span>
              <span className="sr-only">rating</span>
            </p>
          </div>
          <p className="text-sm font-semibold text-(--accent-text)">
            {roleMeta.label}
            {foxer.city && (
              <span className="font-normal text-white/60"> · {foxer.city}</span>
            )}
          </p>
        </div>
      </div>

      <p className="pointer-events-none relative z-10 mt-3 text-sm text-white/60">
        {roleMeta.description}
      </p>

      {bio && (
        <p className="pointer-events-none relative z-10 mt-4 line-clamp-2 text-sm leading-snug text-white/70">
          {bio}
        </p>
      )}

      <div className="pointer-events-none relative z-10 mt-4 flex flex-wrap gap-1.5">
        {tags.length > 0 ? (
          tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-xs font-bold text-white/70"
            >
              {categoryLabel(tag)}
            </span>
          ))
        ) : (
          <span className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-xs font-bold text-white/70">
            Creative Services
          </span>
        )}
        {specs.map((s, i) => (
          <SpecializationChip key={i} spec={s} />
        ))}
      </div>

      {isHost && venueImages.length > 0 ? (
        <div className="relative z-10 mt-5">
          <p className="pointer-events-none mb-2 text-xs font-bold text-white/60">
            Venues
          </p>
          <VenueCarousel images={venueImages} name={foxer.name} />
        </div>
      ) : (
        portfolioImages.length > 0 && (
          <div className="pointer-events-none relative z-10 mt-5 flex gap-3">
            {portfolioImages.map((img, idx) => (
              <div
                key={idx}
                className="relative h-20 flex-1 overflow-hidden rounded-2xl border border-white/10"
              >
                <Image
                  src={img}
                  alt={`Work by ${foxer.name}, ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )
      )}

      <div className="relative z-20 mt-auto flex gap-3 pt-6">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/match/${foxer.id}`);
          }}
          className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-full bg-accent px-4 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
        >
          Plan with {firstName}
        </button>
        <button
          type="button"
          aria-label={`Favourite ${foxer.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span aria-hidden className="material-symbols-outlined text-[18px]">
            favorite
          </span>
        </button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card h-80 animate-pulse space-y-4 rounded-[2rem] p-6">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-full bg-white/10" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/5" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-white/5" />
      <div className="h-3 w-3/4 rounded bg-white/5" />
      <div className="h-11 w-full rounded-full bg-white/5" />
    </div>
  );
}

/** Event Foxer cards, or skeletons while the first page loads. */
export default function EventFoxerList({
  items,
  loading,
  skeletons = 3,
}: {
  items: Foxer[];
  loading: boolean;
  skeletons?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        : items.map((foxer) => <FoxerCard key={foxer.id} foxer={foxer} />)}
    </div>
  );
}
