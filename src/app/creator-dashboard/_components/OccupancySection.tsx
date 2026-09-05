/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useClientMatchRequests,
  useAcceptMatch,
  useDeclineMatch,
} from "@/features/gamification/hooks/usePassport";
import type { ClientMatchRequest } from "@/features/gamification/api/passport";

export function OccupancyChart() {
  return (
    <div className="lg:col-span-8 bg-[#0f111a]/80 backdrop-blur border border-white/5 rounded-[2rem] p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-display font-bold mb-1">Occupancy</h3>
          <p className="text-xs text-white/40">Capacity usage</p>
        </div>
        <select className="bg-black/40 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5">
          <option>7 Days</option>
          <option>30 Days</option>
        </select>
      </div>
      <div
        className="flex items-center justify-center text-white/20 text-sm"
        style={{ height: "160px" }}
      >
        No occupancy data yet
      </div>
    </div>
  );
}

function statusColor(s: string) {
  if (s === "approved") return "#22c55e";
  if (s === "rejected") return "#ef4444";
  return "#f97316";
}

export function PendingRequests() {
  const router = useRouter();
  const [tab, setTab] = React.useState<"pending" | "confirmed">("pending");
  const { data: page, isLoading } = useClientMatchRequests(0, true);
  const acceptMutation = useAcceptMatch();
  const declineMutation = useDeclineMatch();
  const requests: ClientMatchRequest[] = page?.data ?? [];
  const pendingAll = requests.filter((r) => r.requestStatus === "pending");
  const confirmedAll = requests.filter(
    (r) => r.requestStatus === "approved" || r.requestStatus === "accepted",
  );
  const visible = (tab === "pending" ? pendingAll : confirmedAll).slice(0, 4);
  const totalPending = pendingAll.length;

  return (
    <div className="lg:col-span-4 bg-[#0f111a]/80 backdrop-blur border border-white/5 rounded-[2rem] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setTab("pending")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${tab === "pending" ? "bg-[#ccff00] text-black" : "text-white/40 hover:text-white"}`}
          >
            Pending
            {totalPending > 0 && (
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#ff00aa] text-white text-[9px] font-black">
                {totalPending}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("confirmed")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${tab === "confirmed" ? "bg-[#ccff00] text-black" : "text-white/40 hover:text-white"}`}
          >
            Confirmed
          </button>
        </div>
        <button className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black">
          <span className="material-symbols-outlined text-[14px]">
            more_horiz
          </span>
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-white/20 text-xs">
            Loading…
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined text-3xl text-white/10 mb-2">
              inbox
            </span>
            <p className="text-xs text-white/20">
              {tab === "pending"
                ? "No pending requests"
                : "No confirmed bookings yet"}
            </p>
          </div>
        ) : (
          visible.map((req) => {
            const isActing =
              acceptMutation.isPending || declineMutation.isPending;
            return (
              <div
                key={req.id}
                role={req.bookingId ? "button" : undefined}
                tabIndex={req.bookingId ? 0 : undefined}
                onClick={() =>
                  req.bookingId && router.push(`/booking/${req.bookingId}`)
                }
                className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors ${req.bookingId ? "cursor-pointer" : ""}`}
              >
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/40 shrink-0 overflow-hidden">
                  {req.client?.imgId ? (
                    <img
                      src={`https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${req.client.imgId}`}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    (req.client?.name?.charAt(0) ?? "?")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {req.client?.name}
                  </p>
                  <p className="text-[10px] text-white/40 truncate">
                    {req.guestCount} guests ·{" "}
                    {new Date(req.startAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {req.template && (
                    <p className="text-[10px] text-[#ccff00]/60 truncate">
                      {req.template.name}
                    </p>
                  )}
                </div>
                {tab === "pending" ? (
                  <div className="flex gap-1 shrink-0">
                    <button
                      disabled={isActing}
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptMutation.mutate(req.id);
                      }}
                      title="Accept"
                      className="h-7 w-7 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        check
                      </span>
                    </button>
                    <button
                      disabled={isActing}
                      onClick={(e) => {
                        e.stopPropagation();
                        declineMutation.mutate(req.id);
                      }}
                      title="Decline"
                      className="h-7 w-7 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </div>
                ) : req.bookingStatus === "pending" ? (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-orange-400 bg-orange-500/10 border border-orange-500/30 shrink-0 text-center">
                    Awaiting Payment
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 shrink-0">
                    Approved
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/user/passport"
        className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest text-center block"
      >
        View All
      </Link>
    </div>
  );
}
