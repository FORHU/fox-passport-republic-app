import type { Metadata } from "next";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { CalendarView } from "@/shared/components/calendar/CalendarView";

export const metadata: Metadata = {
  title: "Calendar | Fox Passport Republic",
  description:
    "Everything you've booked, host, organize or supply, in one calendar.",
};

// One calendar for every role — a citizen's bookings, a Foxer's jobs, a
// Mayor's venue dates. What's on it is scoped by the API.
export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <LandingHeader />
      <main className="mx-auto max-w-7xl px-4 pt-28 pb-20">
        <h1 className="text-3xl font-display font-bold text-white mb-6">
          Calendar
        </h1>
        <CalendarView />
      </main>
    </div>
  );
}
