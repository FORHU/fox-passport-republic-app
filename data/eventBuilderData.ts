// Event Builder Data Constants

export interface ResourceItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
  resourceType?: "venue" | "asset" | "service";
  agreedPrice?: number;
  isOptional?: boolean;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

export interface ResourceCategory {
  id: string;
  label: string;
  icon: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: "venue", label: "Venues", icon: "apartment" },
  { id: "talent", label: "Talent", icon: "groups" },
  { id: "service", label: "Services", icon: "room_service" },
  { id: "equipment", label: "Equipment", icon: "speaker" },
  { id: "vibe", label: "Vibe", icon: "shutter_speed" },
];

export const AVAILABLE_RESOURCES: Record<string, ResourceItem[]> = {
  venue: [],
  talent: [],
  service: [],
  equipment: [],
  vibe: [],
};

export const EVENT_CATEGORIES = [
  "Corporate",
  "Celebration",
  "Private Experience",
  "Popup",
  "Other",
];

// Icon categories for cost breakdown calculations
export const VENUE_ICONS = ["location_city", "warehouse", "forest"];
export const TALENT_ICONS = ["music_note", "local_bar", "movie_filter", "mic"];
