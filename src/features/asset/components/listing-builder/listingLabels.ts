import type { ListingType } from "@/features/asset/data/listingBuilderData";

/**
 * What each Studio calls its listing. `"inventory"` is the stored type value,
 * never shown to users: the Gear Studio builds gear (BUG-27).
 */
export const LISTING_LABELS: Record<
  ListingType,
  {
    studio: string;
    noun: string;
    lowerNoun: string;
    descriptionPlaceholder: string;
  }
> = {
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
