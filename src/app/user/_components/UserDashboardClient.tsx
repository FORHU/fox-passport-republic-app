"use client";

import React from "react";
import { useUserDashboard } from "@/features/user/hooks/useUserDashboard";
import { UserHeader } from "@/features/user/components/citizen/UserHeader";
import { UserIdentityCard } from "@/features/user/components/citizen/UserIdentityCard";
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
    body: "This is home base: your passport, your upcoming events and what's worth booking next. Here's a quick look around.",
  },
  {
    target: "user-identity",
    title: "Your FoxPassport",
    body: "Your level, stamps and citizen number. Every event you attend adds to it.",
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
    title: "Picked for you",
    body: "Events and Foxers that fit what you like and where you are.",
  },
  {
    target: "user-wallet",
    title: "Wallet and saved vibes",
    body: "Your balance and recent payments, plus the event styles you've saved to come back to.",
  },
  {
    title: "That's it",
    body: "You can replay this tour any time with the Take the tour button at the top of the page.",
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
    isAuthenticated,
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
      <UserHeader
        isAuthenticated={isAuthenticated}
        userName={displayUserName}
      />

      <main className="grow pt-28 sm:pt-36 px-4 pb-28 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex justify-end mb-2">
            <TourReplayButton tourKey={CITIZEN_TOUR_KEY} />
          </div>
          <div data-tour="user-identity">
            <UserIdentityCard />
          </div>

          <UserWelcome
            upcomingEventsCount={displayDashboardData.upcomingEvents}
            recommendationsCount={displayDashboardData.recommendations}
          />

          {/* Row 1: Next Up & Journey */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div
              data-tour="user-next-up"
              className="lg:col-span-8 flex flex-col"
            >
              <UserNextUp
                bookings={upcomingEvents}
                isLoading={isLoading}
                className="flex-1"
              />
            </div>
            <div
              data-tour="user-calendar"
              className="lg:col-span-4 flex flex-col"
            >
              <UserCalendarWidget className="flex-1" />
            </div>
          </div>

          {/* Row 2: For You & Wallet/Saved Vibes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div data-tour="user-for-you" className="lg:col-span-8">
              <UserForYou canSeeVenues={canSeeVenues} venues={venues} />
            </div>
            <div
              data-tour="user-wallet"
              className="lg:col-span-4 flex flex-col gap-6 h-full"
            >
              <UserWallet
                walletBalance={walletBalance}
                recentTransactions={recentTransactions}
              />
              <UserSavedVibes savedVibes={savedVibes} className="flex-1" />
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
