/**
 * Why a Provider declines a package invite (api#447). The values are what the
 * API stores; `other` needs a note. Same list as the mobile app.
 */
export const MATCH_DECLINE_REASONS = [
  { value: "unavailable_on_date", label: "Not available on that day" },
  { value: "price_too_low", label: "Price too low" },
  { value: "not_my_kind_of_event", label: "I don't do this kind of event" },
  { value: "too_far", label: "Too far from where I work" },
  { value: "no_capacity", label: "I can't take on more packages" },
  { value: "other", label: "Other" },
] as const;

export type MatchDeclineReason =
  (typeof MATCH_DECLINE_REASONS)[number]["value"];

export const MATCH_DECLINE_NOTE_MAX = 300;

export function matchDeclineReasonLabel(
  reason: string | null | undefined,
): string | null {
  if (!reason) return null;
  return MATCH_DECLINE_REASONS.find((r) => r.value === reason)?.label ?? null;
}
