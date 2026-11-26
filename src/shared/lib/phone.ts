import { z } from "zod";
import {
  getCountryCallingCode,
  getExampleNumber,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";
import examples from "libphonenumber-js/examples.mobile.json";

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
  const parsed = parsePhoneNumberFromString(raw, defaultCountry as CountryCode);
  return parsed?.isValid() &&
    parsed.country &&
    (!allowed || allowed.has(parsed.country))
    ? parsed.number
    : null;
}

/**
 * Countries where a contact number must be a mobile number (landlines are
 * refused). Kept in step with the API's MOBILE_ONLY (utils/phone.ts).
 */
export const MOBILE_ONLY: ReadonlySet<string> = new Set(["PH"]);

/**
 * A contact number (a Venue Foxer's) as E.164: normalizePhone, and a mobile
 * number where its country is in MOBILE_ONLY — `+639171234567` passes, the
 * Manila landline `+63 2 8123 4567` doesn't. Else null. Kept in step with the
 * API's normalizeContactPhone.
 */
export function normalizeContactPhone(
  raw: string,
  defaultCountry: string,
): string | null {
  const e164 = normalizePhone(raw, defaultCountry);
  if (!e164) return null;
  const parsed = parsePhoneNumberFromString(e164);
  return parsed?.country &&
    MOBILE_ONLY.has(parsed.country) &&
    parsed.getType() !== "MOBILE"
    ? null
    : e164;
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

/**
 * A country's example mobile number as the phone inputs show it — international
 * format without the `+code`, which the country picker shows: PH
 * `905 123 4567`, US `201 555 0123`. "" for a country with no numbering.
 */
export function phoneExample(country: string): string {
  if (!isSupportedCountry(country)) return "";
  const example = getExampleNumber(country, examples);
  if (!example) return "";
  return example
    .formatInternational()
    .replace(`+${example.countryCallingCode}`, "")
    .trim();
}

/**
 * A saved number as E.164 for the phone inputs: `+639171234567` stays, a
 * number saved before E.164 (`09171234567`) is read as Philippine, and
 * anything that doesn't parse gives "".
 */
export function toE164(saved: string): string {
  if (!saved.trim()) return "";
  return parsePhoneNumberFromString(saved, "PH")?.number ?? "";
}

/**
 * The same typed digits under another country's calling code, for when the
 * country picker changes from `from` to `to`: PH `+639171234567` → US
 * `+19171234567`. The input then keeps what was typed (even half a number)
 * and shows it in the new country's format.
 */
export function rehomePhone(e164: string, from: string, to: string): string {
  if (!e164 || !isSupportedCountry(to)) return "";
  const code = isSupportedCountry(from)
    ? `+${getCountryCallingCode(from)}`
    : "";
  const national =
    code && e164.startsWith(code)
      ? e164.slice(code.length)
      : (parsePhoneNumberFromString(e164)?.nationalNumber ?? "");
  return national ? `+${getCountryCallingCode(to)}${national}` : "";
}

/** A number for display: `+639171234567` → `+63 917 123 4567`. */
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
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
