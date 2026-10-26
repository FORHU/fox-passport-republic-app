"use client";

import React from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/lib/currency";
import { SectionHeader } from "./SectionHeader";

interface Transaction {
  type: "purchase" | "topup";
  amount: number;
  description?: string;
  label: string;
}

interface UserWalletProps {
  walletBalance: number;
  recentTransactions: Transaction[];
}

function SoonTag() {
  return (
    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
      Soon
    </span>
  );
}

export const UserWallet: React.FC<UserWalletProps> = ({
  walletBalance,
  recentTransactions,
}) => {
  return (
    <section aria-labelledby="wallet-title" className="reveal-on-scroll">
      <SectionHeader
        id="wallet-title"
        title="Fox Wallet"
        icon="account_balance_wallet"
      />

      <div className="glass-panel rounded-3xl p-5">
        <p className="text-xs text-text-muted">Balance</p>
        <p className="mt-1 text-3xl font-display font-bold text-white tracking-tight tabular-nums">
          {formatCurrency(walletBalance)}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={() =>
              toast.info("Top Up coming soon!", {
                description:
                  "Wallet funding will be available in the next release.",
              })
            }
            className="bg-white/10 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              add
            </span>
            Top Up
            <SoonTag />
          </button>
          <button
            type="button"
            onClick={() =>
              toast.info("Send coming soon!", {
                description:
                  "Peer-to-peer transfers will be available in the next release.",
              })
            }
            className="bg-white/10 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              send
            </span>
            Send
            <SoonTag />
          </button>
        </div>

        {recentTransactions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <h3 className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">
              Recent activity
            </h3>
            <ul>
              {recentTransactions.map((tx, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full ${tx.type === "purchase" ? "bg-secondary/20" : "bg-accent/20"} flex items-center justify-center`}
                    >
                      <span
                        className={`material-symbols-outlined ${tx.type === "purchase" ? "text-secondary" : "text-accent"} text-xs`}
                        aria-hidden="true"
                      >
                        {tx.type === "purchase" ? "local_activity" : "add"}
                      </span>
                    </div>
                    <div className="text-sm text-white">{tx.label}</div>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums ${tx.amount > 0 ? "text-accent" : "text-white"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {formatCurrency(Math.abs(tx.amount))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
