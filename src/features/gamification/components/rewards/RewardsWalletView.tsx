"use client";

import React, { useState } from "react";
import { useRewardsWallet } from "@/features/gamification/hooks/useRewards";
import { RewardsStoreModal } from "./RewardsStoreModal";
import type { WalletHistoryItem } from "@/shared/api/rewards";

export const RewardsWalletView: React.FC = () => {
  const { data: wallet, isLoading, isError } = useRewardsWallet();
  const [storeOpen, setStoreOpen] = useState(false);
  const [filter, setFilter] = useState<
    "ALL" | "EARNED" | "REDEMPTION" | "REVERSED"
  >("ALL");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <span className="h-8 w-8 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
      </div>
    );
  }

  if (isError || !wallet) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center text-white/50">
        <span className="material-symbols-outlined text-4xl text-amber-400 mb-2">
          warning
        </span>
        <p className="text-white font-bold mb-1">
          Failed to load rewards wallet
        </p>
        <p className="text-xs text-white/40">
          Please try again or reconnect to your account.
        </p>
      </div>
    );
  }

  const spendableCoins = wallet.coins;
  const pendingCoins = wallet.pendingCoins;
  const totalEarned = wallet.totalEarnedCoins;
  const phpEquivalent = (spendableCoins / 5).toFixed(2);

  const filteredHistory = wallet.history.filter((item: WalletHistoryItem) => {
    if (filter === "ALL") return true;
    return item.type === filter;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "EARNED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            EARNED
          </span>
        );
      case "REDEMPTION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400">
            REDEEMED
          </span>
        );
      case "REVERSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
            REVERSED
          </span>
        );
      case "RETURNED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            TOKENS RETURNED
          </span>
        );
      case "RELEASED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
            RELEASED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/60">
            {type}
          </span>
        );
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-8">
      {/* Wallet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spendable Tokens Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/20 transition-all duration-500" />
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
            <span>Spendable Balance</span>
            <span className="material-symbols-outlined text-accent text-xl">
              monetization_on
            </span>
          </div>
          <div className="text-4xl font-display font-bold text-white mb-1">
            {spendableCoins.toLocaleString()}
            <span className="text-sm font-sans font-normal text-white/40 ml-2">
              Tokens
            </span>
          </div>
          <div className="text-xs text-white/50 font-mono">
            ≈ ₱{phpEquivalent} in booking discounts
          </div>
          <button
            onClick={() => setStoreOpen(true)}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-accent text-black font-bold text-xs hover:bg-accent/90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/10"
          >
            <span className="material-symbols-outlined text-[16px]">
              storefront
            </span>
            Rewards Catalogue
          </button>
        </div>

        {/* Pending Tokens Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
            <span>Pending Escrow</span>
            <span className="material-symbols-outlined text-amber-400 text-xl">
              schedule
            </span>
          </div>
          <div className="text-4xl font-display font-bold text-white mb-1">
            {pendingCoins.toLocaleString()}
            <span className="text-sm font-sans font-normal text-white/40 ml-2">
              Tokens
            </span>
          </div>
          <div className="text-xs text-white/50">
            Releases automatically upon booking completion
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/40">
            Lifetime Earned:{" "}
            <span className="text-white font-mono font-bold">
              {totalEarned.toLocaleString()} Tokens
            </span>
          </div>
        </div>

        {/* How Tokens Work Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
            <span>How Tokens Work</span>
            <span className="material-symbols-outlined text-accent text-xl">
              info
            </span>
          </div>
          <div className="text-2xl font-display font-bold text-white mb-1">
            5 Tokens = ₱1
          </div>
          <div className="text-xs text-white/50 mb-3">
            Off a booking. Tokens never expire.
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
            <span>Redemption Cap:</span>
            <span className="text-white font-mono">50% Platform Fee</span>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-2xl">
                receipt_long
              </span>
              Coin Ledger History
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Append-only audit ledger of every coin earned, released, spent, or
              reversed.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
            {(["ALL", "EARNED", "REDEMPTION", "REVERSED"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === t
                    ? "bg-white/15 text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {t === "ALL"
                  ? "All"
                  : t === "REDEMPTION"
                    ? "Redemptions"
                    : formatAction(t)}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-white/40">
            <span className="material-symbols-outlined text-3xl mb-2 block text-white/20">
              history
            </span>
            <p className="text-sm">No transaction events recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {filteredHistory.map((item: WalletHistoryItem) => {
              const isPositive = item.coins > 0;
              const isNegative = item.coins < 0;

              return (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {item.type === "EARNED" ? (
                        <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                          arrow_downward
                        </span>
                      ) : item.type === "REDEMPTION" ? (
                        <span className="material-symbols-outlined text-purple-400 text-[18px]">
                          shopping_bag
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-rose-400 text-[18px]">
                          undo
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">
                          {formatAction(item.action)}
                        </span>
                        {getTypeBadge(item.type)}
                      </div>
                      <span className="text-[11px] text-white/40 font-mono">
                        {new Date(item.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono text-sm font-bold ${
                        isPositive
                          ? "text-emerald-400"
                          : isNegative
                            ? "text-rose-400"
                            : "text-white/60"
                      }`}
                    >
                      {isPositive ? `+${item.coins}` : item.coins} Tokens
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rewards Store Modal */}
      <RewardsStoreModal
        isOpen={storeOpen}
        onClose={() => setStoreOpen(false)}
        userCoins={spendableCoins}
      />
    </div>
  );
};
