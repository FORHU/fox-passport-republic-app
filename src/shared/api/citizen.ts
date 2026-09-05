import api from "@/shared/lib/axios";

export interface CitizenStamp {
  id: string;
  eventName: string;
  eventDate: string;
  location?: string | null;
  venueId?: string | null;
  xpEarned: number;
  imageUrl?: string | null;
  createdAt: string;
  venue?: {
    id: string;
    name: string;
    city: string;
    stampIconUrl?: string | null;
    images?: { url: string }[];
  } | null;
}

export interface CitizenBadge {
  id: string;
  earnedAt: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color?: string | null;
    rarity: string;
  };
}

export interface CitizenPath {
  path: string;
  level: number;
  currentXP: number;
  totalXP: number;
}

export interface PublicCitizenProfile {
  id: string;
  name: string;
  username?: string | null;
  imgId?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  roleType: string[];
  systemRole: string;
  createdAt: string;
  foxerSpecializations?: Array<{
    id: string;
    roleType: string;
    category: string;
    source: "declared" | "earned";
  }>;
  passport?: {
    id: string;
    perks: string[];
    paths: CitizenPath[];
    stamps: CitizenStamp[];
    userBadges: CitizenBadge[];
  } | null;
  venues?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    billingRate: string;
    city: string;
    stampIconUrl?: string | null;
    images: { url: string }[];
  }>;
  assets?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    billingRate: string;
    images: { url: string }[];
  }>;
  services?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    billingRate: string;
    images: { url: string }[];
  }>;
  posts?: Array<{
    id: string;
    type: string;
    tab: string;
    content: string;
    mediaUrls: string[];
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    venue?: {
      id: string;
      name: string;
      city: string;
      stampIconUrl?: string | null;
    } | null;
    asset?: {
      id: string;
      name: string;
      category: string;
    } | null;
    service?: {
      id: string;
      name: string;
      category: string;
    } | null;
    stamp?: {
      id: string;
      eventName: string;
      xpEarned: number;
    } | null;
  }>;
  _count?: {
    posts: number;
    organizedEvents: number;
    bookings: number;
  };
}

export async function fetchPublicCitizenProfile(
  idOrUsername: string,
): Promise<PublicCitizenProfile> {
  const res = await api.get(`/users/profile/${idOrUsername}`);
  return res.data?.data;
}
