import { useLandingPage } from "@/hooks/ui/useLandingPage";

// Section Components
import LandingHeader from "./sections/LandingHeader";
import HeroSection from "./sections/HeroSection";
import VibeCheckSection from "./sections/VibeCheckSection";
import TrendingSection from "./sections/TrendingSection";
import FoxersMatchSection from "./sections/FoxersMatchSection";
import FeaturesSection from "./sections/FeaturesSection";
import NewsletterSection from "./sections/NewsletterSection";
import LandingFooter from "./sections/LandingFooter";
import AuthModal from "./AuthModal";

const FoxerLandingPage: React.FC = () => {
  const { displayedCategories, openAuthModal } = useLandingPage();

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black">
      {/* Header */}
      <LandingHeader onSignIn={() => openAuthModal("login")} />

      {/* Main Content */}
      <main className="flex-grow pt-32">
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

      {/* Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default FoxerLandingPage;
