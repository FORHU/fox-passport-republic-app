// Venue Builder Data Constants

export interface ResourceCategory {
  id: string;
  label: string;
  icon: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  value: number;
  icon: string;
  desc: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: "spaces", label: "Space Types", icon: "weekend" },
  { id: "tech", label: "Tech & AV", icon: "speaker" },
  { id: "amenities", label: "Amenities", icon: "wifi" },
  { id: "staff", label: "Staffing", icon: "badge" },
  { id: "rules", label: "Policies", icon: "gavel" },
];

export const INITIAL_RESOURCES: Record<string, ResourceItem[]> = {
  spaces: [
    {
      id: "sp1",
      name: "Main Hall",
      value: 5000,
      icon: "grid_view",
      desc: "Open area suitable for 100+ standing guests.",
    },
    {
      id: "sp2",
      name: "VIP Mezzanine",
      value: 3000,
      icon: "balcony",
      desc: "Private elevated area overlooking the main floor.",
    },
  ],
  tech: [
    {
      id: "tc1",
      name: "Pro Audio System",
      value: 1500,
      icon: "speaker_group",
      desc: "Club standard audio setup.",
    },
    {
      id: "tc2",
      name: "Stage Lighting",
      value: 1000,
      icon: "light_mode",
      desc: "DMX controlled moving heads.",
    },
  ],
  amenities: [
    {
      id: "am1",
      name: "High-Speed WiFi",
      value: 200,
      icon: "wifi",
      desc: "Gigabit fiber connection.",
    },
    {
      id: "am2",
      name: "Air Conditioning",
      value: 500,
      icon: "ac_unit",
      desc: "Industrial grade climate control.",
    },
  ],
  staff: [
    {
      id: "st1",
      name: "Security Guard",
      value: 1500,
      icon: "security",
      desc: "Licensed security personnel.",
    },
    {
      id: "st2",
      name: "Cleaning Crew",
      value: 800,
      icon: "cleaning_services",
      desc: "Post-event deep cleaning.",
    },
  ],
  rules: [
    {
      id: "rl1",
      name: "No Smoking Inside",
      value: 0,
      icon: "smoke_free",
      desc: "Strict no smoking policy indoors.",
    },
    {
      id: "rl2",
      name: "12AM Curfew",
      value: 0,
      icon: "schedule",
      desc: "Music must stop by midnight.",
    },
  ],
};

export const VENUE_TYPES = [
  "Hotel",
  "Resort",
  "Hall",
  "Garden",
  "Beach",
  "Rooftop",
  "Other",
];

export const SAMPLE_GALLERY_URLS = [
  "https://images.unsplash.com/photo-1582037928769-181f2422677e?q=80&w=1000",
  "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=1000",
];
