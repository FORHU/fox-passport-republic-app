export type PostType =
  | "citizen_experience"
  | "review_share"
  | "venue_spotlight"
  | "gear_offering"
  | "service_offering"
  | "event_announcement"
  | "partner_announcement";

export type FeedTab = "all" | "community" | "marketplace" | "partners";

export interface FeedAuthor {
  id: string;
  name: string;
  username?: string | null;
  imgId?: string | null;
  roleType: string[];
  systemRole: string;
  passport?: {
    id: string;
    paths: Array<{
      path: string;
      level: number;
      totalXP: number;
    }>;
    userBadges: Array<{
      badge: {
        id: string;
        name: string;
        icon: string;
        color?: string | null;
        rarity: string;
      };
    }>;
    stamps?: Array<{
      id: string;
      eventName: string;
      imageUrl?: string | null;
      venueId?: string | null;
    }>;
  } | null;
}

export interface FeedPost {
  id: string;
  authorId: string;
  type: PostType;
  tab: FeedTab;
  content: string;
  mediaUrls: string[];
  venueId?: string | null;
  assetId?: string | null;
  serviceId?: string | null;
  eventId?: string | null;
  reviewId?: string | null;
  stampId?: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPinned: boolean;
  isLikedByMe?: boolean;
  isFollowingAuthor?: boolean;
  createdAt: string;
  author: FeedAuthor;
  venue?: {
    id: string;
    name: string;
    category: string;
    price: number | string;
    billingRate: string;
    capacity: number;
    city: string;
    state?: string | null;
    stampIconUrl?: string | null;
    images?: Array<{ id: string; url: string }>;
  } | null;
  asset?: {
    id: string;
    name: string;
    category: string;
    price: number | string;
    billingRate: string;
    condition: string;
    city?: string | null;
    images?: Array<{ id: string; url: string }>;
  } | null;
  service?: {
    id: string;
    name: string;
    category: string;
    price: number | string;
    billingRate: string;
    city: string;
    tags?: string[];
    images?: Array<{ id: string; url: string }>;
  } | null;
  event?: {
    id: string;
    name: string;
    description: string;
    eventCategory: string;
    startAt: string;
    endAt: string;
    guestCount: number;
    totalAmount: number | string;
    targetCity?: string | null;
  } | null;
  review?: {
    id: string;
    rating: number;
    comment?: string | null;
    entityId: string;
    entityType: string;
    createdAt: string;
  } | null;
  stamp?: {
    id: string;
    eventName: string;
    eventDate: string;
    location?: string | null;
    imageUrl?: string | null;
    venueId?: string | null;
    venue?: {
      id: string;
      name: string;
      city: string;
    } | null;
  } | null;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username?: string | null;
    imgId?: string | null;
    roleType: string[];
  };
}

export interface CreatePostPayload {
  type: PostType;
  content: string;
  mediaUrls?: string[];
  venueId?: string | null;
  assetId?: string | null;
  serviceId?: string | null;
  eventId?: string | null;
  reviewId?: string | null;
  stampId?: string | null;
}
