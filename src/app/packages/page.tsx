import { Suspense } from "react";
import type { Metadata } from "next";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import LandingFooter from "@/features/landing/components/sections/LandingFooter";
import PackageResults from "@/features/landing/journey/PackageResults";

// Public on purpose: /packages is not in proxy.ts's PROTECTED_ROUTES.
export const metadata: Metadata = {
  title: "Event packages",
  description:
    "Complete event packages (venue, gear and crew) with prices, from verified Foxers.",
};

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-canvas text-white antialiased selection:bg-accent selection:text-black">
      <LandingHeader />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        <Suspense fallback={null}>
          <PackageResults />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
