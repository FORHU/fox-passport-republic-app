"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions, useAuthStore } from "@/features/auth/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

interface UserDashboardData {
  userName: string;
  userInitial: string;
  upcomingEvents: number;
  recommendations: number;
}

export const useUserDashboard = () => {
  const router = useRouter();
  const { logout } = useAuthActions();
  const { user, isAuthenticated } = useAuthStore();

  // User info
  const userName =
    (user?.name as string) || (user?.username as string) || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  // Handle logout
  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  // Navigate to passport
  const navigateToPassport = () => {
    router.push("/user/passport");
  };

  // Scroll reveal effect
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /*
   * -------------------------------------------------------------------------------
   * React Query Integration
   * -------------------------------------------------------------------------------
   */

  // User ID for queries
  const userId = user?.id;

  // 1. Fetch User Profile / Stats (Optional if not in auth store)
  // const { data: userStats } = useQuery({ queryKey: ['user-stats', userId], ... })

  // 2. Fetch Upcoming Events
  const { data: upcomingEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["user-upcoming-events", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/bookings/upcoming`);
      return res.data.data || [];
    },
    enabled: !!userId,
    refetchInterval: () => {
      if (typeof document !== 'undefined' && document.hidden) return false;
      return 15000; // 15 seconds for user events
    },
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  // 3. Fetch Saved Vibes (Favorites) — GET /favorites/user/:userId
  const { data: savedVibes = [], isLoading: isLoadingSaved } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/favorites/user/${userId}`);
      const raw: any[] = res.data.data || [];
      return raw.map((f) => {
        const img =
          f.venue?.images?.find((i: { isPrimary?: boolean }) => i.isPrimary)?.imageUrl ||
          f.venue?.images?.[0]?.imageUrl ||
          f.venue?.images?.[0]?.url ||
          "https://picsum.photos/seed/venue/64/64";
        return {
          id: f.id,
          title: f.venue?.name || f.event?.name || "Saved Item",
          location: f.venue
            ? [f.venue.city, f.venue.state].filter(Boolean).join(", ")
            : "",
          image: img,
          status: "open" as const,
        };
      });
    },
    enabled: !!userId,
    refetchInterval: () => {
      if (typeof document !== 'undefined' && document.hidden) return false;
      return 30000; // 30 seconds for favorites
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5,
  });

  // 4. Fetch Recommendations (For You)
  const { data: recommendations = [], isLoading: isLoadingRecs } = useQuery({
    queryKey: ["user-recommendations", userId],
    queryFn: async () => {
      const res = await api.get("/event-templates/recommendations");
      return res.data.data || [];
    },
    enabled: !!userId,
  });

  // Combine loading states
  const isLoading = isLoadingEvents || isLoadingSaved || isLoadingRecs;

  const dashboardData: UserDashboardData = {
    userName,
    userInitial,
    upcomingEvents: upcomingEvents.length,
    recommendations: recommendations.length,
  };

  const walletBalance = 0;
  const recentTransactions: { type: "purchase" | "topup"; label: string; amount: number }[] = [];

  return {
    userName,
    userInitial,
    isAuthenticated,
    dashboardData,
    walletBalance,
    recentTransactions,
    savedVibes,
    upcomingEvents,
    recommendations,
    isLoading,
    handleLogout,
    navigateToPassport,
  };
};
