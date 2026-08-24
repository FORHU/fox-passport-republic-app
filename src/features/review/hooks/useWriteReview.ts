/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWriteReviewStore } from "@/features/review/store/useReviewsStore";
import api from "@/shared/lib/axios";

export function useWriteReview(venueId: string) {
  const router = useRouter();
  const store = useWriteReviewStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await api.post("/reviews/create", {
          entityId: venueId,
          entityType: "venue",
          rating: store.rating,
          comment: store.reviewText,
        });
        toast.success("Thank you for your review!");
        store.reset();
        router.push(`/venues/${venueId}`);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to submit review. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, store, venueId],
  );

  const isValid = store.rating > 0 && store.reviewText.length >= 50;

  return {
    ...store,
    isValid,
    isSubmitting,
    handleBack,
    handleSubmit,
  };
}
