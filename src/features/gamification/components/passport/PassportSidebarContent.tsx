/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatXP } from "@/features/gamification/lib/gamification";
import { UserPath } from "@/features/gamification/types/gamification";
import {
  PATH_SHORT,
  PATH_COLORS,
  PATH_PERKS,
  PERK_META,
} from "@/features/gamification/data/passportData";

export interface PassportSidebarContentProps {
  user: any;
  userName: string;
  userInitials: string;
  activePathTypes: UserPath[];
  totalXP: number;
  maxTotalXP: number;
  expandedPath: string | null;
  setExpandedPath: (p: string | null) => void;
  perkTab: "unlocked" | "locked";
  setPerkTab: (t: "unlocked" | "locked") => void;
  activeTab: "progress" | "stamps" | "matches";
  setActiveTab: (t: "progress" | "stamps" | "matches") => void;
  earnedPerkKeys: string[];
  onTabSelect: () => void;
}

export const PassportSidebarContent: React.FC<PassportSidebarContentProps> = ({
  user,
  userName,
  userInitials,
  activePathTypes,
  totalXP,
  maxTotalXP,
  expandedPath,
  setExpandedPath,
  perkTab,
  setPerkTab,
  activeTab,
  setActiveTab,
  earnedPerkKeys,
  onTabSelect,
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="h-10 w-10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/foxonlylogo.png"
              alt="FoxPassport Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="relative">
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-[#ccff00] transition-colors">
              FoxPassport
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#ccff00] group-hover:w-full transition-all duration-300"></span>
          </div>
        </Link>
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          title="Back"
          className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
        </button>
      </div>

      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-4">
          <div className="h-20 w-20 rounded-[1.5rem] bg-white/5 border border-white/10 p-2 group transition-all duration-500 hover:border-[#ccff00]/30">
            <div className="h-full w-full rounded-xl bg-white/10 flex items-center justify-center text-3xl font-display font-bold text-white/20 overflow-hidden relative">
              {user?.imgId ? (
                <img
                  src={user.imgId}
                  className="h-full w-full object-cover"
                  alt=""
                />
              ) : (
                userInitials
              )}
            </div>
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 bg-[#ccff00] rounded-full border-[3px] border-black flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-black text-[14px] font-bold">
              verified
            </span>
          </div>
        </div>

        <h2 className="text-xl font-display font-bold text-white mb-1 tracking-tight">
          {userName}
        </h2>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">
          {activePathTypes
            .filter((p) => p !== "user")
            .map((p) =>
              p === "eventFoxer"
                ? "Event Foxer"
                : p === "gearFoxer"
                  ? "Gear Foxer"
                  : p === "serviceFoxer"
                    ? "Service Foxer"
                    : p === "venueFoxer"
                      ? "Venue Foxer"
                      : p === "investor"
                        ? "Investor"
                        : p,
            )
            .join(" · ") || "Citizen"}
        </p>
      </div>

      <div className="space-y-5 grow">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <span>Mastery XP</span>
            <span className="text-[#ccff00] font-mono">
              {formatXP(totalXP)}
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#22c55e] to-[#ccff00] transition-all duration-1000 shadow-[0_0_10px_#ccff0044]"
              style={{
                width: `${Math.min(100, (totalXP / maxTotalXP) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {(() => {
          const pathPerkData = activePathTypes.map((path) => {
            const perks = (PATH_PERKS[path] ?? [])
              .map(({ level, perk }) => ({
                perk,
                level,
                earned: earnedPerkKeys.includes(perk),
                meta: PERK_META[perk],
                color: PATH_COLORS[path] ?? "#ccff00",
              }))
              .filter((p) => p.meta);
            return {
              path,
              label: PATH_SHORT[path] ?? path,
              color: PATH_COLORS[path] ?? "#ccff00",
              unlocked: perks.filter((p) => p.earned),
              locked: perks.filter((p) => !p.earned),
              total: perks.length,
            };
          });
          const totalEarned = pathPerkData.reduce(
            (s, p) => s + p.unlocked.length,
            0,
          );
          const totalAll = pathPerkData.reduce((s, p) => s + p.total, 0);

          return (
            <div className="rounded-2xl bg-white/2 border border-white/5 overflow-hidden">
              <div className="px-3.5 pt-3 pb-2.5 flex items-center justify-between border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">
                  Perks
                </p>
                <span className="text-[9px] font-mono font-bold text-[#ccff00]">
                  {totalEarned}
                  <span className="text-white/20">/{totalAll}</span>
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {pathPerkData.map(
                  ({ path, label, color, unlocked, locked, total }) => {
                    const isOpen = expandedPath === path;
                    const display = perkTab === "unlocked" ? unlocked : locked;
                    return (
                      <div key={path}>
                        <button
                          onClick={() => {
                            setExpandedPath(isOpen ? null : path);
                            setPerkTab("unlocked");
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-white/3 transition-all cursor-pointer"
                        >
                          <div
                            className="h-5 w-5 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${color}18` }}
                          >
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-white/60 flex-1 text-left">
                            {label} Perks
                          </span>
                          <span className="text-[8px] font-mono text-white/20 mr-1">
                            {unlocked.length}/{total}
                          </span>
                          <span
                            className={`material-symbols-outlined text-[14px] text-white/20 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          >
                            expand_more
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-3 pb-3">
                            <div className="flex gap-1 mb-2.5 bg-white/3 rounded-xl p-0.5">
                              <button
                                onClick={() => setPerkTab("unlocked")}
                                className="flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                style={
                                  perkTab === "unlocked"
                                    ? { backgroundColor: color, color: "#000" }
                                    : { color: "rgba(255,255,255,0.3)" }
                                }
                              >
                                Active
                                {unlocked.length > 0
                                  ? ` (${unlocked.length})`
                                  : ""}
                              </button>
                              <button
                                onClick={() => setPerkTab("locked")}
                                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer ${perkTab === "locked" ? "bg-white/10 text-white" : "text-white/30"}`}
                              >
                                Locked
                                {locked.length > 0 ? ` (${locked.length})` : ""}
                              </button>
                            </div>

                            <div className="space-y-0.5">
                              {display.length === 0 ? (
                                <p className="text-center text-[8px] text-white/20 py-3">
                                  {perkTab === "unlocked"
                                    ? "No perks unlocked yet — keep leveling up!"
                                    : "All perks for this path unlocked!"}
                                </p>
                              ) : perkTab === "unlocked" ? (
                                display.map(({ perk, meta, color: c }) => (
                                  <div
                                    key={perk}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
                                    style={{ backgroundColor: `${c}08` }}
                                  >
                                    <div
                                      className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: `${c}18` }}
                                    >
                                      <span
                                        className="material-symbols-outlined text-[13px]"
                                        style={{ color: c }}
                                      >
                                        {meta!.icon}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-bold text-white leading-tight">
                                        {meta!.title}
                                      </p>
                                      <p className="text-[8px] text-white/30 leading-none mt-0.5 truncate">
                                        {meta!.desc}
                                      </p>
                                    </div>
                                    <span
                                      className="material-symbols-outlined text-[12px] shrink-0"
                                      style={{ color: c }}
                                    >
                                      check_circle
                                    </span>
                                  </div>
                                ))
                              ) : (
                                display.map(({ perk, level, meta }) => (
                                  <div
                                    key={perk}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
                                  >
                                    <div className="relative h-6 w-6 rounded-md bg-white/4 border border-white/5 flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-[13px] text-white/15">
                                        {meta!.icon}
                                      </span>
                                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#111] rounded-full border border-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[7px] text-white/25">
                                          lock
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-white/25 leading-tight flex-1">
                                      {meta!.title}
                                    </p>
                                    <span className="text-[7px] font-black text-white/20 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-full shrink-0">
                                      LVL {level}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-2">
        <button
          onClick={() => {
            setActiveTab("matches");
            onTabSelect();
          }}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "matches" ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"}`}
        >
          <span className="material-symbols-outlined text-[16px]">
            handshake
          </span>{" "}
          Match Status
        </button>
        <button
          onClick={() => {
            setActiveTab("progress");
            onTabSelect();
          }}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "progress" ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"}`}
        >
          <span className="material-symbols-outlined text-[16px]">
            analytics
          </span>{" "}
          Mastery
        </button>
        <button
          onClick={() => {
            setActiveTab("stamps");
            onTabSelect();
          }}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "stamps" ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"}`}
        >
          <span className="material-symbols-outlined text-[16px]">
            menu_book
          </span>{" "}
          Passport
        </button>
      </div>
    </>
  );
};
