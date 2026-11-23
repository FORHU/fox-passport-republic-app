// Years of experience is whole years from 0 to 100, the range the API accepts.
// The field keeps what was typed: rewriting it on each keystroke (e.g.
// stripping the "." from "2.5") would turn it into a different number.

export const WHOLE_YEARS_MESSAGE = "Enter whole years (0–100)";

const isWholeYears = (value: string) =>
  /^\d{1,3}$/.test(value) && Number(value) <= 100;

/** The message to show for `raw`, or null when it's empty or valid. */
export function yearsOfExperienceError(raw: string): string | null {
  const value = raw.trim();
  return value === "" || isWholeYears(value) ? null : WHOLE_YEARS_MESSAGE;
}

/** `raw` as a number of years, or undefined when it's empty or invalid. */
export function toYearsOfExperience(raw: string): number | undefined {
  const value = raw.trim();
  return isWholeYears(value) ? Number(value) : undefined;
}
