import api from "@/shared/lib/axios";
import type { Review, ReviewReply } from "@/shared/types/review";

export const getReviewsByListing = async (
  listingId: string,
): Promise<{
  reviews: Review[];
  ratingDistribution: Record<number, string>;
}> => {
  const res = await api.get(`/reviews/listing/${listingId}`);
  const data = res.data.data;
  if (Array.isArray(data)) {
    return {
      reviews: data,
      ratingDistribution: { 5: "0%", 4: "0%", 3: "0%", 2: "0%", 1: "0%" },
    };
  }
  return {
    reviews: data?.reviews || [],
    ratingDistribution: data?.ratingDistribution || {},
  };
};

export const postReviewReply = async (
  reviewId: string,
  text: string,
): Promise<ReviewReply> => {
  const res = await api.post(`/reviews/${reviewId}/reply`, { text });
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
