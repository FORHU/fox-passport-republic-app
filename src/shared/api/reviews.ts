import api from "@/shared/lib/axios";
import type {
  Review,
  ReviewReply,
  ReviewSort,
  ReviewSubRatingAverages,
  ToggleHelpfulVoteResult,
} from "@/shared/types/review";

const EMPTY_SUB_AVERAGES: ReviewSubRatingAverages = {
  quality: null,
  communication: null,
  value: null,
  punctuality: null,
};

export const getReviewsByListing = async (
  listingId: string,
  sort?: ReviewSort,
): Promise<{
  reviews: Review[];
  ratingDistribution: Record<number, string>;
  subRatingAverages: ReviewSubRatingAverages;
}> => {
  const res = await api.get(`/reviews/listing/${listingId}`, {
    params: sort ? { sort } : undefined,
  });
  const data = res.data.data;
  if (Array.isArray(data)) {
    return {
      reviews: data,
      ratingDistribution: { 5: "0%", 4: "0%", 3: "0%", 2: "0%", 1: "0%" },
      subRatingAverages: EMPTY_SUB_AVERAGES,
    };
  }
  return {
    reviews: data?.reviews || [],
    ratingDistribution: data?.ratingDistribution || {},
    subRatingAverages: data?.subRatingAverages || EMPTY_SUB_AVERAGES,
  };
};

export const postReviewReply = async (
  reviewId: string,
  text: string,
): Promise<ReviewReply> => {
  const res = await api.post(`/reviews/${reviewId}/reply`, { text });
  return res.data.data;
};

export const toggleHelpfulVote = async (
  reviewId: string,
): Promise<ToggleHelpfulVoteResult> => {
  const res = await api.post(`/reviews/${reviewId}/helpful`);
  return res.data.data;
};

export const submitReview = async (data: {
  bookingId: string;
  rating: number;
  comment: string;
  targetId: string;
  targetType: string;
  quality?: number | null;
  communication?: number | null;
  value?: number | null;
  punctuality?: number | null;
}): Promise<Review> => {
  const res = await api.post("/reviews/create", data);
  return res.data.data;
};
