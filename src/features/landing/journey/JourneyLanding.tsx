"use client";

import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import JourneyHero from "./JourneyHero";
import JourneyFooter from "./JourneyFooter";
import { ClosingCta, EarnBlock, Itinerary } from "./sections";
import { EventGrid, EventTypes } from "./booking";

/**
 * The landing page for everyone, signed in or not. It leads with finding an
 * event (search, then events to book and the kinds of event), then how booking
 * works, and last the people who supply events.
 */
export default function JourneyLanding() {
  return (
    <div className="bg-canvas text-white antialiased selection:bg-accent selection:text-black [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[color:var(--accent-text)] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[color:var(--accent-text)] [&_select:focus-visible]:outline-2 [&_select:focus-visible]:outline-offset-2 [&_select:focus-visible]:outline-[color:var(--accent-text)]">
      <LandingHeader />
      <main>
        <JourneyHero />
        <div className="landing-chart-background">
          <EventGrid />
          <EventTypes />
        </div>
        <Itinerary />
        <EarnBlock />
        <ClosingCta />
      </main>
      <JourneyFooter />
    </div>
  );
}
