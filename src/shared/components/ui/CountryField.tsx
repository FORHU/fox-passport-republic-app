"use client";

import { useEffect, useId, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import { fetchCountries, type GeoCountry } from "@/shared/api/geo";
import { PROFILE_QUERY_KEY, fetchProfile } from "@/shared/auth/profile";

/** The country a form starts on when the profile names none. */
export const DEFAULT_COUNTRY = "PH";

// Reference data that only changes with an API dataset upgrade.
const STATIC = { staleTime: Infinity, gcTime: Infinity } as const;

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();
const countryLabel = (c: GeoCountry) => `${c.flag} ${c.name}`;

function useCountries() {
  return useQuery({
    queryKey: ["geo", "countries"],
    queryFn: fetchCountries,
    ...STATIC,
  });
}

/** A country's name for messages ("Philippines"), or its code until loaded. */
export function useCountryName(code: string): string {
  const countries = useCountries();
  return countries.data?.find((c) => c.code === code)?.name ?? code;
}

interface CountryFieldProps {
  /** ISO alpha-2 code; "" until set — then it defaults to the profile's. */
  value: string;
  onChange: (code: string) => void;
  labelClassName: string;
  /** What the country changes on this form, shown under the field. */
  hint?: string;
}

/**
 * The one country an application form asks for. The fields after it follow
 * it — the contact number's format (PhoneField) and the TIN's (TinField) — so
 * it is asked once, not once per field. Starts on the profile's country, or
 * the Philippines, also when either list fails to load.
 */
export function CountryField({
  value,
  onChange,
  labelClassName,
  hint,
}: CountryFieldProps) {
  const fieldId = useId();
  const countries = useCountries();
  const profile = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
  });
  // Countries with phone numbering: the contact number needs a calling code.
  const options = useMemo(
    () => (countries.data ?? []).filter((c) => c.phoneCode),
    [countries.data],
  );

  const profileCountry = profile.data?.country ?? "";
  useEffect(() => {
    if (value || countries.isPending || profile.isPending) return;
    const match = options.find(
      (c) => same(c.name, profileCountry) || same(c.code, profileCountry),
    );
    onChange(match?.code ?? DEFAULT_COUNTRY);
  }, [
    value,
    countries.isPending,
    profile.isPending,
    options,
    profileCountry,
    onChange,
  ]);

  const selected = options.find((c) => c.code === value);

  return (
    <div className="space-y-2">
      <label
        id={`${fieldId}-label`}
        htmlFor={`${fieldId}-country`}
        className={labelClassName}
      >
        Country *
      </label>
      <SearchableDropdown
        id={`${fieldId}-country`}
        labelId={`${fieldId}-label`}
        value={selected ? countryLabel(selected) : value}
        options={options.map(countryLabel)}
        placeholder={countries.isPending ? "Loading…" : "Select country…"}
        searchPlaceholder="Search countries…"
        onChange={(picked) => {
          const next = options.find((c) => countryLabel(c) === picked);
          if (next && next.code !== value) onChange(next.code);
        }}
      />
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}
