"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthActions } from "@/store/useAuthStore";

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
    router.push("/passport");
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

  // Mock data - in real app this would come from React Query
  const dashboardData: UserDashboardData = {
    userName,
    userInitial,
    upcomingEvents: 2,
    recommendations: 5,
    citizenLevel: 12,
    weather: {
      temp: "32°C",
      condition: "Sunny",
    },
  };

  // Wallet data
  const walletBalance = 4250.0;
  const recentTransactions = [
    { type: "purchase", label: "Ticket Purchase", amount: -1500 },
    { type: "topup", label: "Top Up", amount: 5000 },
  ];

  // Saved items
  const savedVibes = [
    {
      id: 1,
      title: "Hidden Jazz Bar",
      location: "Quezon City",
      status: "open",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB_LY_Y9MjrpTWy_NJTJIRwk76sZnsaIdsxuUIfYq_pNLi5QstkgJmV2mZg_qFfJnhOtNJ9OWN1f9482wc5qJ1VX2x7t932Q2CfhUv4qoGznn5mNqoNlggeX46L5F8wFGk46ZivWa7VCxRqJRCs_EkknPCF6QDvTdpuAwdLudXP-kP13gUd5Bw6nonOKZfwI199-TukQ0_hWH2KVljytpXdvlFEk3Q_GnkMqwagAAuvX3PvUOTmbUOWnt7P-40VvqyHkoe_HuyhMQg",
    },
    {
      id: 2,
      title: "Rizal Camping",
      location: "Tanay, Rizal",
      status: "upcoming",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD2XA52iqn3OYq_ek6lF7a5RrGBaIYiCLbhKptRxzzgr1w5g1rVfS3IAKovFFayv15ZLnHMWWtTtje9S1U71VWK-1PDExtYW9y_5Oc7EJYEc-Vp6RaZu68x7vepjoN0dNDpWVyuLMXRVxTjOkvIR2k6uhg2oNLwgTJW4xkjDC8zPazWFcViSboKtLViluxCMf4YcJ9dzEEJfo7uyHlmHBLpo9riL-1nhYHM0v-SRB-c1l6Ao0PMoBTYz1u7rbHmJiROH-b3NkvgseE",
    },
    {
      id: 3,
      title: "Underground Techno",
      location: "Makati City",
      status: "sold_out",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAmLMhfBavcKVkOWHaS4TPPk-NHIcut_ZhBBEe8lYdYR3H4t2yqSZKN4kaK-4daM6PVExafzgFu6-ETEkTvY3iOkNq3VyaKMs5jeDTMhhkOITtl93afJOgej_LM-nwJ4slOZvjY9jUaO0XJczNgnvj21yuB3eVwQrWu2qU4kFoFm9oertAy6N8vnz-DcYaCFbk-2wqIYps1HbNWSCB5TBISWObKfniMTbMOzf964UcanLKD2UIOD2M5IRj5kXf1kvppEdNzUJY4S3U",
    },
  ];

  return {
    // User info
    userName,
    userInitial,
    isAuthenticated,

    // Actions
    handleLogout,
    navigateToPassport,

    // Data
    dashboardData,
    walletBalance,
    recentTransactions,
    savedVibes,
  };
};
