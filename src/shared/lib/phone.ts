import { z } from "zod";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

/**
 * Phone numbers, kept in step with the API's normalizePhone
 * (fox-passport-republic-api/src/utils/phone.ts). Its own module so the
 * phone metadata only loads with the forms that use it.
 */

/**
 * A phone number as E.164 (`+639171234567`) if it is valid in one of the
 * `allowed` countries, else null. `defaultCountry` reads a number typed
 * without its `+code`. Without `allowed` (the country list hasn't loaded yet)
 * any country passes here; the API still checks.
 */
export function normalizePhone(
  raw: string,
  defaultCountry: string,
  allowed?: ReadonlySet<string>,
): string | null {
  // The parser pulls a number out of free text ("<b>0917…</b>" parses), so
  // anything that isn't a phone character is refused before it gets there.
  if (!/^[\d\s()+.-]{1,30}$/.test(raw)) return null;
  const parsed = parsePhoneNumberFromString(
    raw,
    defaultCountry as CountryCode,
  );
  return parsed?.isValid() &&
    parsed.country &&
    (!allowed || allowed.has(parsed.country))
    ? parsed.number
    : null;
}

/**
 * A saved number split for the country picker and the input:
 * `+639171234567` → `{ country: "PH", number: "917 123 4567" }`. Numbers saved
 * before E.164 (`09171234567`) are read as Philippine.
 */
export function splitPhone(saved: string): {
  country?: string;
  number: string;
} {
  const parsed = parsePhoneNumberFromString(saved, "PH");
  if (!parsed?.country) return { number: saved };
  return {
    country: parsed.country,
    number: parsed
      .formatInternational()
      .replace(`+${parsed.countryCallingCode}`, "")
      .trim(),
  };
}

/** The country a typed number names with its own `+code`, if any. */
export function countryOfPhone(raw: string): string | undefined {
  return raw.trim().startsWith("+")
    ? parsePhoneNumberFromString(raw)?.country
    : undefined;
}

/** Optional phone: "" clears it; anything else parses to E.164. */
export const phoneSchema = (country: string, allowed?: ReadonlySet<string>) =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === "" || normalizePhone(v, country, allowed) !== null,
      "Enter a valid phone number for the selected country.",
    )
    .transform((v) => (v === "" ? "" : normalizePhone(v, country, allowed)!));
