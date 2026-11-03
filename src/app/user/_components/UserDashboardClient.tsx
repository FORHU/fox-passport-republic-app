"use client";

import React from "react";
import { useUserDashboard } from "@/features/user/hooks/useUserDashboard";
import LandingHeader from "@/features/landing/components/sections/LandingHeader";
import { UserWelcome } from "@/features/user/components/citizen/UserWelcome";
import { UserNextUp } from "@/features/user/components/citizen/UserNextUp";
import { UserForYou } from "@/features/user/components/citizen/UserForYou";
import { UserCalendarWidget } from "@/features/user/components/citizen/UserCalendarWidget";
import { UserWallet } from "@/features/user/components/citizen/UserWallet";
import { UserSavedVibes } from "@/features/user/components/citizen/UserSavedVibes";
import { UserFooter } from "@/features/user/components/citizen/UserFooter";
import { hasPermission } from "@/shared/lib/permissions";
import { isFoxer } from "@/shared/constants/roles";
import {
  ProductTour,
  TourReplayButton,
  type TourStep,
} from "@/shared/components/ui/ProductTour";

const CITIZEN_TOUR_KEY = "citizen-dashboard";

const CITIZEN_TOUR: TourStep[] = [
  {
    title: "Welcome to your dashboard",
    body: "This is home base: your upcoming events, your calendar and what's worth booking next. Here's a quick look around.",
  },
  {
    target: "user-identity",
    title: "You, at a glance",
    body: "Your roles and what's coming up. Find an event to book, or open your passport to see your level and stamps.",
  },
  {
    target: "user-next-up",
    title: "Next up",
    body: "Your upcoming bookings, soonest first. Open one for details, tickets and messages.",
  },
  {
    target: "user-calendar",
    title: "Your calendar",
    body: "Everything you've booked on one calendar, so you can spot a clash before you book.",
  },
  {
    target: "user-for-you",
    title: "Venues to explore",
    body: "Live venue listings, filtered by category. Foxer roles unlock this section.",
  },
  {
    target: "user-wallet",
    title: "Saved and wallet",
    body: "What you've saved to come back to, plus your Fox Wallet balance.",
  },
  {
    title: "That's it",
    body: "You can replay this tour any time with Take the tour, next to My passport at the top of the page.",
  },
];

interface UserDashboardClientProps {
  user: any;
  dashboardData: any;
  venues?: any[];
}

function UserDashboardContent({
  user,
  dashboardData,
  venues = [],
}: UserDashboardClientProps) {
  const {
    userName,
    walletBalance,
    recentTransactions,
    savedVibes,
    upcomingEvents,
    isLoading,
  } = useUserDashboard();

  // Use server data if client doesn't have
  const displayUserName = userName || user?.name || "User";
  const displayDashboardData = dashboardData;

  const roleType: string[] = user?.roleType ?? [];
  // The whole user, not a `{ systemRole }` synthesised from it: permissions
  // come from the server on the user object now, and a subject carrying only a
  // role name answers `false` to everything.
  const canSeeVenues = hasPermission(user, "queue:read") || isFoxer(roleType);

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      {/* The same top bar as every other app page, so Passport doesn't swap it. */}
      <LandingHeader />

      <main className="grow pt-24 sm:pt-32 px-4 pb-16">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 lg:gap-10">
          <div data-tour="user-identity">
            <UserWelcome
              userName={displayUserName}
              upcomingEventsCount={displayDashboardData.upcomingEvents}
              extra={<TourReplayButton tourKey={CITIZEN_TOUR_KEY} />}
            />
          </div>

          {/* Row 1: what's booked */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            <div
              data-tour="user-next-up"
              className="md:col-span-7 lg:col-span-8 flex flex-col"
            >
              <UserNextUp
                bookings={upcomingEvents}
                isLoading={isLoading}
                className="flex-1"
              />
            </div>
            <div
              data-tour="user-calendar"
              className="md:col-span-5 lg:col-span-4 flex flex-col"
            >
              <UserCalendarWidget className="flex-1" />
            </div>
          </div>

          {/* Row 2: what to book next, and what's kept */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div data-tour="user-for-you" className="lg:col-span-8 min-w-0">
              <UserForYou canSeeVenues={canSeeVenues} venues={venues} />
            </div>
            <div
              data-tour="user-wallet"
              className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 content-start"
            >
              <UserSavedVibes savedVibes={savedVibes} />
              <UserWallet
                walletBalance={walletBalance}
                recentTransactions={recentTransactions}
              />
            </div>
          </div>
        </div>
      </main>

      <UserFooter />
      <ProductTour tourKey={CITIZEN_TOUR_KEY} steps={CITIZEN_TOUR} />
    </div>
  );
}

export default function UserDashboardClient({
  user,
  dashboardData,
  venues,
}: UserDashboardClientProps) {
  return (
    <UserDashboardContent
      user={user}
      dashboardData={dashboardData}
      venues={venues}
    />
  );
}
