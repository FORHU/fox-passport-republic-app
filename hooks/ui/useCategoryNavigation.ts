"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useCategoryNavigation() {
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const selectCategory = (label: string) => {
    if (label === "More") {
      setIsMoreOpen(true);
    } else {
      // Encode URI component handles special characters like "&"
      router.push(`/?category=${encodeURIComponent(label)}`);
      setIsMoreOpen(false);
    }
  };

  const closeModal = () => setIsMoreOpen(false);

  return {
    isMoreOpen,
    selectCategory,
    closeModal
  };
}