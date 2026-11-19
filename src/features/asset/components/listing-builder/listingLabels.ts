import type { ListingType } from "@/features/asset/data/listingBuilderData";

export interface ListingLabels {
  studio: string;
  noun: string;
  lowerNoun: string;
  descriptionPlaceholder: string;
}

/**
 * What each Studio calls its listing. `"inventory"` is the stored type value,
 * never shown to users: the Gear Studio builds gear (BUG-27).
 */
export const LISTING_LABELS: Record<ListingType, ListingLabels> = {
  inventory: {
    studio: "Gear Studio",
    noun: "Gear",
    lowerNoun: "gear",
    descriptionPlaceholder: "Describe your gear...",
  },
  service: {
    studio: "Service Studio",
    noun: "Service",
    lowerNoun: "service",
    descriptionPlaceholder: "Describe your service...",
  },
};

/** The Service Studio opened for a performer gig (`?type=performer`). */
export const PERFORMER_LABELS: ListingLabels = {
  studio: "Gig Studio",
  noun: "Gig",
  lowerNoun: "gig",
  descriptionPlaceholder: "Describe your gig...",
};
