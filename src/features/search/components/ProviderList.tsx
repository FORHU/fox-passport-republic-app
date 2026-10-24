"use client";

import Link from "next/link";
import type { ProviderRow } from "@/features/search/api/search";
import { Money } from "@/shared/components/ui/Money";
import { billingLabel, categoryLabel } from "@/features/search/helpers/labels";

function RowBody({ row, icon }: { row: ProviderRow; icon: string }) {
  return (
    <>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
        {row.img ? (
          <img
            src={row.img}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden className="material-symbols-outlined text-[22px] text-white/40">
            {icon}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-bold text-white transition-colors group-hover:text-(--accent-text)">
          {row.itemName}
        </span>
        <span className="mt-0.5 block truncate text-xs text-white/60">
          {row.name}
          {row.category ? ` · ${categoryLabel(row.category)}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-bold tabular-nums text-(--accent-text)">
          <Money amount={row.price} />
        </span>
        {row.billingRate && (
          <span className="block text-xs text-white/60">
            {billingLabel(row.billingRate)}
          </span>
        )}
      </span>
    </>
  );
}

/**
 * Gear or Talent listings, one row per item. A row opens the Foxer who
 * offers it. Skeleton rows while the first page loads.
 */
export default function ProviderList({
  rows,
  loading,
  icon,
  skeletons = 4,
}: {
  rows: ProviderRow[];
  loading: boolean;
  /** Shown in place of a missing photo. */
  icon: string;
  skeletons?: number;
}) {
  const row =
    "group flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-3";
  return (
    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {loading
        ? Array.from({ length: skeletons }).map((_, i) => (
            <li key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))
        : rows.map((r, i) => (
            <li key={`${r.foxerId}-${r.itemName}-${i}`} className="min-w-0">
              {r.foxerId ? (
                <Link
                  href={`/foxer/${r.foxerId}`}
                  className={`${row} transition-colors hover:border-accent/40 hover:bg-white/5`}
                >
                  <RowBody row={r} icon={icon} />
                </Link>
              ) : (
                <div className={row}>
                  <RowBody row={r} icon={icon} />
                </div>
              )}
            </li>
          ))}
    </ul>
  );
}
