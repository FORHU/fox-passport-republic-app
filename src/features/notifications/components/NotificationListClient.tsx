"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useNotifications } from "../hooks/useNotifications";
import { Notification } from "../types";

const TYPE_META: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
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
  const { user, isAuthenticated } = useAuthStore();
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

  const getDashboardPath = () => {
    switch (user?.role?.toLowerCase() || user?.systemRole) {
      case "admin":
      case "super_admin":
        return "/admin";
      case "host":
      case "mayor":
      case "foxer":
        return "/creator-dashboard";
      default:
        return "/user";
    }
  };

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
      <header className="fixed top-6 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="glass-panel rounded-full px-6 h-20 flex items-center justify-between shadow-2xl hover:bg-black/40 transition-colors duration-500">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined text-[24px]">
                  explore
                </span>
              </div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-white group-hover:text-accent transition-colors">
                FoxPassport
              </h2>
            </Link>
            <nav className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Explore
              </Link>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Bookings
              </Link>
              <span className="px-6 py-2.5 rounded-full text-sm font-bold text-black bg-accent">
                Notifications
              </span>
            </nav>
            <div
              className="h-10 w-10 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:border-accent transition-colors"
              onClick={() => router.push(getDashboardPath())}
            >
              {user?.imgId ? (
                <img
                  alt="User"
                  className="h-full w-full object-cover"
                  src={user.imgId}
                />
              ) : (
                <div className="h-full w-full bg-[#ccff00] flex items-center justify-center text-black font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="grow pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
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
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
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
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 font-bold text-xs hover:bg-white/10 hover:text-white transition-all"
                >
                  Mark all as read
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
                className="inline-block px-8 py-4 rounded-xl bg-accent text-black font-bold hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"
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
                        ? "bg-white/[0.02] hover:bg-white/[0.04]"
                        : "bg-white/[0.05] hover:bg-white/[0.07] border-l-2 border-l-accent"
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
