"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitReview } from "@/features/review/api/reviews";

interface SubmitReviewParams {
  bookingId: string;
  rating: number;
  comment: string;
  targetId: string;
  targetType: string;
}

export function useSubmitReview() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SubmitReviewParams) => submitReview(params),
    onSuccess: () => {
      toast.success("Review submitted! Thank you for your feedback.");
      queryClient.invalidateQueries({ queryKey: ["venue-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      router.push("/booking");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to submit review. Please try again.";
      toast.error(message);
    },
  });
}
