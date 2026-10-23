/**
 * Stored values (snake_case enums) as the words people read on the page:
 * "sound_system" → "Sound system", "one_time" → "one-time".
 */

// Category values that don't read right once de-snaked.
const CATEGORY_WORDS: Record<string, string> = {
  furnitures: "Furniture",
  dj: "DJ",
  mc: "MC",
};

export function categoryLabel(value?: string | null): string {
  if (!value) return "";
  const known = CATEGORY_WORDS[value.toLowerCase()];
  if (known) return known;
  const words = value.replace(/_/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const BILLING_WORDS: Record<string, string> = {
  hourly: "per hour",
  daily: "per day",
  nightly: "per night",
  weekly: "per week",
  monthly: "per month",
  one_time: "one-time",
  per_event: "per event",
  fixed: "fixed price",
};

/** How a price is charged, under the amount: "per day", "one-time". */
export function billingLabel(rate?: string | null): string {
  if (!rate) return "";
  return BILLING_WORDS[rate] ?? categoryLabel(rate).toLowerCase();
}
