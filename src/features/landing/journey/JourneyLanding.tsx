"use client";

import { useEffect } from "react";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { useLandingPrefsStore } from "@/shared/store/useLandingPrefsStore";
import JourneyHero from "./JourneyHero";
import JourneyFooter from "./JourneyFooter";
import { ClosingCta, EarnBlock } from "./sections";
import { EventGrid, EventTypes } from "./booking";
import { FloorPlan } from "./FloorPlan";

/**
 * Where the event grid was, when the visitor has switched events off in the
 * header (app#380). Keeps the #events anchor for "Find events", says what
 * happened, and turns them back on in one click.
 */
function EventsHidden({ onShow }: { onShow: () => void }) {
  return (
    <section id="events" className="scroll-mt-4 px-5 py-10 sm:px-10 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 rounded-2xl border border-white/10 bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70">
          Events are hidden. You turned them off in the header.
        </p>
        <button
          type="button"
          onClick={onShow}
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-black hover:bg-accent-hover transition-colors cursor-pointer"
        >
          Show events
        </button>
      </div>
    </section>
  );
}

/**
 * The public landing page (signed-in visitors are redirected into the app
 * from "/", see shared/lib/server/home-redirect.ts). Under the hero it reads as
 * the drawings for one night: events to book as plan sheets, the kinds of event
 * as the sheet index, the floor plan of how a night is put together, and the
 * schedule of trades for the people who supply it.
 */
export default function JourneyLanding() {
  const showEvents = useLandingPrefsStore((s) => s.showEvents);
  const setShowEvents = useLandingPrefsStore((s) => s.setShowEvents);

  // The visitor's saved choice, read after mount so the server HTML and the
  // first client render match (both show the grid).
  useEffect(() => {
    void useLandingPrefsStore.persist.rehydrate();
  }, []);

  return (
    <div className="bg-canvas text-white antialiased selection:bg-accent selection:text-black [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[color:var(--accent-text)] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[color:var(--accent-text)] [&_select:focus-visible]:outline-2 [&_select:focus-visible]:outline-offset-2 [&_select:focus-visible]:outline-[color:var(--accent-text)]">
      <LandingHeader eventsToggle />
      <main>
        <JourneyHero />
        {showEvents ? (
          <EventGrid />
        ) : (
          <EventsHidden onShow={() => setShowEvents(true)} />
        )}
        <EventTypes />
        <FloorPlan />
        <EarnBlock />
        <ClosingCta />
      </main>
      <JourneyFooter />
    </div>
  );
}
