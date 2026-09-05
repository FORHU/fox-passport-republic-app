"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchTrendingTemplates,
  EventTemplate,
} from "@/shared/api/event-templates";
import { fetchFoxers, Foxer } from "@/shared/api/foxers";
import { useLandingPage } from "@/features/landing/hooks/useLandingPage";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import MobileBottomNav from "@/shared/components/layout/MobileBottomNav";
import { RepublicFeedTeaser } from "./RepublicFeedTeaser";
import { MobileTopBar } from "./mobile/MobileTopBar";
import { MobileHeroHeader } from "./mobile/MobileHeroHeader";
import { MobileSearchBar } from "./mobile/MobileSearchBar";
import { MobileExploreStrip } from "./mobile/MobileExploreStrip";
import { MobileVibeStrip } from "./mobile/MobileVibeStrip";
import { MobileTrendingStrip } from "./mobile/MobileTrendingStrip";
import { MobileFoxersStrip } from "./mobile/MobileFoxersStrip";
import { MobileWhySection } from "./mobile/MobileWhySection";
import { MobileNewsletter } from "./mobile/MobileNewsletter";

export default function MobileHomePage() {
  const user = useAuthStore((s) => s.user);
  const { displayedCategories } = useLandingPage();
  const { data: trending = [] } = useQuery<EventTemplate[]>({
    queryKey: ["trending-mobile"],
    queryFn: () => fetchTrendingTemplates(undefined, 8),
  });
  const { data: foxers = [] } = useQuery<Foxer[]>({
    queryKey: ["foxers-mobile"],
    queryFn: () => fetchFoxers(10, 1),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div
      style={{
        background: "#050608",
        minHeight: "100svh",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* Top sticky bar */}
      <MobileTopBar user={user} />

      {/* Hero section */}
      <div
        style={{ position: "relative", zIndex: 1, padding: "40px 20px 28px" }}
      >
        <MobileHeroHeader />
        <MobileSearchBar />
      </div>

      {/* Explore Strip */}
      <MobileExploreStrip />

      {/* Browse by Vibe */}
      <MobileVibeStrip categories={displayedCategories} />

      {/* Trending Events */}
      <MobileTrendingStrip trending={trending} />

      {/* Who's vibe matches yours? */}
      <MobileFoxersStrip foxers={foxers} />

      {/* Why FoxPassport? */}
      <MobileWhySection />

      {/* Republic Foxer Feed Teaser */}
      <RepublicFeedTeaser />

      {/* Newsletter */}
      <MobileNewsletter />

      {/* Mobile Floating Bottom Navigation */}
      <MobileBottomNav
        onLoginClick={() => useAuthStore.getState().openLogin()}
      />

      <div style={{ height: 112 }} />
    </div>
  );
}
