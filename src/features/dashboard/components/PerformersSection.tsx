"use client";

import React from "react";
import Link from "next/link";
import { type ServiceItem } from "@/features/dashboard/data/dashboardData";
import { EmptyState } from "./EmptyState";
import { PaginationBar } from "./PaginationBar";
import { ServiceCard } from "./ServiceCard";

const PERFORMER_CATEGORIES = new Set([
  "entertainment",
  "photography",
  "videography",
  "dj",
  "live_band",
  "mc",
]);

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
  /** Leave out to show every badge as a label. */
  onStatusChange?: (id: number | string, status: string) => void;
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
    <section id="performers">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400">
            theater_comedy
          </span>
          Performer Gigs
        </h2>
        {showViewAllLink && (
          <Link
            className="text-xs font-bold text-accent border border-accent/30 px-4 py-2 rounded-full hover:bg-accent hover:text-black flex items-center gap-1"
            href={viewAllHref}
          >
            View All
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.length > 0 ? (
          services.map((sv) => (
            <ServiceCard
              key={sv.id}
              service={sv}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              type="services"
              href="/foxer/create-service?type=performer"
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
