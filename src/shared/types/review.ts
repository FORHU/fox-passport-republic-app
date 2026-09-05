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

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  targetId: string;
  type: string;
  user?: {
    name: string;
    imgId?: string;
  };
  createdAt: string;
  replies?: ReviewReply[];
}
