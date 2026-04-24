'use client';

import React from 'react';
import { useUserDashboard } from '@/hooks/dashboards/useUserDashboard';
import { UserHeader } from '@/components/citizen/UserHeader';
import { UserWelcome } from '@/components/citizen/UserWelcome';
import { UserNextUp } from '@/components/citizen/UserNextUp';
import { UserForYou } from '@/components/citizen/UserForYou';
import { UserJourney } from '@/components/citizen/UserJourney';
import { UserWallet } from '@/components/citizen/UserWallet';
import { UserSavedVibes } from '@/components/citizen/UserSavedVibes';
import { UserFooter } from '@/components/citizen/UserFooter';

interface UserDashboardClientProps {
  user: any;
  dashboardData: any;
}

function UserDashboardContent({ user, dashboardData }: UserDashboardClientProps) {
  const {
    userName,
    isAuthenticated,
    walletBalance,
    recentTransactions,
    savedVibes,
    navigateToPassport
  } = useUserDashboard();

  // Use server data if client doesn't have
  const displayUserName = userName || user?.name || 'User';
  const displayDashboardData = dashboardData;

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <UserHeader
        isAuthenticated={isAuthenticated}
        userName={displayUserName}
        citizenLevel={displayDashboardData.citizenLevel}
      />

      <main className="flex-grow pt-36 px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <UserWelcome
            upcomingEventsCount={displayDashboardData.upcomingEvents}
            recommendationsCount={displayDashboardData.recommendations}
            weather={displayDashboardData.weather}
          />

          {/* Row 1: Next Up & Journey */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-8 flex flex-col">
              <UserNextUp className="flex-1" />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <UserJourney
                userName={displayUserName}
                navigateToPassport={navigateToPassport}
                className="flex-1"
              />
            </div>
          </div>

          {/* Row 2: For You & Wallet/Saved Vibes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <UserForYou />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
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
    </div>
  );
}

export default function UserDashboardClient({ user, dashboardData }: UserDashboardClientProps) {
  return <UserDashboardContent user={user} dashboardData={dashboardData} />;
}