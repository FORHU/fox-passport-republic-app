// Venue Builder Data Constants
import { VenueType } from "@/types/venue";

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
  category: string;
  image?: string;    // local object URL or remote URL
  file?: File;      // the actual File from the device
}

export interface GalleryItem {
  id: string;
  url: string;        // local object URL (for preview) or remote URL
  caption: string;
  file?: File;
  image?: string;        // the actual File from the device (present before upload)
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: "spaces", label: "Space Types", icon: "weekend" },
  { id: "tech", label: "Tech & AV", icon: "speaker" },
  { id: "amenities", label: "Amenities", icon: "wifi" },
  { id: "staff", label: "Staffing", icon: "badge" },
  { id: "rules", label: "Policies", icon: "gavel" },
];

export const INITIAL_RESOURCES: Record<string, ResourceItem[]> = {
  spaces: [],
  tech: [],
  amenities: [],
  staff: [],
  rules: [],
};

export const VENUE_TYPES = Object.values(VenueType).map(
  (t) => t.charAt(0).toUpperCase() + t.slice(1)
);

// export const SAMPLE_GALLERY_URLS = [
//   "https://images.unsplash.com/photo-1582037928769-181f2422677e?q=80&w=1000",
//   "https://images.unsplash.com/photo-1574391884720-385e66752079?q=80&w=1000",
// ];
