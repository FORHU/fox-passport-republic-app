// Event types matching backend Prisma model

export interface EventHost {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string | null;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

export interface EventDetails {
  locationAddress: string;
  city: string;
  state: string;
  country: string;
}

export interface EventPricing {
  basePrice: string; // Decimal comes as string from Prisma
  currency: string;
}

export interface EventImage {
  id: string;
  imageUrl: string;
  altText?: string | null;
  displayOrder?: number | null;
  isPrimary: boolean;
}

export interface EventReview {
  rating: number;
}

export interface Event {
  id: string;
  hostId: string;
  categoryId: string | null;
  title: string;
  description: string;
  status: "draft" | "pending" | "ongoing" | "completed" | "cancelled";
  maxAttendees: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  host: EventHost;
  category: EventCategory | null;
  details?: EventDetails | null;
  pricing?: EventPricing[] | null;
  images: EventImage[];
  reviews?: EventReview[];
}

// API response types
export interface EventsApiResponse {
  success: boolean;
  count: number;
  data: Event[];
}

export interface EventApiResponse {
  success: boolean;
  data: Event;
}
