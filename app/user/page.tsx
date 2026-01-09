"use client";

import React from 'react';
import { useUserDashboard } from '@/hooks/dashboards/useUserDashboard';
import RequireAuth from '@/components/authentication/RequireAuth';
import { UserHeader } from '@/components/citizen/UserHeader';
import { UserWelcome } from '@/components/citizen/UserWelcome';
import { UserNextUp } from '@/components/citizen/UserNextUp';
import { UserForYou } from '@/components/citizen/UserForYou';
import { UserJourney } from '@/components/citizen/UserJourney';
import { UserWallet } from '@/components/citizen/UserWallet';
import { UserQuickLinks } from '@/components/citizen/UserQuickLinks';
import { UserSavedVibes } from '@/components/citizen/UserSavedVibes';
import { UserFooter } from '@/components/citizen/UserFooter';

function UserDashboardContent() {
  const {
    userName,
    isAuthenticated,
    dashboardData,
    walletBalance,
    recentTransactions,
    savedVibes,
    navigateToPassport
  } = useUserDashboard();

  return (
    <div className="bg-background bg-gradient-dark text-text-main antialiased min-h-screen flex flex-col selection:bg-accent selection:text-black font-body">
      <UserHeader 
        isAuthenticated={isAuthenticated} 
        userName={userName} 
        citizenLevel={dashboardData.citizenLevel} 
      />

      <main className="flex-grow pt-36 px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <UserWelcome 
            upcomingEventsCount={dashboardData.upcomingEvents}
            recommendationsCount={dashboardData.recommendations}
            weather={dashboardData.weather}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-12">
              <UserNextUp />
              <UserForYou />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <UserJourney 
                userName={userName} 
                navigateToPassport={navigateToPassport} 
              />
              <UserWallet 
                walletBalance={walletBalance} 
                recentTransactions={recentTransactions} 
              />
              <UserQuickLinks />
              <UserSavedVibes savedVibes={savedVibes} />
            </div>
          </div>
        </div>
      </main>

      <UserFooter />
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <RequireAuth>
      <UserDashboardContent />
    </RequireAuth>
  );
}
