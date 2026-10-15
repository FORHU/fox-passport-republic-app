"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import {
  fetchCities,
  fetchCountries,
  fetchNearestPlace,
  fetchStates,
} from "@/shared/api/geo";

/** Stored as names — what the API's `country` / `state` / `city` columns hold. */
export interface LocationValue {
  country: string;
  state: string;
  city: string;
}

interface CascadingLocationFieldsProps {
  value: LocationValue;
  /** `countryCode` is the chosen country's ISO code, when known. */
  onChange: (next: LocationValue, meta: { countryCode?: string }) => void;
  /** Leave the state step out, for a form that doesn't store one — the city
   * list then covers the whole country. */
  withState?: boolean;
  /** Offer "Use my location" (browser geolocation). */
  allowGeolocate?: boolean;
  /** Called with the browser's coordinates after "Use my location", for
   * forms that also keep a map pin. */
  onCoordinates?: (lat: number, lng: number) => void;
  /** Override the field label style, to match the surrounding form. */
  labelClassName?: string;
  className?: string;
}

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

// Reference data that only changes with an API dataset upgrade.
const STATIC = { staleTime: Infinity, gcTime: Infinity } as const;

/**
 * Country → State → City, each one locked until the one before it is picked,
 * and each list narrowed by the previous choice. Changing a field clears the
 * ones after it, so a city can never be left under the wrong country. A city
 * missing from the dataset can still be typed in.
 */
export function CascadingLocationFields({
  value,
  onChange,
  withState = true,
  allowGeolocate = true,
  onCoordinates,
  className = "grid grid-cols-1 sm:grid-cols-3 gap-4",
  labelClassName,
}: CascadingLocationFieldsProps) {
  const [locating, setLocating] = useState(false);

  const countries = useQuery({
    queryKey: ["geo", "countries"],
    queryFn: fetchCountries,
    ...STATIC,
  });
  const codeFor = (name: string) =>
    countries.data?.find((c) => same(c.name, name))?.code;
  const country = countries.data?.find(
    (c) => same(c.name, value.country) || same(c.code, value.country),
  );
  const countryCode = country?.code;

  const states = useQuery({
    queryKey: ["geo", "states", countryCode],
    queryFn: () => fetchStates(countryCode!),
    enabled: withState && !!countryCode,
    ...STATIC,
  });
  const hasStates = withState && (states.data?.length ?? 0) > 0;
  const stateCode = states.data?.find((s) => same(s.name, value.state))?.code;

  // A country without states lists its cities directly; so does a state the
  // dataset doesn't know (typed in, or saved before these lists existed).
  const cityScope = hasStates && stateCode ? stateCode : "";
  const cityReady =
    !!countryCode &&
    (!withState || states.isFetched) &&
    (!hasStates || !!value.state);
  const cities = useQuery({
    queryKey: ["geo", "cities", countryCode, cityScope],
    queryFn: () => fetchCities(countryCode!, cityScope || undefined),
    enabled: cityReady,
    ...STATIC,
  });

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser can't share its location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const place = await fetchNearestPlace(
            coords.latitude,
            coords.longitude,
          );
          const match = countries.data?.find(
            (c) => c.code === place?.countryCode,
          );
          if (!place || !match) {
            toast.error("Couldn't work out where you are.");
            return;
          }
          onChange(
            {
              country: match.name,
              state: withState ? (place.stateName ?? "") : "",
              city: place.city,
            },
            { countryCode: match.code },
          );
          onCoordinates?.(coords.latitude, coords.longitude);
        } catch {
          toast.error("Couldn't work out where you are.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Location access was denied.");
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  const labelClass =
    labelClassName ??
    "text-[10px] uppercase font-bold text-white/40 tracking-widest mb-2 block";

  return (
    <div className="space-y-3">
      <div className={className}>
        <div>
          <label className={labelClass}>Country</label>
          <SearchableDropdown
            value={country?.name ?? value.country}
            options={countries.data?.map((c) => c.name)}
            placeholder={countries.isPending ? "Loading…" : "Select country…"}
            searchPlaceholder="Search countries…"
            onChange={(name) =>
              onChange(
                { country: name, state: "", city: "" },
                { countryCode: codeFor(name) },
              )
            }
          />
        </div>

        {withState && (
          <div>
            <label className={labelClass}>State / Province</label>
            <SearchableDropdown
              key={countryCode ?? "no-country"}
              value={value.state}
              options={states.data?.map((s) => s.name)}
              disabled={!countryCode || (states.isFetched && !hasStates)}
              allowCustom={hasStates}
              placeholder={
                !countryCode
                  ? "Select a country first"
                  : states.isPending
                    ? "Loading…"
                    : hasStates
                      ? "Select state…"
                      : "No states here"
              }
              searchPlaceholder="Search states…"
              onChange={(name) =>
                onChange({ ...value, state: name, city: "" }, { countryCode })
              }
            />
          </div>
        )}

        <div>
          <label className={labelClass}>City</label>
          <SearchableDropdown
            key={`${countryCode ?? ""}-${cityScope}`}
            value={value.city}
            options={cities.data}
            disabled={!cityReady}
            allowCustom
            placeholder={
              !countryCode
                ? "Select a country first"
                : hasStates && !value.state
                  ? "Select a state first"
                  : cities.isPending
                    ? "Loading…"
                    : "Select city…"
            }
            searchPlaceholder="Search cities…"
            onChange={(name) =>
              onChange({ ...value, city: name }, { countryCode })
            }
          />
        </div>
      </div>

      {allowGeolocate && (
        <button
          type="button"
          onClick={locateMe}
          disabled={locating || countries.isPending}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline disabled:opacity-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            my_location
          </span>
          {locating ? "Finding you…" : "Use my location"}
        </button>
      )}
    </div>
  );
}
