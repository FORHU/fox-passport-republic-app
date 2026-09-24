import { z } from "zod";

/**
 * The venue API has several historical list envelopes. Validate the envelope
 * explicitly while preserving the backend's additional venue fields.
 */
export const venueSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

export const venueListResponseSchema = z.union([
  z.array(venueSchema),
  z.object({ venues: z.array(venueSchema) }).passthrough(),
  z.object({ data: z.array(venueSchema) }).passthrough(),
]);

export type ValidatedVenue = z.infer<typeof venueSchema>;

export function parseVenueListResponse(payload: unknown): ValidatedVenue[] {
  const parsed = venueListResponseSchema.parse(payload);
  if (Array.isArray(parsed)) return parsed;
  if ("venues" in parsed && Array.isArray(parsed.venues)) {
    return parsed.venues;
  }
  if ("data" in parsed && Array.isArray(parsed.data)) return parsed.data;
  throw new Error("Validated venue response did not contain a venue list");
}
