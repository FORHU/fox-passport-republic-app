"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  getCountryCallingCode,
  isSupportedCountry,
} from "libphonenumber-js/max";
import { PhoneNumberInput } from "@/shared/components/ui/PhoneNumberInput";
import {
  MOBILE_ONLY,
  normalizeContactPhone,
  phoneExample,
} from "@/shared/lib/phone";

interface PhoneFieldProps {
  label: string;
  /** ISO alpha-2 code, from the form's one CountryField; "" until set. */
  country: string;
  /** For the message ("…for Philippines."). */
  countryName: string;
  /** E.164 (`+639171234567`) or "". */
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  icon: ReactNode;
  labelClassName: string;
  /** For the number input; leaves room on the left for `icon`. */
  inputClassName: string;
}

/**
 * A phone number in the format of the form's country (CountryField): the
 * country's +code as a fixed prefix in the field (not part of what is typed,
 * so it can't be removed), the rest formatted as typed (PhoneNumberInput, on
 * libphonenumber-js — the same library the API's normalizeContactPhone checks
 * with), the country's example as a hint, and a message as its validity while
 * it isn't a valid number there — a mobile number in MOBILE_ONLY countries —
 * so the wizard won't Continue.
 */
export function PhoneField({
  label,
  country,
  countryName,
  value,
  onChange,
  required = false,
  icon,
  labelClassName,
  inputClassName,
}: PhoneFieldProps) {
  const fieldId = useId();
  const [touched, setTouched] = useState(false);
  const [continued, setContinued] = useState(false);
  // A new country starts the message over (the form keeps the digits).
  const [shownCountry, setShownCountry] = useState(country);
  if (shownCountry !== country) {
    setShownCountry(country);
    setTouched(false);
    setContinued(false);
  }

  const example = country ? phoneExample(country) : "";
  const error =
    value && country && normalizeContactPhone(value, country) === null
      ? MOBILE_ONLY.has(country)
        ? `Enter a valid mobile number for ${countryName}${example ? `, like ${example}` : ""}.`
        : `Enter a valid phone number for ${countryName}.`
      : null;
  useEffect(() => {
    const input = document.getElementById(`${fieldId}-number`);
    if (input instanceof HTMLInputElement) {
      input.setCustomValidity(error ?? "");
    }
  }, [error, country, fieldId]);

  const shownError =
    continued || touched
      ? (error ??
        (continued && required && value === ""
          ? `Enter your ${label.toLowerCase()}.`
          : null))
      : null;
  const callingCode = isSupportedCountry(country)
    ? `+${getCountryCallingCode(country)}`
    : "";
  // The prefix is in the field, so the hint is the rest of the number.
  const hint = example ? `e.g. ${example}` : "";
  const codeId = `${fieldId}-phone-code`;
  const hintId = `${fieldId}-phone-hint`;
  const errorId = `${fieldId}-phone-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={`${fieldId}-number`} className={labelClassName}>
        {label} {required ? "*" : "(Optional)"}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
          {icon}
          {callingCode && (
            // Fixed, outside the input: shown, never typed or deleted.
            <span
              aria-hidden
              data-testid="phone-prefix"
              className="ml-2.5 border-r border-white/15 pr-2.5 font-medium text-white/80 tabular-nums select-none"
            >
              {callingCode}
            </span>
          )}
        </div>
        {callingCode && (
          <span id={codeId} className="sr-only">
            Country code {callingCode}
          </span>
        )}
        {country ? (
          <PhoneNumberInput
            id={`${fieldId}-number`}
            name="contactNumber"
            // Formats as typed for the form's country, without its +code
            // (the hint shows that).
            country={country}
            required={required}
            autoComplete="tel"
            value={value}
            onChange={onChange}
            onBlur={() => {
              if (value) setTouched(true);
            }}
            // Fired by the wizard's checkValidity() when Continue is pressed.
            onInvalid={() => setContinued(true)}
            placeholder={example}
            maxLength={30}
            className={inputClassName}
            // Clears the icon and the prefix: pl-4 + icon + gap (2.75rem),
            // the code, its divider and a gap (1.25rem + 1px).
            style={
              callingCode
                ? {
                    paddingLeft: `calc(4rem + ${callingCode.length}ch + 1px)`,
                  }
                : undefined
            }
            aria-invalid={shownError ? true : undefined}
            aria-describedby={
              [callingCode && codeId, hint && hintId, shownError && errorId]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
        ) : (
          <input
            id={`${fieldId}-number`}
            readOnly
            className={inputClassName}
            placeholder="Loading…"
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
