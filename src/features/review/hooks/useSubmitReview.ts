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
      // There was an invalidation of ["user-bookings"] here. No query has ever
      // used that key: the bookings list this pushes to (`BookingListClient`,
      // `MobileBookingsView`) fetches in a `useEffect` and holds its rows in
      // component state, so it is outside the cache entirely and no key can
      // reach it. Removed rather than renamed, because renaming it would only
      // move a no-op somewhere less obvious.
      router.push("/booking");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Failed to submit review. Please try again.";
      toast.error(message);
    },
  });
}
