import type { VenueConfirmation } from "@/features/dashboard/data/dashboardData";

const STATES: readonly VenueConfirmation[] = [
  "confirmed",
  "pending",
  "declined",
  "missing",
];

/** Worse states rank higher: one unsettled venue makes the event unsettled. */
const RANK: Record<VenueConfirmation, number> = {
  confirmed: 0,
  pending: 1,
  declined: 2,
  missing: 3,
};

interface TemplateVenueRow {
  venueId?: string | null;
  isOptional?: boolean;
  matched?: boolean;
  matchRequestStatus?: string;
}

function rowConfirmation(row: TemplateVenueRow): VenueConfirmation {
  if (!row.venueId) return "missing";
  // Attached directly: the API let it in only for the venue's own mayor or an
  // organizer with an approved affiliation, so it is already settled. Its
  // matchRequestStatus keeps the column default and means nothing.
  if (!row.matched) return "confirmed";
  switch (row.matchRequestStatus) {
    case "accepted":
    case "secured":
      return "confirmed";
    case "declined":
      return "declined";
    default:
      return "pending";
  }
}

/**
 * The event's venue confirmation, from `GET /event-templates`.
 *
 * Uses the API's `venueConfirmation` when it sends one (api#165). Until then
 * it is worked out here from `templateVenues` with the same rule.
 * TODO(api#165): once the API field is on staging, return it and drop the
 * fallback below.
 */
export function venueConfirmationOf(template: unknown): VenueConfirmation {
  const t = template as {
    venueConfirmation?: unknown;
    templateVenues?: unknown;
  } | null;

  const fromApi = t?.venueConfirmation;
  if (STATES.includes(fromApi as VenueConfirmation)) {
    return fromApi as VenueConfirmation;
  }

  const rows = Array.isArray(t?.templateVenues)
    ? (t.templateVenues as TemplateVenueRow[])
    : [];
  const required = rows.filter((row) => row && !row.isOptional);
  if (required.length === 0) return "missing";

  return required
    .map(rowConfirmation)
    .reduce((worst, next) => (RANK[next] > RANK[worst] ? next : worst));
}
