"use client";

import React from "react";
import { useNearbyFirst } from "@/shared/hooks/useNearbyFirst";
import { NearbyToggle } from "@/shared/components/ui/NearbyToggle";
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
  // Both strips start in the user's own city and fall back to everywhere.
  const trendingNearby = useNearbyFirst<EventTemplate>(
    ["trending-mobile"],
    (city) => fetchTrendingTemplates(undefined, 8, city),
  );
  const foxersNearby = useNearbyFirst<Foxer>(["foxers-mobile"], (city) =>
    fetchFoxers(10, 1, undefined, city),
  );
  const trending = trendingNearby.data;
  const foxers = foxersNearby.data;

  return (
    <div
      style={{
        background: "var(--canvas)",
        minHeight: "100svh",
        color: "var(--color-white)",
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
      <MobileTrendingStrip
        trending={trending}
        title={
          trendingNearby.usingNear
            ? `Trending in ${trendingNearby.city}`
            : undefined
        }
        toolbar={
          <NearbyToggle
            city={trendingNearby.city}
            scope={trendingNearby.scope}
            onChange={trendingNearby.setScope}
            nearEmpty={trendingNearby.nearEmpty}
          />
        }
      />

      {/* Who's vibe matches yours? */}
      <MobileFoxersStrip
        foxers={foxers}
        toolbar={
          <NearbyToggle
            city={foxersNearby.city}
            scope={foxersNearby.scope}
            onChange={foxersNearby.setScope}
            nearEmpty={foxersNearby.nearEmpty}
          />
        }
      />

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
