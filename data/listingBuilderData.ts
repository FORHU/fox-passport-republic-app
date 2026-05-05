// Listing Builder Data Constants

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
