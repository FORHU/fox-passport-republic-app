"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { IMaskInput } from "react-imask";
import { fetchTinFormats } from "@/shared/api/geo";
import { tinError, tinHint, tinPlaceholder } from "@/shared/lib/tin";

/** A country's TIN formats, from the API (shared with TinField's cache). */
export function useTinFormats(countryCode: string) {
  return useQuery({
    queryKey: ["geo", "tin-formats", countryCode],
    queryFn: () => fetchTinFormats(countryCode),
    enabled: !!countryCode,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

interface TinFieldProps {
  /** ISO alpha-2 code, from the form's one CountryField; "" until set. */
  country: string;
  /** For the note on a country that issues no TIN. */
  countryName: string;
  /** As typed, with the mask's separators; the API stores it compact. */
  value: string;
  onChange: (value: string) => void;
  /** Ignored where the country issues no TIN. */
  required?: boolean;
  icon: ReactNode;
  labelClassName: string;
  /** For the TIN input; leaves room on the left for `icon`. */
  inputClassName: string;
  /** Tints the input's border on focus, like the form's other fields. */
  accent?: string;
}

/**
 * The TIN for the Foxer applications, in the format of the form's country
 * (CountryField). Masked as it is typed (react-imask; a country with several
 * formats moves to the longer one when the number outgrows the shorter), with
 * the accepted formats as a hint, and the API's message as its validity — so
 * the wizard won't Continue past a TIN the API would refuse. Formats: GET
 * /locations/countries/:code/tin-formats.
 */
export function TinField({
  country,
  countryName,
  value,
  onChange,
  required = false,
  icon,
  labelClassName,
  inputClassName,
  accent,
}: TinFieldProps) {
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  // The message shows under the field once it has been left, or once the
  // wizard's Continue found it invalid — not while a first try is typed.
  const [touched, setTouched] = useState(false);
  const [continued, setContinued] = useState(false);
  // A new country starts the field over (the form clears the number too).
  const [shownCountry, setShownCountry] = useState(country);
  if (shownCountry !== country) {
    setShownCountry(country);
    setTouched(false);
    setContinued(false);
  }

  const formats = useTinFormats(country);
  const error = tinError(formats.data, value);
  useEffect(() => {
    inputRef.current?.setCustomValidity(error ?? "");
  }, [error, country, formats.data]);

  const issuesTin = formats.data?.issuesTin ?? true;
  const isRequired = required && issuesTin;
  const shownError =
    continued || touched
      ? (error ??
        (continued && isRequired && value.trim() === ""
          ? "Enter your TIN"
          : null))
      : null;
  const hint = tinHint(formats.data);
  const hintId = `${fieldId}-tin-hint`;
  const errorId = `${fieldId}-tin-error`;
  const masks = (formats.data?.formats ?? [])
    .filter((f) => f.mask)
    .map((f) => ({ mask: f.mask }));
  const numeric = masks.length > 0 && masks.every((m) => !/[a*]/.test(m.mask));

  const inputProps = {
    id: `${fieldId}-tin`,
    name: "tinNumber",
    required: isRequired,
    className: inputClassName,
    placeholder:
      !country || formats.isPending ? "Loading…" : tinPlaceholder(formats.data),
    inputMode: numeric ? ("numeric" as const) : undefined,
    autoComplete: "off",
    "aria-invalid": shownError ? true : undefined,
    "aria-describedby":
      [hint && hintId, shownError && errorId].filter(Boolean).join(" ") ||
      undefined,
    onFocus: accent
      ? (e: React.FocusEvent<HTMLInputElement>) =>
          (e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 50%, transparent)`)
      : undefined,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      if (accent) e.currentTarget.style.borderColor = "";
      if (e.currentTarget.value.trim() !== "") setTouched(true);
    },
    // Fired by the wizard's checkValidity() when Continue is pressed.
    onInvalid: () => setContinued(true),
  };

  return (
    <div className="space-y-2">
      <label htmlFor={`${fieldId}-tin`} className={labelClassName}>
        TIN Number {isRequired ? "*" : "(Optional)"}
      </label>
      {!issuesTin && (
        <p className="mb-1 text-xs text-white/40">
          {countryName} does not issue a TIN. Leave this blank, or enter another
          tax number.
        </p>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
          {icon}
        </div>
        {masks.length > 0 ? (
          <IMaskInput
            // A new country is a new mask; start it fresh.
            key={country}
            {...inputProps}
            mask={masks}
            value={value}
            prepareChar={(s: string) => s.toUpperCase()}
            onAccept={(v: string) => onChange(v)}
            inputRef={inputRef}
          />
        ) : (
          <input
            key={country}
            {...inputProps}
            ref={inputRef}
            type="text"
            maxLength={20}
            readOnly={!country || formats.isPending}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
          />
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-white/40">
          {hint}
        </p>
      )}
      {shownError && (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {shownError}
        </p>
      )}
    </div>
  );
}
