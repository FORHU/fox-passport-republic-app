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

export interface Host {
  id?: string;
  name: string;
  avatar: string;
  bio: string;
  createdAt?: string;
  email?: string;
  phone?: string;
}

export interface Policy {
  id: string;
  name: string;
  description?: string;
  rules?: PolicyRule[];
}

export interface PolicyRule {
  id: string;
  from: number;
  to: number;
  refund: number;
}

export interface VenueItem {
  id: string;
  name: string;
  value: number;
  icon: string;
  desc: string;
  category: 'spaces' | 'amenities' | 'tech' | 'staff' | 'rules';
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  file?: File;
}

export interface VenueImage {
  url?: string;
  imageUrl?: string;
  image?: string;
  altText?: string;
  caption?: string;
}

export interface Venue {
  id: string;
  title?: string;
  name: string;
  address?: string;
  location?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  price?: number | string;
  billingRate?: string;
  capacity?: number;
  cap?: number;
  type?: string;
  venueType?: string;
  spaceType?: string[];
  spaceTypes?: string[];
  amenities?: string[];
  techAv?: string[];
  staffing?: string[];
  policies?: (Policy | string)[];
  description?: string;
  host?: Host;
  hostId?: string;
  ownerId?: string;
  owner_id?: string;
  creatorId?: string;
  userId?: string;
  user_id?: string;
  venueImages?: VenueImage[];
  status?: string;
  baseRate?: number;
  occupancyRate?: number;
  occupancy?: number;
  category?: string;
  country?: string;
  state?: string;
  city?: string;
}

export interface VenueUpdatePayload {
  name: string;
  description: string;
  category: string;
  capacity: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  price: number;
  spaceType: string[];
  amenities: string[];
  techAv: string[];
  staffing: string[];
  policies: string[];
  cancellationPolicyId?: string;
  status: string;
}

export interface POIResult {
  lat: number;
  lng: number;
  name: string;
  address: string;
  category: string;
  relevance: number;
}
