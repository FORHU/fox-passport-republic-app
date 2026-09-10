export type PostType =
  | "citizen_experience"
  | "review_share"
  | "venue_spotlight"
  | "gear_offering"
  | "service_offering"
  | "event_announcement"
  | "partner_announcement";

export type FeedTab = "all" | "community" | "marketplace" | "partners";

export type PostVisibility = "public" | "followers" | "only_me";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ReactionBreakdownEntry {
  type: ReactionType;
  count: number;
}

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
  visibility?: PostVisibility;
  venueId?: string | null;
  assetId?: string | null;
  serviceId?: string | null;
  eventId?: string | null;
  reviewId?: string | null;
  stampId?: string | null;
  originalPostId?: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPinned: boolean;
  isLikedByMe?: boolean;
  myReaction?: ReactionType | null;
  isFollowingAuthor?: boolean;
  isSavedByMe?: boolean;
  editedAt?: string | null;
  createdAt: string;
  author: FeedAuthor;
  originalPost?: {
    id: string;
    content: string;
    mediaUrls: string[];
    type: PostType;
    createdAt: string;
    author: {
      id: string;
      name: string;
      username?: string | null;
      imgId?: string | null;
    };
  } | null;
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
  parentId?: string | null;
  likesCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username?: string | null;
    imgId?: string | null;
    roleType: string[];
  };
  replies?: PostComment[];
}

export interface CreatePostPayload {
  type: PostType;
  content: string;
  mediaUrls?: string[];
  visibility?: PostVisibility;
  venueId?: string | null;
  assetId?: string | null;
  serviceId?: string | null;
  eventId?: string | null;
  reviewId?: string | null;
  stampId?: string | null;
}

export interface MentionCandidate {
  id: string;
  name: string;
  username: string | null;
  imgId: string | null;
}
