export enum VenueStatus {
  DRAFT = "draft",
  PENDING_REVIEW = "pending_review",
  PUBLISHED = "published",
  SUSPENDED = "suspended",
  ARCHIVED = "archived",
}

export enum VenueType {
  INDOOR = "indoor",
  OUTDOOR = "outdoor",
  MIX = "mix",
  HOTEL = "hotel",
  BEACH_RESORT = "beach_resort",
  GARDEN = "garden",
  OTHER = "other",
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  price?: number;
  capacity?: number;
  type?: VenueType | string;
  amenities?: string[];
  description?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface POIResult {
  lat: number;
  lng: number;
  name: string;
  address: string;
  category: string;
  relevance: number;
}