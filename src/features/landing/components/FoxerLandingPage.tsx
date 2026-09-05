/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useLandingPage } from "@/features/landing/hooks/useLandingPage";

// Section Components
import LandingHeader from "./sections/LandingHeader";
import HeroSection from "./sections/HeroSection";
import VibeCheckSection from "./sections/VibeCheckSection";
import TrendingSection from "./sections/TrendingSection";
import FoxersMatchSection from "./sections/FoxersMatchSection";
import FeaturesSection from "./sections/FeaturesSection";
import NewsletterSection from "./sections/NewsletterSection";
import LandingFooter from "./sections/LandingFooter";

interface FoxerLandingPageProps {
  featuredTemplates?: any[];
}

const FoxerLandingPage: React.FC<FoxerLandingPageProps> = ({
  featuredTemplates = [],
}) => {
  const { displayedCategories, openAuthModal } = useLandingPage();

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black">
      {/* Header */}
      <LandingHeader onSignIn={() => openAuthModal("login")} />

      {/* Main Content */}
      <main className="flex-grow pb-28 sm:pb-0">
        {/* Hero Section */}
        <HeroSection />

        {/* Vibe Check - Categories */}
        <VibeCheckSection categories={displayedCategories} />

        {/* Trending This Week */}
        <TrendingSection />

        {/* Foxers Section */}
        <FoxersMatchSection />

        {/* Features */}
        <FeaturesSection />

        {/* Newsletter */}
        <NewsletterSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default FoxerLandingPage;
