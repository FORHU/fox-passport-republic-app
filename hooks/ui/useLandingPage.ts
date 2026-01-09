"use client";

import { useState, useMemo } from "react";
import { useScrollReveal } from "./useScrollReveal";
import { useAuthStore } from "@/store/useAuthStore";
import { CATEGORIES } from "@/data/categories";

/**
 * Custom hook for landing page state and behavior
 */
export function useLandingPage() {
  const { openLogin, openSignup } = useAuthStore();
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Initialize scroll reveal animations
  useScrollReveal();

  // Compute displayed categories based on toggle state
  const displayedCategories = useMemo(
    () => (showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 5)),
    [showAllCategories]
  );

  const toggleCategories = () => {
    setShowAllCategories((prev) => !prev);
  };

  const openAuthModal = (type: "login" | "register" = "login") => {
    if (type === "register") {
      openSignup();
    } else {
      openLogin();
    }
  };

  return {
    // State
    showAllCategories,
    displayedCategories,

    // Actions
    toggleCategories,
    openAuthModal,
  };
}
