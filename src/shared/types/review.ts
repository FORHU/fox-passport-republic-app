export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  text: string;
  user?: {
    name: string;
    imgId?: string;
  };
  createdAt: string;
}

export type ReviewSort = "most_helpful" | "recent" | "highest" | "lowest";

export interface ReviewSubRatingAverages {
  quality: number | null;
  communication: number | null;
  value: number | null;
  punctuality: number | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  targetId?: string;
  entityId?: string;
  type?: string;
  entityType?: string;
  quality?: number | null;
  communication?: number | null;
  value?: number | null;
  punctuality?: number | null;
  helpfulCount?: number;
  user?: {
    name: string;
    imgId?: string;
  };
  createdAt: string;
  replies?: ReviewReply[];
}

export interface ToggleHelpfulVoteResult {
  helpful: boolean;
  helpfulCount: number;
  xpAwarded: number;
}
