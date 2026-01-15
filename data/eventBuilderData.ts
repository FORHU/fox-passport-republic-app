// Event Builder Data Constants

export interface ResourceItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
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
  venue: [
    {
      id: "v1",
      name: "Skyline Loft",
      cost: 15000,
      icon: "location_city",
      desc: "Modern rooftop with city views. 50pax.",
    },
    {
      id: "v2",
      name: "The Bunker",
      cost: 25000,
      icon: "warehouse",
      desc: "Underground industrial space. 200pax.",
    },
  ],
  talent: [
    {
      id: "t1",
      name: "DJ K-OS",
      cost: 8000,
      icon: "music_note",
      desc: "Techno & House specialist. 4 hour set.",
    },
    {
      id: "t2",
      name: "Mixologist Marco",
      cost: 5000,
      icon: "local_bar",
      desc: "Custom cocktail menu creation.",
    },
  ],
  service: [
    {
      id: "s1",
      name: "Full Catering",
      cost: 20000,
      icon: "restaurant",
      desc: "Buffet style dinner for 50 pax.",
    },
    {
      id: "s2",
      name: "Security Detail",
      cost: 4000,
      icon: "security",
      desc: "2 bouncers for 4 hours.",
    },
  ],
  equipment: [
    {
      id: "e1",
      name: "Funktion-One System",
      cost: 15000,
      icon: "speaker_group",
      desc: "Club standard audio setup.",
    },
    {
      id: "e2",
      name: "Laser Rig",
      cost: 5000,
      icon: "light_mode",
      desc: "3-point laser setup.",
    },
  ],
  vibe: [
    {
      id: "vb1",
      name: "Neon Signage",
      cost: 1500,
      icon: "bolt",
      desc: "Custom neon signs for photo ops.",
    },
    {
      id: "vb2",
      name: "Bean Bags",
      cost: 1000,
      icon: "chair",
      desc: "Chill zone seating.",
    },
  ],
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
