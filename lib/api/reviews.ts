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

export const getReviewsByListing = async (listingId: string): Promise<Review[]> => {
  const res = await api.get(`/reviews/listing/${listingId}`);
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
