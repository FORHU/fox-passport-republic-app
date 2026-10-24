"use client";

import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import JourneyHero from "./JourneyHero";
import JourneyFooter from "./JourneyFooter";
import { ClosingCta, EarnBlock } from "./sections";
import { EventGrid, EventTypes } from "./booking";
import { FloorPlan } from "./FloorPlan";

/**
 * The public landing page (signed-in visitors are redirected into the app
 * from "/", see shared/lib/server/home-redirect.ts). Under the hero it reads as
 * the drawings for one night: events to book as plan sheets, the kinds of event
 * as the sheet index, the floor plan of how a night is put together, and the
 * schedule of trades for the people who supply it.
 */
export default function JourneyLanding() {
  return (
    <div className="bg-canvas text-white antialiased selection:bg-accent selection:text-black [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[color:var(--accent-text)] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[color:var(--accent-text)] [&_select:focus-visible]:outline-2 [&_select:focus-visible]:outline-offset-2 [&_select:focus-visible]:outline-[color:var(--accent-text)]">
      <LandingHeader />
      <main>
        <JourneyHero />
        <EventGrid />
        <EventTypes />
        <FloorPlan />
        <EarnBlock />
        <ClosingCta />
      </main>
      <JourneyFooter />
    </div>
  );
}
