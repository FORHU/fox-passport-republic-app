"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Heart,
  Briefcase,
  MessageSquare,
  User,
  Settings,
  HelpCircle,
  UserPlus,
  LogOut,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useLogout } from "@/shared/auth/useLogout";
import { CurrencySwitcher } from "@/shared/components/layout/CurrencySwitcher";
import { ThemeSwitcher } from "@/shared/components/layout/ThemeSwitcher";
import { useUnreadMessagesCount } from "@/shared/hooks/useUnreadMessagesCount";

interface UserMenuNavLinksProps {
  userId?: string | null;
  /** False for admins and for users who already hold every role. */
  canApply: boolean;
  syncing: boolean;
  onSync: () => void;
  onClose: () => void;
}

export function UserMenuNavLinks({
  userId,
  canApply,
  syncing,
  onSync,
  onClose,
}: UserMenuNavLinksProps) {
  const router = useRouter();
  const logout = useLogout();
  const { unreadCount: unreadMessages } = useUnreadMessagesCount();

  const navItems = [
    ...(userId
      ? [
          {
            label: "My Public Passport",
            icon: User,
            href: `/user/${userId}`,
          },
        ]
      : []),
    { label: "Wishlists", icon: Heart, href: "/wishlists" },
    {
      label: "Trips",
      icon: Briefcase,
      href: "/trips",
      comingSoon: true,
    },
    { label: "My Bookings", icon: Briefcase, href: "/booking" },
    // Every role's calendar — bookings, hosted events, venue dates, jobs.
    { label: "Calendar", icon: CalendarDays, href: "/calendar" },
    {
      label: "QR Check-In Scanner",
      icon: QrCode,
      href: "/scanner",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/messages",
      badge: unreadMessages > 0 ? (unreadMessages > 9 ? "9+" : unreadMessages) : undefined,
    },
    // The header bell is hidden below `sm`, so on a phone this is the way in.
    { label: "Notifications", icon: Bell, href: "/notifications" },
    {
      label: "Account settings",
      icon: Settings,
      href: "/user/settings",
    },
    // Email check for booking, and the status of role-application documents.
    { label: "Verification", icon: ShieldCheck, href: "/kyc" },
    {
      label: "Help Center",
      icon: HelpCircle,
      href: "/help",
      comingSoon: true,
    },
  ];

  return (
    <>
      <div className="px-2 py-2 border-b border-white/5 space-y-0.5">
        {navItems.map((item) => {
          const comingSoon = (item as { comingSoon?: boolean }).comingSoon;
          // Not built yet: a real disabled row, like "Install the app" below,
          // instead of a button that only toasts.
          if (comingSoon) {
            return (
              <button
                key={item.label}
                type="button"
                disabled
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-not-allowed"
              >
                <item.icon className="w-4 h-4 text-white/30 shrink-0" />
                <span className="text-sm text-white/40">{item.label}</span>
                <span className="ml-auto text-[9px] font-bold text-white/30 uppercase tracking-wider">
                  Soon
                </span>
              </button>
            );
          }
          return (
          <button
            key={item.label}
            onClick={() => {
              onClose();
              router.push(item.href);
            }}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <item.icon className="w-4 h-4 text-white/40 group-hover:text-accent transition-colors shrink-0" />
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">
              {item.label}
            </span>
            {(item as { badge?: string | number }).badge !== undefined && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-black">
                {(item as { badge?: string | number }).badge}
              </span>
            )}
          </button>
          );
        })}
        <CurrencySwitcher />
        <ThemeSwitcher />
        {/* The mobile app isn't built yet. A real disabled button, so it is
            skipped by the keyboard and announced as unavailable. */}
        <button
          type="button"
          disabled
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-not-allowed"
        >
          <Smartphone className="w-4 h-4 text-white/30 shrink-0" />
          <span className="text-sm text-white/40">Install the app</span>
          <span className="ml-auto text-[9px] font-bold text-white/30 uppercase tracking-wider">
            Soon
          </span>
        </button>
        {canApply && (
          <button
            onClick={() => {
              onClose();
              router.push("/onboarding");
            }}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-accent/5 transition-colors group cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-accent/60 group-hover:text-accent transition-colors shrink-0" />
            <span className="text-sm text-accent/60 group-hover:text-accent transition-colors font-medium">
              Apply for a Role
            </span>
          </button>
        )}
      </div>

      {/* Sync + Logout */}
      <div className="px-2 py-2 space-y-0.5">
        <button
          onClick={onSync}
          disabled={syncing}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors group disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors shrink-0 ${
              syncing ? "animate-spin" : ""
            }`}
          />
          <span className="text-sm text-white/50 group-hover:text-blue-400 transition-colors">
            {syncing ? "Syncing account…" : "Sync Account"}
          </span>
        </button>
        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-400 transition-colors shrink-0" />
          <span className="text-sm text-white/50 group-hover:text-red-400 transition-colors">
            Log out
          </span>
        </button>
      </div>
    </>
  );
}
