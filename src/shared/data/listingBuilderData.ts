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

export const SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  { id: "design", label: "Design", icon: "brush" },
  { id: "catering", label: "Catering", icon: "restaurant" },
  { id: "entertainment", label: "Entertainment", icon: "music_note" },
  { id: "service_staff", label: "Service Staff", icon: "groups" },
  { id: "other", label: "Other", icon: "more_horiz" },
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
