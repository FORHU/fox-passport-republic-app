/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchPublicCitizenProfile,
  PublicCitizenProfile,
  CitizenStamp,
  CitizenBadge,
} from "@/shared/api/citizen";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { isPartnerUser } from "@/shared/auth/roles";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop";

function getAvatarUrl(imgId?: string | null): string {
  if (!imgId) return FALLBACK_AVATAR;
  if (imgId.startsWith("http://") || imgId.startsWith("https://")) return imgId;
  return `https://fox-passport-republic-assets.s3.ap-southeast-1.amazonaws.com/${imgId}`;
}

const RARITY_COLORS: Record<
  string,
  { badge: string; text: string; border: string }
> = {
  legendary: {
    badge: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
    text: "text-amber-300",
    border: "border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]",
  },
  epic: {
    badge: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  },
  rare: {
    badge: "bg-sky-500/20",
    text: "text-sky-300",
    border: "border-sky-400/50",
  },
  common: {
    badge: "bg-zinc-800",
    text: "text-zinc-300",
    border: "border-zinc-700",
  },
};

type ProfileTab = "stamps" | "badges" | "activity" | "offerings";

export default function PublicCitizenProfileView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>("stamps");

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<PublicCitizenProfile>({
    queryKey: ["publicCitizenProfile", id],
    queryFn: () => fetchPublicCitizenProfile(id),
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 w-32 bg-zinc-800 rounded-lg" />
          <div className="h-64 bg-zinc-900/80 rounded-3xl border border-zinc-800" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-zinc-900 rounded-2xl" />
            <div className="h-20 bg-zinc-900 rounded-2xl" />
            <div className="h-20 bg-zinc-900 rounded-2xl" />
          </div>
          <div className="h-80 bg-zinc-900/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <span className="material-symbols-outlined text-3xl">person_off</span>
        </div>
        <h1 className="text-xl font-bold mb-2">Citizen Profile Not Found</h1>
        <p className="text-zinc-400 text-sm max-w-md mb-6">
          This citizen may not exist, has changed their handle, or their
          passport is private.
        </p>
        <button
          onClick={() => router.push("/republic")}
          className="px-5 py-2.5 rounded-xl bg-lime-400 text-black font-black text-sm hover:bg-lime-300 transition-colors"
        >
          Return to Republic Feed
        </button>
      </div>
    );
  }

  const isPartner = isPartnerUser(profile);
  const citizenPath = profile.passport?.paths?.find((p) => p.path === "user");
  const citizenLevel = citizenPath?.level ?? 1;
  const currentXP = citizenPath?.currentXP ?? 0;
  const nextLevelXP = citizenLevel * 200;
  const xpPercentage = Math.min(
    100,
    Math.round((currentXP / nextLevelXP) * 100),
  );

  const stamps = profile.passport?.stamps ?? [];
  const badges = profile.passport?.userBadges ?? [];
  const posts = profile.posts ?? [];
  const hasOfferings =
    (profile.venues?.length ?? 0) > 0 ||
    (profile.assets?.length ?? 0) > 0 ||
    (profile.services?.length ?? 0) > 0;

  const isMe = currentUser?.id === profile.id;

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-20 pb-28 px-4 sm:px-6 selection:bg-lime-400 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Back
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">share</span>
            Share Profile
          </button>
        </div>

        {/* ── CITIZEN PASSPORT HERO CARD ──────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border backdrop-blur-xl ${
            isPartner
              ? "bg-gradient-to-br from-amber-950/20 via-zinc-950 to-zinc-900/80 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.08)]"
              : "bg-zinc-950/80 border-zinc-800/80 shadow-2xl"
          }`}
        >
          {/* Subtle Republic background seal */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-radial from-white/[0.03] to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            {/* Citizen Avatar with Level Badge */}
            <div className="relative shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden p-1 ${
                  isPartner
                    ? "bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                    : "bg-gradient-to-b from-lime-400 to-emerald-600 shadow-[0_0_20px_rgba(163,230,53,0.2)]"
                }`}
              >
                <img
                  src={getAvatarUrl(profile.imgId)}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-[22px]"
                />
              </div>
              <div
                className={`absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl text-xs font-black border shadow-lg ${
                  isPartner
                    ? "bg-amber-400 text-black border-amber-300"
                    : "bg-zinc-950 text-lime-400 border-lime-400/40"
                }`}
              >
                Level {citizenLevel}
              </div>
            </div>

            {/* Profile Info & Roles */}
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {profile.name}
                </h1>
                {isPartner && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-500/40 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">
                      verified
                    </span>
                    Partner Foxer
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                {profile.username && (
                  <span className="font-semibold text-zinc-300">
                    @{profile.username}
                  </span>
                )}
                {(profile.city || profile.country) && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <span className="material-symbols-outlined text-[14px]">
                      location_on
                    </span>
                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-1 text-zinc-400">
                  <span className="material-symbols-outlined text-[14px]">
                    calendar_today
                  </span>
                  Citizen since {new Date(profile.createdAt).getFullYear()}
                </span>
              </div>

              {/* Role Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.roleType?.map((r) => {
                  const isInv = r === "investor";
                  return (
                    <span
                      key={r}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                        isInv
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-zinc-900 text-zinc-300 border-zinc-800"
                      }`}
                    >
                      {isInv ? "Partner Foxer" : r.replace("Foxer", " Foxer")}
                    </span>
                  );
                })}
                {profile.foxerSpecializations?.map((spec) => (
                  <span
                    key={spec.id}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-white/70"
                  >
                    {spec.category.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              {!isMe && (
                <Link
                  href={`/messages?userId=${profile.id}&contextType=profile&contextId=${profile.id}&contextLabel=${encodeURIComponent(profile.name)}`}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    chat
                  </span>
                  <span>Message Citizen</span>
                </Link>
              )}
              {isMe && (
                <Link
                  href="/user"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    manage_accounts
                  </span>
                  My Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400 font-medium">
                Republic Citizenship Progression
              </span>
              <span className="text-lime-400 font-bold">
                {currentXP} / {nextLevelXP} XP ({xpPercentage}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── STATS COUNTER BAR ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-lime-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[16px]">
                military_tech
              </span>
              Level
            </div>
            <div className="text-2xl font-black text-white">
              L{citizenLevel}
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[16px]">
                verified
              </span>
              Venue Stamps
            </div>
            <div className="text-2xl font-black text-white">
              {stamps.length}
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[16px]">
                award_star
              </span>
              Badges
            </div>
            <div className="text-2xl font-black text-white">
              {badges.length}
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[16px]">
                forum
              </span>
              Feed Posts
            </div>
            <div className="text-2xl font-black text-white">
              {profile._count?.posts ?? posts.length}
            </div>
          </div>
        </div>

        {/* ── INTERACTIVE TABS HEADER ────────────────────────────────── */}
        <div className="flex border-b border-zinc-800/80 gap-6 overflow-x-auto scrollbar-none text-sm font-bold">
          <button
            onClick={() => setActiveTab("stamps")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "stamps"
                ? "text-lime-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              verified
            </span>
            Venue Stamps ({stamps.length})
            {activeTab === "stamps" && (
              <motion.div
                layoutId="activeCitizenTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "badges"
                ? "text-lime-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              military_tech
            </span>
            Milestone Badges ({badges.length})
            {activeTab === "badges" && (
              <motion.div
                layoutId="activeCitizenTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "activity"
                ? "text-lime-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              dynamic_feed
            </span>
            Republic Activity ({posts.length})
            {activeTab === "activity" && (
              <motion.div
                layoutId="activeCitizenTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400"
              />
            )}
          </button>

          {hasOfferings && (
            <button
              onClick={() => setActiveTab("offerings")}
              className={`pb-3 flex items-center gap-2 transition-colors relative ${
                activeTab === "offerings"
                  ? "text-lime-400"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Offerings
              {activeTab === "offerings" && (
                <motion.div
                  layoutId="activeCitizenTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400"
                />
              )}
            </button>
          )}
        </div>

        {/* ── TAB CONTENT PANELS ─────────────────────────────────────── */}
        <div>
          {/* TAB 1: VENUE STAMPS */}
          {activeTab === "stamps" && (
            <div className="space-y-4">
              {stamps.length === 0 ? (
                <div className="rounded-3xl bg-zinc-950/40 border border-zinc-800/80 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-3">
                    <span className="material-symbols-outlined text-3xl">
                      verified
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    No Venue Stamps Yet
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Attending events at verified Republic partner venues unlocks
                    authentic collectible passport stamps.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {stamps.map((stamp: CitizenStamp) => {
                    const stampSeal =
                      stamp.venue?.stampIconUrl ||
                      stamp.imageUrl ||
                      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=200&auto=format&fit=crop";

                    return (
                      <div
                        key={stamp.id}
                        className="group relative rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-amber-500/50 p-4 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {/* Circular Stamp Seal */}
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/60 p-0.5 bg-zinc-900 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                            <img
                              src={stampSeal}
                              alt={stamp.venue?.name ?? stamp.eventName}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                              {stamp.venue?.name ?? stamp.eventName}
                            </h4>
                            <p className="text-xs text-zinc-400 truncate">
                              {stamp.venue?.city ||
                                stamp.location ||
                                "Republic Venue"}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full mt-1">
                              +{stamp.xpEarned} XP
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
                          <span>{stamp.eventName}</span>
                          <span>
                            {new Date(stamp.eventDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        {stamp.venueId && (
                          <Link
                            href={`/venues/${stamp.venueId}`}
                            className="absolute inset-0 rounded-2xl"
                            title="View Venue"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MILESTONE BADGES */}
          {activeTab === "badges" && (
            <div className="space-y-4">
              {badges.length === 0 ? (
                <div className="rounded-3xl bg-zinc-950/40 border border-zinc-800/80 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-3">
                    <span className="material-symbols-outlined text-3xl">
                      military_tech
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    No Badges Earned Yet
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Milestone badges are awarded for exploring multiple venues,
                    creating community posts, and climbing citizen tiers.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map((ub: CitizenBadge) => {
                    const rarity = ub.badge.rarity?.toLowerCase() || "common";
                    const styling =
                      RARITY_COLORS[rarity] || RARITY_COLORS.common;

                    return (
                      <div
                        key={ub.id}
                        className={`rounded-2xl bg-zinc-950/70 p-4 border transition-all ${styling.border} flex items-start gap-3.5`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${styling.badge} ${styling.text}`}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            {ub.badge.icon || "military_tech"}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-white">
                              {ub.badge.name}
                            </h4>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${styling.badge} ${styling.text}`}
                            >
                              {rarity}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {ub.badge.description}
                          </p>
                          <p className="text-[10px] text-zinc-500 pt-0.5">
                            Unlocked{" "}
                            {new Date(ub.earnedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REPUBLIC ACTIVITY & POSTS */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="rounded-3xl bg-zinc-950/40 border border-zinc-800/80 p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-3">
                    <span className="material-symbols-outlined text-3xl">
                      chat
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    No Republic Posts Yet
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    This citizen hasn&apos;t shared any experiences or
                    announcements in the Republic Foxer feed yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 p-4 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 font-bold uppercase text-[10px] border border-zinc-800">
                          {post.type.replace(/_/g, " ")}
                        </span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-200 whitespace-pre-line mb-3 leading-relaxed">
                        {post.content}
                      </p>

                      {/* Attached media preview */}
                      {post.mediaUrls?.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                          {post.mediaUrls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Media"
                              className="w-28 h-20 object-cover rounded-xl border border-zinc-800 shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      {/* Engagement strip */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-900 text-xs text-zinc-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                              favorite
                            </span>
                            {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                              chat_bubble
                            </span>
                            {post.commentsCount}
                          </span>
                        </div>
                        <Link
                          href={`/republic?postId=${post.id}`}
                          className="text-lime-400 hover:underline font-bold text-xs"
                        >
                          View in Feed →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OFFERINGS */}
          {activeTab === "offerings" && hasOfferings && (
            <div className="space-y-6">
              {/* Venues */}
              {(profile.venues?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      domain
                    </span>
                    Venues Hosted
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.venues?.map((v) => (
                      <Link
                        key={v.id}
                        href={`/venues/${v.id}`}
                        className="group rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-lime-400/50 p-3 transition-all flex gap-3"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                          {v.images?.[0]?.url ? (
                            <img
                              src={v.images[0].url}
                              alt={v.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <span className="material-symbols-outlined">
                                domain
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-white truncate group-hover:text-lime-400 transition-colors">
                            {v.name}
                          </h4>
                          <p className="text-xs text-zinc-400">{v.city}</p>
                          <p className="text-xs font-bold text-lime-400 mt-1">
                            ₱{Number(v.price).toLocaleString()} /{" "}
                            {v.billingRate}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {(profile.services?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      stars
                    </span>
                    Talent & Services
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.services?.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-3 flex gap-3"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                          {s.images?.[0]?.url ? (
                            <img
                              src={s.images[0].url}
                              alt={s.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <span className="material-symbols-outlined">
                                work
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {s.name}
                          </h4>
                          <p className="text-xs text-zinc-400 capitalize">
                            {s.category.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs font-bold text-lime-400 mt-1">
                            ₱{Number(s.price).toLocaleString()} /{" "}
                            {s.billingRate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gear */}
              {(profile.assets?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      devices
                    </span>
                    Gear & Equipment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.assets?.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 p-3 flex gap-3"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                          {a.images?.[0]?.url ? (
                            <img
                              src={a.images[0].url}
                              alt={a.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <span className="material-symbols-outlined">
                                videocam
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {a.name}
                          </h4>
                          <p className="text-xs text-zinc-400 capitalize">
                            {a.category.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs font-bold text-lime-400 mt-1">
                            ₱{Number(a.price).toLocaleString()} /{" "}
                            {a.billingRate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
