// Listing Builder Data Constants

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
}

export const ASSET_CATEGORIES: CategoryItem[] = [
  { id: "equipment", label: "Equipment", icon: "speaker" },
  { id: "furniture", label: "Furniture", icon: "chair" },
  { id: "decoration", label: "Decoration", icon: "palette" },
  { id: "other", label: "Other", icon: "more_horiz" },
];

export const SERVICE_CATEGORIES: CategoryItem[] = [
  { id: "planning", label: "Planning", icon: "event_note" },
  { id: "decoration", label: "Decor", icon: "brush" },
  { id: "catering", label: "Catering", icon: "restaurant" },
  { id: "photography", label: "Photo", icon: "camera_alt" },
  { id: "entertainment", label: "Entertainment", icon: "music_note" },
  { id: "other", label: "Other", icon: "more_horiz" },
];

export const CONDITIONS = ["new", "good", "fair", "refurbishment"] as const;

export const STATUSES = {
  inventory: ["available", "reserved", "unavailable"] as const,
  service: ["active", "paused", "unavailable"] as const,
};

export const INVENTORY_UNITS = [
  "Per Item / Day",
  "Per Item / Event",
  "Flat Rate",
] as const;
export const SERVICE_UNITS = ["Per Hour", "Per Day", "Per Project"] as const;

export type ListingType = "inventory" | "service";
export type InventoryStatus = (typeof STATUSES.inventory)[number];
export type ServiceStatus = (typeof STATUSES.service)[number];
export type Condition = (typeof CONDITIONS)[number];
