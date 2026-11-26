// Years of experience are whole years from 0 to 30 (api#423). Someone with
// more ticks "I have more than 30 years" and may enter up to 50, with a CV
// that has references; an admin checks it. The API checks the same rules.
// The field keeps what was typed: rewriting it on each keystroke (e.g.
// stripping the "." from "2.5") would turn it into a different number. A digit
// edit that goes over the limit is refused instead (see `exceedsMaxYears`).

import {
  BASE_MAX_YEARS_OF_EXPERIENCE,
  CLAIM_MAX_YEARS_OF_EXPERIENCE,
  bracketLabel,
  experienceBracket,
} from "@/shared/lib/experienceBracket";

// The limits and brackets are shared with the admin review.
export {
  BASE_MAX_YEARS_OF_EXPERIENCE,
  CLAIM_MAX_YEARS_OF_EXPERIENCE,
  bracketLabel,
  experienceBracket,
};

export const wholeYearsMessage = (max = BASE_MAX_YEARS_OF_EXPERIENCE) =>
  `Enter whole years (0–${max})`;
export const maxYearsMessage = (max = BASE_MAX_YEARS_OF_EXPERIENCE) =>
  max === BASE_MAX_YEARS_OF_EXPERIENCE
    ? `Maximum is ${max} years. More than that? Tick the box below.`
    : `Maximum is ${max} years`;

export const EXPERIENCE_CLAIM_TOO_LOW = `Enter more than ${BASE_MAX_YEARS_OF_EXPERIENCE} years, or untick the box`;
// The admin reads the CV in the browser, which can show a PDF but not a Word
// file. The API refuses anything else too.
export const EXPERIENCE_CV_PDF_ONLY = "Upload your CV as a PDF";

/** Null for a PDF, else why the CV is refused. */
export const experienceCvError = (file: File) =>
  file.type === "application/pdf" || /\.pdf$/i.test(file.name)
    ? null
    : EXPERIENCE_CV_PDF_ONLY;

export const EXPERIENCE_CV_REQUIRED = `Upload your CV to claim more than ${BASE_MAX_YEARS_OF_EXPERIENCE} years`;

const isWholeYears = (value: string, max: number) =>
  /^\d{1,2}$/.test(value) && Number(value) <= max;

/**
 * True when `raw` is all digits but above `max` (or longer than it can be),
 * so the field should refuse it rather than show it. Anything else, "2.5"
 * included, is kept and checked by `yearsOfExperienceError`.
 */
export function exceedsMaxYears(
  raw: string,
  max = BASE_MAX_YEARS_OF_EXPERIENCE,
): boolean {
  const value = raw.trim();
  return /^\d+$/.test(value) && (value.length > 2 || Number(value) > max);
}

/** The message to show for `raw`, or null when it's empty or valid. */
export function yearsOfExperienceError(
  raw: string,
  max = BASE_MAX_YEARS_OF_EXPERIENCE,
): string | null {
  const value = raw.trim();
  return value === "" || isWholeYears(value, max)
    ? null
    : wholeYearsMessage(max);
}

/** `raw` as a number of years, or undefined when it's empty or invalid. */
export function toYearsOfExperience(
  raw: string,
  max = BASE_MAX_YEARS_OF_EXPERIENCE,
): number | undefined {
  const value = raw.trim();
  return isWholeYears(value, max) ? Number(value) : undefined;
}

/**
 * The bracket a typed claim falls in ("40+" for "42"), or null when the
 * value isn't a whole number over 30 and up to 50.
 */
export function typedBracketLabel(raw: string): string | null {
  const years = toYearsOfExperience(raw, CLAIM_MAX_YEARS_OF_EXPERIENCE);
  return years !== undefined && years > BASE_MAX_YEARS_OF_EXPERIENCE
    ? bracketLabel(experienceBracket(years))
    : null;
}

/** The highest number the field takes, with or without the claim ticked. */
export const yearsMax = (claiming: boolean) =>
  claiming ? CLAIM_MAX_YEARS_OF_EXPERIENCE : BASE_MAX_YEARS_OF_EXPERIENCE;

/**
 * What stops a step when "more than 30 years" is ticked: the years must be
 * over 30, and the CV uploaded. Null when not claiming, or when it's complete.
 */
export function experienceClaimError(
  raw: string,
  claiming: boolean,
  hasCv: boolean,
): string | null {
  if (!claiming) return null;
  const years = toYearsOfExperience(raw, CLAIM_MAX_YEARS_OF_EXPERIENCE);
  if (years === undefined || years <= BASE_MAX_YEARS_OF_EXPERIENCE) {
    return EXPERIENCE_CLAIM_TOO_LOW;
  }
  return hasCv ? null : EXPERIENCE_CV_REQUIRED;
}
