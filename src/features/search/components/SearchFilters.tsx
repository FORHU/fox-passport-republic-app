"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { CascadingLocationFields } from "@/shared/components/ui/CascadingLocationFields";
import { StyledSelect } from "@/shared/components/ui/StyledSelect";
import { Money } from "@/shared/components/ui/Money";

export const EVENT_KINDS = [
  { value: "", label: "Any kind of event" },
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate" },
  { value: "birthday", label: "Birthday" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

/** Every URL param the search page filters on; clearing them all also
 * clears the leftovers of the old map picker (label, lat, lng). */
export const FILTER_PARAMS = [
  "q",
  "category",
  "country",
  "city",
  "maxPrice",
  "label",
  "lat",
  "lng",
] as const;

const MAX_PRICE = 500000;

interface SearchFiltersProps {
  onClose?: () => void;
}

export default function SearchFilters({ onClose }: SearchFiltersProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParamsStr = searchParams?.toString() || "";
  const category = searchParams?.get("category") || "";
  const country = searchParams?.get("country") || "";
  const city = searchParams?.get("city") || "";

  // Max price is typed, so it keeps a draft until it's committed.
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams?.get("maxPrice") || "",
  );
  const [prevParamsStr, setPrevParamsStr] = useState(searchParamsStr);
  if (searchParamsStr !== prevParamsStr) {
    setPrevParamsStr(searchParamsStr);
    setMaxPrice(searchParams?.get("maxPrice") || "");
  }

  // A changed filter starts the results again from page 1.
  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParamsStr);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const commitMaxPrice = (raw: string) => {
    const clamped =
      raw === "" ? "" : String(Math.min(MAX_PRICE, Math.max(0, Number(raw))));
    const next = clamped === "0" ? "" : clamped;
    setMaxPrice(next);
    updateParams({ maxPrice: next });
  };

  // Debounce while typing so filtering updates live without needing Enter/blur
  const maxPriceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onMaxPriceInput = (raw: string) => {
    setMaxPrice(raw);
    if (maxPriceDebounceRef.current) clearTimeout(maxPriceDebounceRef.current);
    maxPriceDebounceRef.current = setTimeout(() => commitMaxPrice(raw), 400);
  };

  // Country alone narrows nothing (results filter on city), so it isn't
  // counted; a city counts once.
  const activeFiltersCount = [category, city, searchParams?.get("maxPrice")]
    .filter(Boolean).length;

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-wider text-white/70";
  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-accent/50 focus:outline-none";

  return (
    <div className="h-fit space-y-6 rounded-2xl border border-white/10 bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white">
          Filters
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-black">
              {activeFiltersCount}
              <span className="sr-only"> active</span>
            </span>
          )}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden className="material-symbols-outlined text-lg">
              close
            </span>
          </button>
        )}
      </div>

      <div>
        <label htmlFor="filter-kind" className={labelClass}>
          Kind of event
        </label>
        <StyledSelect
          id="filter-kind"
          value={category}
          options={EVENT_KINDS}
          onChange={(val) => updateParams({ category: val })}
          className="py-2.5"
        />
        <p className="mt-1.5 text-xs text-white/60">Applies to Event Foxers.</p>
      </div>

      <fieldset>
        <legend className={labelClass}>Location</legend>
        {/* Country, then City — locked until a country is picked. */}
        <CascadingLocationFields
          value={{ country, state: "", city }}
          withState={false}
          className="grid grid-cols-1 gap-2"
          labelClassName="mb-1.5 block text-xs text-white/60"
          onChange={(next) =>
            updateParams({
              country: next.country,
              city: next.city,
              label: undefined,
              lat: undefined,
              lng: undefined,
            })
          }
        />
      </fieldset>

      <div>
        <label htmlFor="filter-max-price" className={labelClass}>
          Max price:{" "}
          <span className="text-(--accent-text)">
            {maxPrice ? <Money amount={maxPrice} /> : "Any"}
          </span>
        </label>
        <input
          id="filter-max-price"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_PRICE}
          step={1000}
          value={maxPrice}
          placeholder="Any"
          aria-describedby="filter-max-price-help"
          onChange={(e) => onMaxPriceInput(e.target.value)}
          onBlur={(e) => {
            if (maxPriceDebounceRef.current)
              clearTimeout(maxPriceDebounceRef.current);
            commitMaxPrice(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (maxPriceDebounceRef.current)
                clearTimeout(maxPriceDebounceRef.current);
              commitMaxPrice((e.target as HTMLInputElement).value);
            }
          }}
          className={`${inputClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        />
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={1000}
          value={maxPrice || 0}
          aria-label="Max price"
          aria-describedby="filter-max-price-help"
          onChange={(e) => setMaxPrice(e.target.value)}
          onMouseUp={(e) =>
            commitMaxPrice((e.target as HTMLInputElement).value)
          }
          onTouchEnd={(e) =>
            commitMaxPrice((e.target as HTMLInputElement).value)
          }
          onKeyUp={(e) => commitMaxPrice((e.target as HTMLInputElement).value)}
          className="mt-3 w-full accent-accent"
        />
        <p id="filter-max-price-help" className="mt-1.5 text-xs text-white/60">
          Per booking, or per day where a listing is priced daily.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
          >
            Show results
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setMaxPrice("");
            updateParams(
              Object.fromEntries(FILTER_PARAMS.map((k) => [k, undefined])),
            );
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          Clear search and filters
        </button>
      </div>
    </div>
  );
}
