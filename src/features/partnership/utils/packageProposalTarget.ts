interface TemplateLike {
  templateVenues?: { venue?: { id?: string; name?: string | null } | null }[];
}

/**
 * A proposal targets a booked Event or a Venue; there is no proposal to a
 * package (an EventTemplate). So a package is proposed to through the venue it
 * is held at: its first venue, the same one the page puts on its map. A package
 * with no venue has nothing to propose to. Sending the package's own id as
 * `targetEventId` was the bug: the API looked it up as an Event and answered
 * "Target Event not found."
 */
export function packageProposalTarget(
  template: TemplateLike | null | undefined,
): { venueId: string; name: string } | null {
  const venue = template?.templateVenues?.find((v) => v.venue?.id)?.venue;
  return venue?.id
    ? { venueId: venue.id, name: venue.name || "This venue" }
    : null;
}
