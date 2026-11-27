"use client";

import { useCallback, type InputHTMLAttributes } from "react";
import ReactInput from "input-format/react";
import {
  AsYouType,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

// E.164 caps a number at 15 digits, calling code included.
const E164_MAX_DIGITS = 15;

// Countries whose numbers are often typed with their national trunk "0"
// (PH `0917 123 4567`); after the +code that 0 isn't part of the number, so
// it is left out: +63 917 123 4567.
const DROPS_LEADING_ZERO: ReadonlySet<string> = new Set(["PH"]);

// onKeyDown is left out: input-format handles it itself, and its (experimental)
// typings declare it with a string argument rather than the event.
type PhoneNumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "onKeyDown" | "type"
> & {
  /** ISO alpha-2 country; its calling code is implied, not typed. */
  country: string;
  /** E.164 (`+639171234567`) or "". */
  value: string;
  onChange: (value: string) => void;
};

/**
 * A phone number input that formats the number as it is typed for `country`
 * (libphonenumber-js's AsYouType) without its `+code` — the country picker
 * next to it shows that: PH `917 123 4567`, US `415 555 0132`, GB
 * `7400 123456`. The caret stays where the person is typing (input-format).
 *
 * The same pairing react-phone-number-input uses inside, but fully controlled
 * with a synchronous onChange: that component reports changes from an effect,
 * which dropped digits (and could loop) when keys came in faster than the
 * form re-rendered.
 */
export function PhoneNumberInput({
  country,
  value,
  onChange,
  ...input
}: PhoneNumberInputProps) {
  const prefix = isSupportedCountry(country)
    ? `+${getCountryCallingCode(country)}`
    : "";
  const digits =
    prefix && value.startsWith(prefix) ? value.slice(prefix.length) : "";
  const maxDigits = E164_MAX_DIGITS - (prefix.length - 1);
  const dropsLeadingZero = DROPS_LEADING_ZERO.has(country);

  const parse = useCallback(
    (character: string, previous: string) =>
      /^\d$/.test(character) &&
      previous.length < maxDigits &&
      !(dropsLeadingZero && previous === "" && character === "0")
        ? character
        : undefined,
    [maxDigits, dropsLeadingZero],
  );

  const format = useCallback(
    (typed = "") => {
      if (!prefix) return { text: typed, template: "" };
      const formatter = new AsYouType(country as CountryCode);
      const strip = (s: string) => s.slice(prefix.length).replace(/^ /, "");
      const text = strip(formatter.input(prefix + typed));
      const template = formatter.getTemplate();
      return { text, template: template ? strip(template) : "" };
    },
    [country, prefix],
  );

  return (
    <ReactInput
      {...input}
      type="tel"
      inputMode="tel"
      value={digits}
      parse={parse}
      format={format}
      onChange={(next) => onChange(next && prefix ? prefix + next : "")}
      onPaste={(event) => {
        input.onPaste?.(event);
        // A pasted "+63 917 123 4567" would otherwise keep its 63 as typed
        // digits (+63 639…): a number with this country's own +code replaces
        // the field with its national digits.
        const pasted = event.clipboardData.getData("text").trim();
        if (event.defaultPrevented || !prefix || !pasted.startsWith("+")) {
          return;
        }
        const parsed = parsePhoneNumberFromString(pasted);
        if (parsed && `+${parsed.countryCallingCode}` === prefix) {
          event.preventDefault();
          onChange(prefix + parsed.nationalNumber.slice(0, maxDigits));
        }
      }}
    />
  );
}
