/**
 * Stored values (snake_case enums) as the words people read on the page:
 * "sound_system" → "Sound system", "one_time" → "one-time".
 */

import { categoryLabel } from "@/shared/lib/categoryLabel";

export { categoryLabel };

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
