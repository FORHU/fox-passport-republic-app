// Years of experience on a role application (api#423): up to 30, or a claim
// of more than 30, up to 50, backed by a CV. A claim is kept as a bracket,
// not an exact number. The API stores the same brackets.

export const BASE_MAX_YEARS_OF_EXPERIENCE = 30;
export const CLAIM_MAX_YEARS_OF_EXPERIENCE = 50;

/**
 * The bracket's start for more than 30 years: 31–34 is "30+" (30), 35–39
 * "35+" (35), 40–44 "40+", 45–49 "45+", and 50 is 50. 30 or less is
 * returned as it is.
 */
export function experienceBracket(years: number): number {
  if (years <= BASE_MAX_YEARS_OF_EXPERIENCE) return years;
  if (years >= CLAIM_MAX_YEARS_OF_EXPERIENCE) {
    return CLAIM_MAX_YEARS_OF_EXPERIENCE;
  }
  return Math.floor(years / 5) * 5;
}

/** A bracket's start as shown: "30+", "35+", "40+", "45+", or "50". */
export const bracketLabel = (start: number) =>
  start >= CLAIM_MAX_YEARS_OF_EXPERIENCE ? `${start}` : `${start}+`;

/**
 * Stored years as shown: the bracket ("40+") when they are a claim that
 * stands (`experience` equals `claimedExperience`), the plain number
 * otherwise.
 */
export function experienceLabel(
  experience: number | string | null | undefined,
  claimedExperience?: number | null,
): string {
  if (experience == null || experience === "") return "";
  return claimedExperience != null &&
    String(experience) === String(claimedExperience)
    ? bracketLabel(claimedExperience)
    : String(experience);
}
