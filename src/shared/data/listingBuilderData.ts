// Shared Listing and Service Builder Constants

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
}

export const ASSET_CATEGORIES: CategoryItem[] = [
  { id: "sound_system", label: "Sound System", icon: "speaker" },
  { id: "furnitures", label: "Furniture", icon: "chair" },
  { id: "decorations", label: "Decorations", icon: "palette" },
  { id: "other", label: "Other", icon: "more_horiz" },
];

export const CONDITIONS = ["new", "good", "fair", "refurbished"] as const;

export const STATUSES = {
  inventory: ["available", "reserved", "unavailable"] as const,
};

export const INVENTORY_UNITS = [
  "Per Item / Day",
  "Per Item / Event",
  "Flat Rate",
] as const;

export type ListingType = "inventory" | "service";
export type InventoryStatus = (typeof STATUSES.inventory)[number];
export type Condition = (typeof CONDITIONS)[number];

export interface ServiceCategoryItem {
  id: string;
  label: string;
  icon: string;
}

// `entertainment` is a legacy ServiceCategory value. New service listings must
// not offer it; performer listings use their own granular categories instead.
export const SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  { id: "design", label: "Design", icon: "brush" },
  { id: "catering", label: "Catering", icon: "restaurant" },
  { id: "service_staff", label: "Service Staff", icon: "groups" },
  { id: "other", label: "Other", icon: "more_horiz" },
];

/** What the Service Studio is building: an operational service or a gig. */
export type ServiceStudioMode = "service" | "performer";

// The Studio opened for a gig (`?type=performer`). These are the API's
// PERFORMER_SERVICE_CATEGORIES (saving one needs `performer:manage`) without
// the legacy `entertainment`; they're what `isPerformerService` counts.
export const PERFORMER_SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  { id: "dj", label: "DJ", icon: "music_note" },
  { id: "live_band", label: "Live Band", icon: "graphic_eq" },
  { id: "photography", label: "Photography", icon: "camera_alt" },
  { id: "videography", label: "Videography", icon: "videocam" },
  { id: "mc", label: "MC", icon: "mic" },
];

export const SERVICE_STATUSES = ["active", "paused", "unavailable"] as const;
export const SERVICE_UNITS = [
  "Per Hour",
  "Per Day",
  "Per Week",
  "Per Month",
  "Per Year",
  "One Time",
  "Other",
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];
export type ServiceUnit = (typeof SERVICE_UNITS)[number];

/** Initial Status choices the API's AssetStatus names differently. */
export const ASSET_STATUS_TO_API: Record<string, string> = {
  unavailable: "archived",
};

/** The owner's choices back to the API's ServiceStatus, which has no
 * "active" or "unavailable". */
export const SERVICE_STATUS_TO_API: Record<string, string> = {
  active: "available",
  unavailable: "archived",
};

// Maps UI display labels to the backend BillingRate enum values
export const BILLING_RATE_MAP: Record<ServiceUnit, string> = {
  "Per Hour": "hourly",
  "Per Day": "daily",
  "Per Week": "weekly",
  "Per Month": "monthly",
  "Per Year": "yearly",
  "One Time": "one_time",
  Other: "other",
};
