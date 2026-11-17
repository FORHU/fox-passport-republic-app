import type { TinFormats } from "@/shared/api/geo";

/**
 * The API's message for `value`, or null when it fits one of the country's
 * formats — the same check the API runs on submit (its utils/tax-id-formats).
 * Empty is null: the input's `required` covers a missing TIN. Null too while
 * the formats are still loading; the API still checks on submit.
 */
export function tinError(
  data: TinFormats | undefined,
  value: string,
): string | null {
  const v = value.toUpperCase().replace(/\s+/g, "");
  if (v === "" || !data) return null;
  const ok = data.formats.some((f) => {
    const m = new RegExp(f.pattern).exec(v);
    return !!m && (!f.rule || new RegExp(f.rule).test(m.slice(1).join("")));
  });
  return ok ? null : data.message;
}

/** The first format's example; the hint under the field lists them all. */
export function tinPlaceholder(data: TinFormats | undefined): string {
  return data?.formats[0]?.example ?? "";
}

/**
 * Every accepted format, grouped by what it is called — "TIN: 123-456-789 or
 * 123-456-789-000", "PAN: ABCDE1234F · Aadhaar: 1234 5678 9012". A country
 * with no listed format (an unmasked fallback) gets a plain description.
 */
export function tinHint(data: TinFormats | undefined): string {
  if (!data?.formats.length) return "";
  if (data.formats.every((f) => !f.mask)) {
    return "Any tax ID, 4–20 letters or digits";
  }
  const byLabel = new Map<string, string[]>();
  for (const f of data.formats) {
    byLabel.set(f.label, [...(byLabel.get(f.label) ?? []), f.example]);
  }
  return [...byLabel]
    .map(([label, examples]) => `${label}: ${examples.join(" or ")}`)
    .join(" · ");
}
