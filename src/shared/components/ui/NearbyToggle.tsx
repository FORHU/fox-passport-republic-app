"use client";

import type { NearbyScope } from "@/shared/hooks/useNearbyFirst";

/**
 * "Near {city} / Everywhere" switch for lists driven by useNearbyFirst.
 * Renders nothing without a city — there's no "near" to offer.
 */
export function NearbyToggle({
  city,
  scope,
  onChange,
  nearEmpty,
  className = "",
}: {
  city: string;
  scope: NearbyScope;
  onChange: (scope: NearbyScope) => void;
  nearEmpty?: boolean;
  className?: string;
}) {
  if (!city) return null;

  const pill = (value: NearbyScope, label: React.ReactNode) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={scope === value}
      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
        scope === value
          ? "bg-accent text-black"
          : "text-white/60 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5">
        {pill(
          "near",
          <>
            <span className="material-symbols-outlined text-[14px]">
              near_me
            </span>
            Near {city}
          </>,
        )}
        {pill("everywhere", "Everywhere")}
      </div>
      {nearEmpty && scope === "near" && (
        <span className="text-xs text-white/40">
          Nothing in {city} yet — showing everywhere.
        </span>
      )}
    </div>
  );
}
