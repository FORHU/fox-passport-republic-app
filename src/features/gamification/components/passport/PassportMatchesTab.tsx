/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { formatXP } from "@/features/gamification/lib/gamification";
import {
  ClientMatchRequest,
  OutgoingMatchGroup,
  IncomingMatchRequest,
} from "@/features/gamification/api/passport";
import { useRespondToMatch } from "@/features/gamification/hooks/usePassport";

export interface PassportMatchesTabProps {
  user: any;
  isEventFoxer: boolean;
  isProvider: boolean;
  clientInboxPage: any;
  clientInboxLoading: boolean;
  clientInboxAll: ClientMatchRequest[];
  onLoadMoreClientInbox: () => void;
  outgoingGroups: OutgoingMatchGroup[];
  outgoingLoading: boolean;
  incomingRequests: IncomingMatchRequest[];
  incomingLoading: boolean;
  leaderboard: any[];
  leaderboardLoading: boolean;
}

const statusColor = (s: string) => {
  if (s === "accepted" || s === "approved") return "#22c55e";
  if (s === "declined" || s === "rejected") return "#ef4444";
  if (s === "secured") return "#ccff00";
  return "#f97316";
};

const statusLabel = (s: string) => {
  if (s === "accepted" || s === "approved") return "Approved";
  if (s === "declined" || s === "rejected") return "Declined";
  if (s === "secured") return "Secured";
  return "Pending";
};

export function PassportMatchesTab({
  user,
  isEventFoxer,
  isProvider,
  clientInboxPage,
  clientInboxLoading,
  clientInboxAll,
  onLoadMoreClientInbox,
  outgoingGroups,
  outgoingLoading,
  incomingRequests,
  incomingLoading,
  leaderboard,
  leaderboardLoading,
}: PassportMatchesTabProps) {
  const router = useRouter();
  const [matchSubTab, setMatchSubTab] = useState<
    "outgoing" | "incoming" | "client-inbox" | "ranks"
  >("client-inbox");
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const RANKS_PER_PAGE = 10;
  const respondMutation = useRespondToMatch();

  return (
    <motion.div
      key="matches"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative z-20 space-y-12"
    >
      <div className="flex justify-center overflow-x-auto no-scrollbar px-2">
        <div className="bg-white/5 p-1 rounded-full border border-white/10 flex shrink-0">
          {isEventFoxer && (
            <button
              onClick={() => setMatchSubTab("client-inbox")}
              className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                matchSubTab === "client-inbox"
                  ? "bg-[#ccff00] text-black shadow-glow-accent"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Client Inbox
              {(clientInboxPage?.total ?? 0) > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#ff00aa] text-white text-[9px] font-black">
                  {clientInboxPage!.total}
                </span>
              )}
            </button>
          )}
          {isEventFoxer && (
            <button
              onClick={() => setMatchSubTab("outgoing")}
              className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                matchSubTab === "outgoing"
                  ? "bg-[#ccff00] text-black shadow-glow-accent"
                  : "text-white/40 hover:text-white"
              }`}
            >
              My Requests
            </button>
          )}
          {isProvider && (
            <button
              onClick={() => setMatchSubTab("incoming")}
              className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                matchSubTab === "incoming"
                  ? "bg-[#ccff00] text-black shadow-glow-accent"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Incoming
            </button>
          )}
          <button
            onClick={() => setMatchSubTab("ranks")}
            className={`px-3 sm:px-8 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
              matchSubTab === "ranks"
                ? "bg-[#ccff00] text-black shadow-glow-accent"
                : "text-white/40 hover:text-white"
            }`}
          >
            Global Ranks
          </button>
        </div>
      </div>

      {/* ── Client Inbox ── */}
      {matchSubTab === "client-inbox" && (
        <div className="space-y-3">
          {clientInboxLoading && clientInboxAll.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 opacity-30">
              <span className="material-symbols-outlined text-6xl animate-pulse">
                person_search
              </span>
              <p className="text-sm text-white/60">Loading requests…</p>
            </div>
          ) : clientInboxAll.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 opacity-20 text-center">
              <span className="material-symbols-outlined text-6xl">
                person_search
              </span>
              <p className="font-display font-bold text-lg text-white">
                No client requests yet
              </p>
              <p className="text-sm text-white/50">
                When someone matches with you, their request will appear here.
              </p>
            </div>
          ) : (
            <>
              {clientInboxAll.map((req: ClientMatchRequest) => {
                const awaitingPayment =
                  req.requestStatus === "approved" &&
                  req.bookingStatus === "pending";
                const sc = awaitingPayment
                  ? "#f97316"
                  : statusColor(req.requestStatus);
                return (
                  <div
                    key={req.id}
                    role={req.bookingId ? "button" : undefined}
                    tabIndex={req.bookingId ? 0 : undefined}
                    onClick={() =>
                      req.bookingId && router.push(`/booking/${req.bookingId}`)
                    }
                    className={`group relative rounded-2xl border overflow-hidden transition-all hover:scale-[1.01] ${
                      req.bookingId ? "cursor-pointer" : ""
                    }`}
                    style={{
                      borderColor: `${sc}20`,
                      background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)`,
                    }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                      style={{ backgroundColor: sc }}
                    />
                    <div className="pl-5 pr-4 py-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
                        {req.client?.imgId ? (
                          <img
                            src={`https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${req.client.imgId}`}
                            className="h-full w-full object-cover"
                            alt=""
                          />
                        ) : (
                          (req.client?.name?.charAt(0)?.toUpperCase() ?? "?")
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm leading-tight truncate">
                          {req.client?.name}
                        </p>
                        <p className="text-[10px] text-white/40 font-medium truncate mt-0.5">
                          {req.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">
                            {req.guestCount} guests
                          </span>
                          <span className="text-white/10">·</span>
                          <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">
                            {new Date(req.startAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {req.template && (
                          <p
                            className="text-[9px] mt-1"
                            style={{ color: `${sc}99` }}
                          >
                            Based on: {req.template.name}
                          </p>
                        )}
                      </div>
                      {req.client?.id && (
                        <Link
                          href={`/messages?userId=${req.client.id}&contextType=match_request&contextId=${req.id}&contextLabel=${encodeURIComponent(req.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
                          title="Message Client"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            chat
                          </span>
                        </Link>
                      )}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {req.totalAmount > 0 && (
                          <span className="text-sm font-black text-white">
                            ₱{req.totalAmount.toLocaleString()}
                          </span>
                        )}
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                          style={{
                            color: sc,
                            backgroundColor: `${sc}18`,
                            border: `1px solid ${sc}30`,
                          }}
                        >
                          {awaitingPayment
                            ? "Awaiting Payment"
                            : statusLabel(req.requestStatus)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {clientInboxPage?.hasMore && (
                <button
                  onClick={onLoadMoreClientInbox}
                  disabled={clientInboxLoading}
                  className="w-full py-3.5 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {clientInboxLoading ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">
                        autorenew
                      </span>{" "}
                      Loading…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        expand_more
                      </span>{" "}
                      Load More
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ── My Requests (Outgoing) ── */}
      {matchSubTab === "outgoing" && (
        <div className="space-y-4">
          {outgoingLoading ? (
            <div className="flex flex-col items-center py-20 gap-3 opacity-30">
              <span className="material-symbols-outlined text-6xl animate-pulse">
                handshake
              </span>
              <p className="text-sm text-white/60">Loading requests…</p>
            </div>
          ) : outgoingGroups.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 opacity-20 text-center">
              <span className="material-symbols-outlined text-6xl">
                handshake
              </span>
              <p className="font-display font-bold text-lg text-white">
                No match requests yet
              </p>
              <p className="text-sm text-white/50">
                Match providers to your event templates to get started.
              </p>
            </div>
          ) : (
            outgoingGroups.map((group: OutgoingMatchGroup) => (
              <div
                key={group.templateId}
                className="rounded-2xl border border-white/5 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-[#ccff00]/5">
                  <span className="material-symbols-outlined text-[#ccff00] text-base">
                    event
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">
                      {group.templateName}
                    </p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">
                      {group.targetCity}
                      {group.targetState ? `, ${group.targetState}` : ""} ·{" "}
                      {group.category}
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {group.requests.map((req) => {
                    const sc = statusColor(req.matchRequestStatus);
                    return (
                      <div
                        key={req.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-white/40 overflow-hidden shrink-0">
                          {req.provider?.imgId ? (
                            <img
                              src={req.provider.imgId}
                              className="h-full w-full object-cover"
                              alt=""
                            />
                          ) : (
                            (req.provider?.name?.charAt(0)?.toUpperCase() ??
                            "?")
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {req.provider?.name ?? "Unknown"}
                          </p>
                          <p className="text-[9px] text-white/30 uppercase tracking-widest">
                            {req.item?.name} · {req.type}
                          </p>
                        </div>
                        {req.provider?.id && (
                          <Link
                            href={`/messages?userId=${req.provider.id}&contextType=match_request&contextId=${req.id}&contextLabel=${encodeURIComponent(req.item?.name ?? req.type)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 w-7 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
                            title="Message Provider"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              chat
                            </span>
                          </Link>
                        )}
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
                          style={{
                            color: sc,
                            backgroundColor: `${sc}18`,
                            border: `1px solid ${sc}30`,
                          }}
                        >
                          {statusLabel(req.matchRequestStatus)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Incoming Requests ── */}
      {matchSubTab === "incoming" && (
        <div className="space-y-3">
          {incomingLoading ? (
            <div className="flex flex-col items-center py-20 gap-3 opacity-30">
              <span className="material-symbols-outlined text-6xl animate-pulse">
                inbox
              </span>
              <p className="text-sm text-white/60">Loading requests…</p>
            </div>
          ) : incomingRequests.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3 opacity-20 text-center">
              <span className="material-symbols-outlined text-6xl">inbox</span>
              <p className="font-display font-bold text-lg text-white">
                No incoming requests
              </p>
              <p className="text-sm text-white/50">
                Event Foxers will appear here when they match your listings.
              </p>
            </div>
          ) : (
            incomingRequests.map((req: IncomingMatchRequest) => {
              const sc = statusColor(req.matchRequestStatus);
              return (
                <div
                  key={req.id}
                  className="group relative rounded-2xl border overflow-hidden transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: `${sc}20`,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: sc }}
                  />
                  <div className="pl-5 pr-4 py-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/50 overflow-hidden shrink-0">
                      {req.template.owner?.imgId ? (
                        <img
                          src={req.template.owner.imgId}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      ) : (
                        (req.template.owner?.name?.charAt(0)?.toUpperCase() ??
                        "?")
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">
                        {req.template.owner?.name}
                      </p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">
                        {req.template.name}
                      </p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">
                        {req.item?.name}
                      </p>
                    </div>
                    {req.template.owner?.id && (
                      <Link
                        href={`/messages?userId=${req.template.owner.id}&contextType=match_request&contextId=${req.id}&contextLabel=${encodeURIComponent(req.template.name)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
                        title="Message Organizer"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          chat
                        </span>
                      </Link>
                    )}
                    {req.matchRequestStatus === "pending" ? (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            respondMutation.mutate({
                              matchId: req.id,
                              type: req.type,
                              status: "accepted",
                            })
                          }
                          disabled={respondMutation.isPending}
                          className="px-3 py-1.5 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-black hover:bg-[#22c55e]/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            respondMutation.mutate({
                              matchId: req.id,
                              type: req.type,
                              status: "declined",
                            })
                          }
                          disabled={respondMutation.isPending}
                          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0"
                        style={{
                          color: sc,
                          backgroundColor: `${sc}18`,
                          border: `1px solid ${sc}30`,
                        }}
                      >
                        {statusLabel(req.matchRequestStatus)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Global Ranks ── */}
      {matchSubTab === "ranks" &&
        (() => {
          const totalPages = Math.ceil(leaderboard.length / RANKS_PER_PAGE);
          const pageItems = leaderboard.slice(
            leaderboardPage * RANKS_PER_PAGE,
            (leaderboardPage + 1) * RANKS_PER_PAGE,
          );
          const rankColors: Record<number, string> = {
            1: "#FFD700",
            2: "#C0C0C0",
            3: "#CD7F32",
          };
          return (
            <div className="space-y-3">
              {leaderboardLoading ? (
                <div className="flex flex-col items-center py-20 gap-3 opacity-30">
                  <span className="material-symbols-outlined text-6xl animate-pulse">
                    leaderboard
                  </span>
                  <p className="text-sm text-white/60">Loading leaderboard…</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {pageItems.map((entry) => {
                      const isYou = entry.userId === user?.id;
                      const isTop3 = entry.rank <= 3;
                      const rankColor =
                        rankColors[entry.rank] ??
                        (isYou ? "#ccff00" : "rgba(255,255,255,0.3)");
                      return (
                        <div
                          key={entry.userId}
                          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all"
                          style={{
                            background: isYou
                              ? "rgba(204,255,0,0.06)"
                              : isTop3
                                ? `${rankColors[entry.rank]}08`
                                : "rgba(255,255,255,0.02)",
                            borderColor: isYou
                              ? "rgba(204,255,0,0.2)"
                              : isTop3
                                ? `${rankColors[entry.rank]}20`
                                : "rgba(255,255,255,0.05)",
                          }}
                        >
                          <div className="w-8 text-center shrink-0">
                            {isTop3 ? (
                              <span
                                className="text-lg font-black"
                                style={{ color: rankColor }}
                              >
                                #{entry.rank}
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-white/30">
                                #{entry.rank}
                              </span>
                            )}
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-black text-white/40 overflow-hidden shrink-0">
                            {entry.user?.imgId ? (
                              <img
                                src={entry.user.imgId}
                                className="h-full w-full object-cover"
                                alt=""
                              />
                            ) : (
                              (entry.user?.name?.charAt(0)?.toUpperCase() ??
                              "?")
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white truncate">
                                {entry.user?.name ?? "Citizen"}
                              </p>
                              {isYou && (
                                <span className="text-[8px] font-black uppercase tracking-widest bg-[#ccff00] text-black px-1.5 py-0.5 rounded-full shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">
                              {entry.path === "user"
                                ? "Citizen"
                                : entry.path === "eventFoxer"
                                  ? "Event Foxer"
                                  : entry.path === "venueFoxer"
                                    ? "Venue Foxer"
                                    : entry.path === "gearFoxer"
                                      ? "Gear Foxer"
                                      : entry.path === "serviceFoxer"
                                        ? "Service Foxer"
                                        : entry.path}{" "}
                              · LVL {entry.level}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-mono font-bold text-[#ccff00]">
                              {formatXP(entry.totalXP)} XP
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() =>
                          setLeaderboardPage((p) => Math.max(0, p - 1))
                        }
                        disabled={leaderboardPage === 0}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-20 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          chevron_left
                        </span>{" "}
                        Prev
                      </button>
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setLeaderboardPage(i)}
                            className="h-2 rounded-full transition-all cursor-pointer"
                            style={{
                              width: leaderboardPage === i ? 20 : 8,
                              backgroundColor:
                                leaderboardPage === i
                                  ? "#ccff00"
                                  : "rgba(255,255,255,0.15)",
                            }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setLeaderboardPage((p) =>
                            Math.min(totalPages - 1, p + 1),
                          )
                        }
                        disabled={leaderboardPage === totalPages - 1}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-20 cursor-pointer"
                      >
                        Next{" "}
                        <span className="material-symbols-outlined text-base">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
    </motion.div>
  );
}
