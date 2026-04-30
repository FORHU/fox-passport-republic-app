import api from "@/lib/axios";

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
