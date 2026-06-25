"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWriteReviewStore } from "@/store/useReviewsStore";

export function useWriteReview(venueId: string) {
  const router = useRouter();
  const store = useWriteReviewStore();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      toast.success("Thank you for your review!");
      store.reset();
      router.push("/reviews/select");
    },
    [router, store]
  );

  const isValid = store.rating > 0 && store.reviewText.length >= 50;

  return {
    ...store,
    isValid,
    handleBack,
    handleSubmit,
  };
}
