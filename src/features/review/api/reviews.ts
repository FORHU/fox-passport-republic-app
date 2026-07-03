import api from "@/shared/lib/axios";

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

export const getReviewsByListing = async (listingId: string): Promise<{ reviews: Review[]; ratingDistribution: Record<number, string> }> => {
  const res = await api.get(`/reviews/listing/${listingId}`);
  const data = res.data.data;
  // Handle both old shape (array) and new shape ({ reviews, ratingDistribution })
  if (Array.isArray(data)) {
    return { reviews: data, ratingDistribution: { 5: "0%", 4: "0%", 3: "0%", 2: "0%", 1: "0%" } };
  }
  return { reviews: data?.reviews || [], ratingDistribution: data?.ratingDistribution || {} };
};

export const getRecentActivity = async (limit = 10): Promise<Review[]> => {
  const res = await api.get(`/reviews/activity`, { params: { limit } });
  return res.data.data || [];
};

export const createReview = async (data: {
  rating: number;
  comment: string;
  targetId: string;
  type: string;
}): Promise<Review> => {
  const res = await api.post("/reviews/create", data);
  return res.data.data;
};

export const submitReview = async (data: {
  bookingId: string;
  rating: number;
  comment: string;
  targetId: string;
  targetType: string;
}): Promise<Review> => {
  const res = await api.post("/reviews/create", data);
  return res.data.data;
};

export const getReviewsByTarget = async (targetId: string, targetType: string, includeReplies = true): Promise<Review[]> => {
  const res = await api.get("/reviews", { params: { targetId, targetType, includeReplies } });
  const raw = res.data.data ?? res.data;
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => ({
    ...r,
    replies: r.replies ?? r.reviewReplies ?? [],
  }));
};

export const postReviewReply = async (reviewId: string, text: string): Promise<ReviewReply> => {
  const res = await api.post(`/reviews/${reviewId}/reply`, { text });
  return res.data.data;
};

export const updateReview = async (
  id: string,
  data: Partial<{ rating: number; comment: string }>
): Promise<Review> => {
  const res = await api.put(`/reviews/${id}`, data);
  return res.data.data;
};

export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/${id}`);
};
