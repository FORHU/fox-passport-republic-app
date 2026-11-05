"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check, Ticket, Sparkles } from "lucide-react";
import {
  useRewardsCatalog,
  useRedeemRewardMutation,
} from "@/features/gamification/hooks/useRewards";
import type { RewardCatalogItem, RedeemRewardResult } from "@/shared/api/rewards";

interface RewardsStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  userLevel: number;
}

export const RewardsStoreModal: React.FC<RewardsStoreModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  userLevel,
}) => {
  const { data: catalog = [], isLoading } = useRewardsCatalog("citizen");
  const { mutate: redeem, isPending: isRedeeming } = useRedeemRewardMutation();

  const [confirmReward, setConfirmReward] = useState<RewardCatalogItem | null>(
    null,
  );
  const [successResult, setSuccessResult] = useState<RedeemRewardResult | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRedeem = (reward: RewardCatalogItem) => {
    redeem(reward.id, {
      onSuccess: (data) => {
        setConfirmReward(null);
        setSuccessResult(data);
      },
    });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto text-white z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-accent text-3xl">
                storefront
              </span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  Citizen Rewards Store
                </h2>
                <p className="text-white/50 text-xs sm:text-sm">
                  Redeem your earned Coins for single-use booking discount vouchers and perks.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-xl">
                  monetization_on
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">Your Balance:</span>
                <span className="text-base sm:text-lg font-mono font-bold text-accent">
                  {userCoins.toLocaleString()} Coins
                </span>
                <span className="text-xs text-white/40">
                  (≈ ₱{(userCoins / 5).toFixed(2)})
                </span>
              </div>
              <div className="text-xs font-mono text-white/50">
                Current Level: <span className="text-white font-bold">Lvl {userLevel}</span>
              </div>
            </div>
          </div>

          {/* Catalog Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-white/40">
              <span className="h-6 w-6 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
            </div>
          ) : catalog.length === 0 ? (
            <div className="py-16 text-center text-white/40">
              <p>No rewards currently available in the catalogue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalog.map((item) => {
                const canAfford = item.canAfford ?? userCoins >= item.coinCost;
                const levelQualified =
                  item.levelQualified ?? userLevel >= item.minLevel;
                const canRedeem = canAfford && levelQualified;
                const minSubtotal =
                  item.minSubtotal ??
                  (item.discountPhp ? Math.ceil(Number(item.discountPhp) * 40) : 0);

                return (
                  <div
                    key={item.id}
                    className="relative bg-white/5 hover:bg-white/8 transition-all rounded-2xl p-5 border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          {item.rewardType === "booking_voucher" ? (
                            <Ticket className="text-accent shrink-0" size={18} />
                          ) : (
                            <Sparkles className="text-purple-400 shrink-0" size={18} />
                          )}
                          {item.title}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-accent/10 border border-accent/20 text-accent shrink-0">
                          {item.coinCost} Coins
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-white/60 mb-4">
                        {item.description}
                      </p>

                      {minSubtotal > 0 && (
                        <div className="bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs text-white/50 mb-4 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-white/40">
                            info
                          </span>
                          <span>Min booking subtotal: ₱{minSubtotal.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <div className="text-xs">
                        {!levelQualified ? (
                          <span className="text-amber-400/90 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              lock
                            </span>
                            Unlocks at Lvl {item.minLevel}
                          </span>
                        ) : !canAfford ? (
                          <span className="text-white/40">
                            Need {(item.coinCost - userCoins).toLocaleString()} more Coins
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              check_circle
                            </span>
                            Eligible
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setConfirmReward(item)}
                        disabled={!canRedeem}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          canRedeem
                            ? "bg-accent text-black hover:bg-accent/90 active:scale-95 shadow-md shadow-accent/20"
                            : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmReward && (
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmReward(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl z-20 text-white"
              >
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  Confirm Reward Redemption
                </h3>
                <p className="text-white/60 text-sm">
                  Spend{" "}
                  <span className="text-accent font-bold">
                    {confirmReward.coinCost} Coins
                  </span>{" "}
                  for{" "}
                  <span className="text-white font-bold">
                    {confirmReward.title}
                  </span>
                  ?
                </p>

                <div className="my-4 p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-white/50 space-y-1">
                  <p>• Coins will be deducted immediately from your wallet.</p>
                  <p>• Single-use voucher will be valid for 30 days.</p>
                  <p>• Vouchers are tied exclusively to your account.</p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setConfirmReward(null)}
                    disabled={isRedeeming}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRedeem(confirmReward)}
                    disabled={isRedeeming}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-black hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isRedeeming ? (
                      <>
                        <span className="h-3 w-3 rounded-full border-2 border-black/40 border-t-black animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      "Confirm & Deduct"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {successResult && (
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSuccessResult(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl z-20 text-white text-center"
              >
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                  <Check size={28} />
                </div>

                <h3 className="text-2xl font-display font-bold text-white mb-1">
                  Voucher Generated!
                </h3>
                <p className="text-white/60 text-xs sm:text-sm mb-6">
                  Your single-use voucher is ready and linked to your citizen profile.
                </p>

                <div className="bg-black/50 border border-accent/30 rounded-2xl p-5 mb-6 text-center relative overflow-hidden">
                  <span className="text-xs uppercase font-mono tracking-widest text-white/40 block mb-1">
                    Your Voucher Code
                  </span>
                  <div className="text-2xl font-mono font-bold text-accent tracking-wider my-2">
                    {successResult.voucher.code}
                  </div>
                  <p className="text-xs text-white/50">
                    Valid until:{" "}
                    {new Date(successResult.voucher.expiresAt).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() => handleCopy(successResult.voucher.code)}
                    className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-2 mx-auto transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCode ? "Copied!" : "Copy Code"}
                  </button>
                </div>

                <button
                  onClick={() => setSuccessResult(null)}
                  className="w-full py-3 rounded-xl bg-accent text-black font-bold text-xs hover:bg-accent/90 transition-all cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
