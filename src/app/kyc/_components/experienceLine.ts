import { experienceLabel } from "@/shared/lib/experienceBracket";

/** The experience an application carries (api#423). */
export interface ApplicationExperience {
  experience?: number | string | null;
  claimedExperience?: number | null;
}

export interface RequestWithExperience {
  status: string;
  eventFoxerApplication?: ApplicationExperience | null;
  providerFoxerApplication?: ApplicationExperience | null;
  organizerApplication?: ApplicationExperience | null;
}

/**
 * "40+ years of experience" for an approved application, as the admin left
 * it: the bracket when a claim over 30 was confirmed, the plain number
 * otherwise. Null before approval (review may still change it) or when the
 * role asks for no experience.
 */
export function experienceLine(request: RequestWithExperience): string | null {
  if (request.status !== "approved") return null;
  const app =
    request.eventFoxerApplication ??
    request.providerFoxerApplication ??
    request.organizerApplication;
  const label = experienceLabel(app?.experience, app?.claimedExperience);
  if (!label) return null;
  return `${label} ${label === "1" ? "year" : "years"} of experience`;
}
