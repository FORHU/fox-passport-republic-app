"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { type ServiceItem } from "@/features/dashboard/data/dashboardData";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { PaginationBar } from "./PaginationBar";

const PERFORMER_CATEGORIES = new Set([
  "entertainment",
  "photography",
  "videography",
  "dj",
  "live_band",
  "mc",
]);

const PERFORMER_CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  dj: { label: "Live DJ Set", icon: "music_note" },
  live_band: { label: "Live Band / Music", icon: "graphic_eq" },
  photography: { label: "Photography", icon: "camera_alt" },
  videography: { label: "Cinematic Video", icon: "videocam" },
  mc: { label: "Stage Host / MC", icon: "mic" },
  entertainment: { label: "Performer / Stage", icon: "theater_comedy" },
};

export function isPerformerService(item: ServiceItem): boolean {
  if (item.category && PERFORMER_CATEGORIES.has(item.category.toLowerCase())) {
    return true;
  }
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  return tags.some((t) =>
    [
      "dj",
      "live band",
      "acoustic",
      "band",
      "mc",
      "host",
      "photography",
      "videography",
      "music",
      "drone",
      "stage",
      "entertainment",
    ].includes(t),
  );
}

interface PerformersSectionProps {
  services: ServiceItem[];
  onStatusChange: (id: number | string, status: string) => void;
  showViewAllLink?: boolean;
  viewAllHref?: string;
  onEdit?: (id: number | string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function PerformersSection({
  services,
  onStatusChange,
  showViewAllLink = true,
  viewAllHref = "/creator-dashboard/services?tab=performers",
  onEdit,
  page,
  totalPages,
  onPageChange,
}: PerformersSectionProps) {
  return (
    <section id="performers" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse" />
            <h2 className="text-2xl font-display font-bold flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-amber-400 text-2xl">
                theater_comedy
              </span>
              Performer Gigs & Entertainment
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Stage acts, live music sets, photography & MC packages ready for event booking.
          </p>
        </div>
        {showViewAllLink && (
          <Link
            className="text-xs font-bold text-amber-400 border border-amber-500/30 px-4 py-2 rounded-full hover:bg-amber-400 hover:text-black flex items-center gap-1 transition-all"
            href={viewAllHref}
          >
            View All Gigs
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.length > 0 ? (
          services.map((sv) => {
            const catMeta =
              (sv.category && PERFORMER_CATEGORY_LABELS[sv.category.toLowerCase()]) || {
                label: sv.category ? sv.category.replace(/_/g, " ") : "Performance",
                icon: sv.icon || "theater_comedy",
              };

            return (
              <div
                key={sv.id}
                className={`relative group bg-[#0e111a]/80 border border-amber-500/15 rounded-2xl overflow-hidden hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col ${
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
                  {sv.img ? (
                    <Image
                      src={sv.img}
                      alt={sv.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-amber-950/40 via-purple-950/20 to-black flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-400/40 text-5xl">
                        {catMeta.icon}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-[#0e111a] via-transparent to-black/40 pointer-events-none" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-lg">
                    <span className="material-symbols-outlined text-[14px]">
                      {catMeta.icon}
                    </span>
                    <span>{catMeta.label}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <StatusBadge
                      currentStatus={sv.status}
                      type="service"
                      onStatusChange={(s) => onStatusChange(sv.id, s)}
                    />
                  </div>
                </div>

                {/* Gig Details */}
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

                  {/* Performance Rate Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold block">
                        Performance Fee
                      </span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {sv.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-white/60 group-hover:text-amber-300 transition-colors">
                      <span>Edit Gig</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <EmptyState
              type="services"
              href="/foxer/create-listing?type=service"
            />
          </div>
        )}
      </div>

      {onPageChange && page !== undefined && totalPages !== undefined && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
