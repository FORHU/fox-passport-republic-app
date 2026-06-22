"use client";

import { useState, useMemo } from "react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCategories } from "@/features/category/hooks/useCategories";

const VENUE_ROLES = ["host", "mayor", "foxerAsset", "foxerService"];

const EVENT_CATEGORY_ORDER = ["birthday", "wedding", "corporate", "social", "other"];

const EVENT_CATEGORY_COLORS: Record<string, string> = {
  birthday:  "#84cc16",
  wedding:   "#ec4899",
  corporate: "#06b6d4",
  social:    "#8b5cf6",
  other:     "#f97316",
};

function userCanSeeVenueCategories(user: any): boolean {
  if (!user) return false;
  const systemRole = (user?.systemRole ?? user?.role ?? "").toLowerCase();
  if (systemRole === "admin" || systemRole === "super_admin") return true;
  const roleType: string[] = user?.roleType ?? [];
  return roleType.some((r) => VENUE_ROLES.includes(r));
}

/**
 * Custom hook for landing page state and behavior
 * Now fetches categories from backend API
 */
export function useLandingPage() {
  const { openLogin, openSignup, user } = useAuthStore();
  const { categories, loading: categoriesLoading } = useCategories();
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Initialize scroll reveal animations
  useScrollReveal();

  const canSeeVenues = userCanSeeVenueCategories(user);

  // Map API categories to match component expectation
  // New backend schema includes design data directly
  const categoriesWithDesign = useMemo(() => {
    return categories
      .filter((cat) => {
        // Only show event categories in Vibe Check
        if (!cat.isEventCategory) return false;
        // Venue-only event categories restricted to foxers/hosts (edge case)
        const s = cat.sources;
        if (s && s.venues > 0 && s.assets === 0 && s.services === 0 && s.events === 0) {
          return canSeeVenues;
        }
        return true;
      })
      .sort((a, b) => {
        const ai = EVENT_CATEGORY_ORDER.indexOf(a.name.toLowerCase());
        const bi = EVENT_CATEGORY_ORDER.indexOf(b.name.toLowerCase());
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      })
      .map((cat) => {
        // Use fallback if backend data is missing for some reason
        const image =
          cat.image ||
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800";
        const tagline = cat.tagline || "Explore experiences";
        const spotLabel = cat.spotLabel || "Explore";

        return {
          ...cat,
          // Map API fields to component expected fields
          id: cat.slug, // Use slug as id for routing
          title: cat.name,
          tagline: tagline,
          image: image,
          spots: spotLabel,
          icon: cat.icon,
          children: cat.subCategories || [],
          spotColor: EVENT_CATEGORY_COLORS[cat.name.toLowerCase()] ?? "#ccff00",
        };
      });
  }, [categories, canSeeVenues]);

  // Compute displayed categories based on toggle state
  const displayedCategories = useMemo(
    () =>
      showAllCategories
        ? categoriesWithDesign
        : categoriesWithDesign.slice(0, 5),
    [showAllCategories, categoriesWithDesign]
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
    categoriesLoading,

    // Actions
    toggleCategories,
    openAuthModal,
  };
}
