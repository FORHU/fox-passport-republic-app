"use client";

import React from "react";
import { RewardsWalletView } from "../rewards/RewardsWalletView";

export const PassportRewardsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          Citizen <span className="text-accent">Rewards & Wallet</span>
        </h2>
        <p className="text-white/50 text-sm">
          Earn Tokens across bookings and platform milestones. Redeem Tokens for booking discounts.
        </p>
      </div>

      <RewardsWalletView />
    </div>
  );
};

