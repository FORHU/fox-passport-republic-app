"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import {
  getCountryCallingCode,
  isSupportedCountry,
} from "libphonenumber-js/max";
import { PhoneNumberInput } from "@/shared/components/ui/PhoneNumberInput";
import { normalizePhone, phoneExample } from "@/shared/lib/phone";

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
 * A phone number in the format of the form's country (CountryField): formatted
 * as typed (PhoneNumberInput, on libphonenumber-js — the same library the
 * API's normalizePhone checks with), with the country's example as a hint, and
 * a message as its validity while it isn't a valid number there, so the
 * wizard won't Continue.
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

  const error =
    value && country && normalizePhone(value, country) === null
      ? `Enter a valid phone number for ${countryName}.`
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
  const example = country ? phoneExample(country) : "";
  const hint =
    example && isSupportedCountry(country)
      ? `e.g. +${getCountryCallingCode(country)} ${example}`
      : "";
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
        </div>
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
            aria-invalid={shownError ? true : undefined}
            aria-describedby={
              [hint && hintId, shownError && errorId]
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
