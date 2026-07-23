// Event Builder Data Constants

export interface ResourceItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
  imageUrl?: string;
  resourceType?: "venue" | "asset" | "service";
  agreedPrice?: number;
  isOptional?: boolean;
  // Venue-only location fields for auto-fill
  city?: string;
  state?: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  file?: File;
  fileId?: string;
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
  "Birthday",
  "Wedding",
  "Social",
  "Other",
];

// Icon categories for cost breakdown calculations
export const VENUE_ICONS = ["location_city", "warehouse", "forest"];
export const TALENT_ICONS = ["music_note", "local_bar", "movie_filter", "mic"];
