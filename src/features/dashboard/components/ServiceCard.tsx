"use client";

import React from "react";
import Image from "next/image";
import {
  canOwnerSetStatus,
  type ServiceItem,
} from "@/features/dashboard/data/dashboardData";
import { StatusBadge } from "./StatusBadge";
import { ListingImage } from "./ListingImage";
import { Money } from "@/shared/components/ui/Money";

const PERFORMER_CATEGORY_LABELS: Record<
  string,
  { label: string; icon: string }
> = {
  dj: { label: "Live DJ Set", icon: "music_note" },
  live_band: { label: "Live Band / Music", icon: "graphic_eq" },
  photography: { label: "Photography", icon: "camera_alt" },
  videography: { label: "Cinematic Video", icon: "videocam" },
  mc: { label: "Stage Host / MC", icon: "mic" },
  entertainment: { label: "Performer / Stage", icon: "theater_comedy" },
};

interface ServiceCardProps {
  service: ServiceItem;
  /** Leave out to show the badge as a label. */
  onStatusChange?: (id: number | string, status: string) => void;
  onEdit?: (id: number | string) => void;
}

/**
 * One service listing on the creator dashboard: picture banner (or its
 * category icon), category, status, city, tags and fee. Operational services
 * and performer gigs are rows of the same `Service` model and share this card,
 * the performer gig card's design (app#437).
 */
export function ServiceCard({
  service: sv,
  onStatusChange,
  onEdit,
}: ServiceCardProps) {
  const performer =
    sv.category && PERFORMER_CATEGORY_LABELS[sv.category.toLowerCase()];
  const catMeta = performer || {
    label: sv.category ? sv.category.replace(/_/g, " ") : "Service",
    icon: sv.icon || "room_service",
  };

  return (
    <div
      className={`relative group bg-surface/80 border border-amber-500/15 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all duration-300 flex flex-col ${
        onEdit ? "cursor-pointer" : ""
      }`}
      onClick={() => onEdit?.(sv.id)}
      role={onEdit ? "button" : undefined}
      tabIndex={onEdit ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onEdit) return;
        if (e.key === "Enter" || e.key === " ") onEdit(sv.id);
      }}
    >
      {/* Media banner */}
      <div className="relative h-40 w-full overflow-hidden bg-white/5 flex items-center justify-center">
        <ListingImage
          src={sv.img}
          fallback={
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-400/40 text-5xl">
                {catMeta.icon}
              </span>
            </div>
          }
        >
          {(image) => (
            <Image
              ref={image.ref}
              src={image.src}
              onError={image.onError}
              alt={sv.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </ListingImage>
        {/* Short, soft fades only where text sits (the pills on top, the card
            body below), so the picture itself stays clear. */}
        <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-surface/70 to-transparent pointer-events-none" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-lg">
          <span className="material-symbols-outlined text-[14px]">
            {catMeta.icon}
          </span>
          <span>{catMeta.label}</span>
        </div>

        {/* Status Badge on the same frosted backing as the category pill, so it
            reads on any picture; raised only while its menu is open. */}
        <div className="absolute top-3 right-3 z-10 has-[[aria-expanded=true]]:z-40 rounded-full bg-black/70 backdrop-blur-md shadow-lg">
          <StatusBadge
            currentStatus={sv.status}
            type="service"
            onStatusChange={
              onStatusChange && canOwnerSetStatus(sv.status)
                ? (s) => onStatusChange(sv.id, s)
                : undefined
            }
          />
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {sv.name}
          </h3>

          {/* Tags & City */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {sv.city && (
              <span className="inline-flex items-center gap-1 text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                <span className="material-symbols-outlined text-[12px] text-amber-400">
                  location_on
                </span>
                {sv.city}
              </span>
            )}
            {sv.isWillingToTravel && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <span className="material-symbols-outlined text-[12px]">
                  flight
                </span>
                Travel Ready
              </span>
            )}
            {sv.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Rate Bar */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold block">
              {performer ? "Performance Fee" : "Service Fee"}
            </span>
            <span className="text-base font-bold font-mono text-amber-400">
              <Money amount={sv.price} />
              {sv.priceUnit ? ` ${sv.priceUnit}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-white/60 group-hover:text-amber-300 transition-colors">
            <span>{performer ? "Edit Gig" : "Edit Service"}</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
