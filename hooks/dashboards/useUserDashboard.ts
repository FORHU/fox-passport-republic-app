"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions, useAuthStore } from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface UserDashboardData {
  userName: string;
  userInitial: string;
  upcomingEvents: number;
  recommendations: number;
  citizenLevel: number;
  weather: {
    temp: string;
    condition: string;
  };
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
      try {
        const res = await api.get(`/bookings/upcoming`);
        return res.data.data || [];
      } catch (error) {
        // Fallback to mock data if API fails
        console.warn("Failed to fetch upcoming events, using mock:", error);
        return [
          {
            id: 1,
            title: "Neon Nights Festival",
            date: "Tomorrow, 8:00 PM",
            location: "Electric Avenue, Tokyo",
            image:
              "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
            attendees: 1240,
          },
        ];
      }
    },
    enabled: !!userId,
  });

  // 3. Fetch Saved Vibes (Favorites)
  const { data: savedVibes = [], isLoading: isLoadingSaved } = useQuery({
    queryKey: ["user-saved-vibes", userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        const res = await api.get(`/users/${userId}/saved-events`);
        return res.data.data || [];
      } catch (error) {
        console.warn("Failed to fetch saved vibes, using mock:", error);
        return [
          {
            id: 1,
            title: "Underground Techno Blast",
            location: "Berlin, Germany",
            status: "open",
            image:
              "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=2076&auto=format&fit=crop",
          },
          {
            id: 2,
            title: "Digital Art Exhibition",
            location: "Seoul, South Korea",
            status: "upcoming",
            image:
              "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=1972&auto=format&fit=crop",
          },
          {
            id: 3,
            title: "Sunset Jazz Session",
            location: "New Orleans, USA",
            status: "sold_out",
            image:
              "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2032&auto=format&fit=crop",
          },
        ];
      }
    },
    enabled: !!userId,
  });

  // 4. Fetch Recommendations (For You)
  const { data: recommendations = [], isLoading: isLoadingRecs } = useQuery({
    queryKey: ["user-recommendations", userId],
    queryFn: async () => {
      try {
        // Could be personalized based on user preferences
        const res = await api.get("/events/recommendations");
        return res.data.data || [];
      } catch (error) {
        console.warn("Failed to fetch recommendations, using mock:", error);
        return [
          {
            id: 1,
            title: "Cyberpunk Street Food Market",
            category: "Food",
            match: 98,
            image:
              "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop",
          },
        ];
      }
    },
    enabled: !!userId,
  });

  // Combine loading states
  const isLoading = isLoadingEvents || isLoadingSaved || isLoadingRecs;

  // Reconstruct dashboardData for backward compatibility
  const dashboardData: UserDashboardData = {
    userName,
    userInitial,
    upcomingEvents: upcomingEvents.length,
    recommendations: recommendations.length,
    citizenLevel: 12, // Mock or fetch
    weather: {
      temp: "32°C",
      condition: "Sunny",
    },
  };

  // Wallet data (Mock)
  const walletBalance = 4250.0;
  const recentTransactions: { type: "purchase" | "topup"; label: string; amount: number }[] = [
    { type: "purchase", label: "Ticket Purchase", amount: -1500 },
    { type: "topup", label: "Top Up", amount: 5000 },
  ];

  return {
    userName,
    userInitial,
    isAuthenticated,
    dashboardData,
    walletBalance,
    recentTransactions,
    savedVibes, // Return the query data directly
    upcomingEvents, // Also exporing this if needed
    recommendations, // Also exporting this if needed
    isLoading,

    // Actions
    handleLogout,
    navigateToPassport,
  };
};
