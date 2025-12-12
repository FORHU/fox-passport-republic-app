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
  type?: string;
  amenities?: string[];
  description?: string;
}

export interface POIResult {
  lat: number;
  lng: number;
  name: string;
  address: string;
  category: string;
  relevance: number;
}