"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useNotifications } from "../hooks/useNotifications";
import { Notification } from "../types";
import LandingHeader from "@/shared/components/layout/LandingHeader";

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  BOOKING_CONFIRMED: {
    icon: "check_circle",
    color: "text-green-300",
    bg: "bg-green-500/10",
  },
  BOOKING_CANCELLED: {
    icon: "event_busy",
    color: "text-red-300",
    bg: "bg-red-500/10",
  },
  role_request_approved: {
    icon: "verified",
    color: "text-green-300",
    bg: "bg-green-500/10",
  },
  role_request_rejected: {
    icon: "block",
    color: "text-red-300",
    bg: "bg-red-500/10",
  },
  follow_request: {
    icon: "person_add",
    color: "text-lime-300",
    bg: "bg-lime-500/10",
  },
  new_follower: {
    icon: "person_add",
    color: "text-lime-300",
    bg: "bg-lime-500/10",
  },
  follow_request_accepted: {
    icon: "how_to_reg",
    color: "text-green-300",
    bg: "bg-green-500/10",
  },
  message_request: {
    icon: "mark_chat_unread",
    color: "text-lime-300",
    bg: "bg-lime-500/10",
  },
  message_request_accepted: {
    icon: "forum",
    color: "text-green-300",
    bg: "bg-green-500/10",
  },
  "message:mention": {
    icon: "alternate_email",
    color: "text-lime-300",
    bg: "bg-lime-500/10",
  },
};

const fallbackMeta = {
  icon: "notifications",
  color: "text-accent",
  bg: "bg-accent/10",
};

function getMeta(type: string) {
  return TYPE_META[type] ?? fallbackMeta;
}

export default function NotificationListClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    if (isAuthenticated === false) router.replace("/");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const t = setTimeout(() => setIsInitial(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleItemClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);
    const link = n.metadata?.link as string | undefined;
    if (link) {
      router.push(link);
    }
  };

  if (isInitial || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="h-10 w-10 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="grow pt-20 sm:pt-32 pb-28 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="hidden sm:flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
              <span className="text-accent font-semibold">Notifications</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-black">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 font-bold text-xs hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-white/20 text-6xl mb-4">
                notifications_off
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-text-muted mb-6">
                You&apos;ll see booking updates and other activity here.
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-4 rounded-xl bg-accent text-black font-bold transition-all"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3">
              {notifications.map((n) => {
                const meta = getMeta(n.type);
                const link = n.metadata?.link as string | undefined;
                return (
                  <li
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`group flex items-start gap-4 rounded-2xl border border-white/5 p-5 transition-all ${
                      n.isRead
                        ? "bg-white/2 hover:bg-white/4"
                        : "bg-white/5 hover:bg-white/[0.07] border-l-2 border-l-accent"
                    } ${link ? "cursor-pointer" : ""}`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
                    >
                      <span
                        className={`material-symbols-outlined text-[22px] ${meta.color}`}
                      >
                        {meta.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display font-bold text-white text-sm md:text-base">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                        )}
                      </div>
                      {n.message && (
                        <p className="text-sm text-text-muted mt-1 whitespace-pre-line leading-relaxed">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[11px] text-white/30 mt-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {link && (
                      <span className="material-symbols-outlined text-white/30 text-[18px] self-center group-hover:text-accent transition-colors">
                        chevron_right
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
